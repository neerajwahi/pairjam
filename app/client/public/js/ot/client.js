var ot = require('./ot.js');

function xformSel(sel, op) {
	for(var i = 0; i < sel.length; i++ ) {
		sel[i] = [ 	ot.xformIdx( sel[i][0], op ),
					ot.xformIdx( sel[i][1], op )	];
	}
	return sel;
}

function writeLog(str) {
	//console.log(str);
}

function debugDump(obj) {
	console.log( obj.doc === obj.clientDoc );
	console.log( JSON.stringify(obj) );
	throw new Error();
}

function Client() {
	this.doc = '';					// The 'master' document that the server knows
	this.clientDoc = '';			// The current document from the client's point of view
	this.rev = 0;					// Current revision number
	this.clientId = 0;				// ID for this client
	this.clientNames = {};			// Dict of other clients' names
	this.clientSels = {};			// Dict of other clients' text clientSelsections

	this.pending = [];				// Operation that has been sent but not ACKed, if there is one
	this.buffer = [];				// Buffer of operations applied since last operation was sent
}

Client.prototype = {
	'setClientDoc' : function(str) {
		this.clientDoc = str;
	},

	'getClientDoc' : function() {
		return this.clientDoc;
	},

	'getSelections' : function() {
		return this.clientSels;
	},

	// Send a message to the server
	'send' : function(clientId, msg, args) {
		// Empty implementation, should be overriden
	},

	// Reset the document
	'reset' : function(args) {
		this.doc = args.doc;
		this.clientDoc = this.doc;
		this.rev = args.rev;		
		this.pending = [];
		this.buffer = [];
		this.clientSels = args.sels;
		if(args.id) this.clientId = args.id;

		writeLog('WELCOME MESSAGE');
		writeLog('Client id: ' + this.clientId);
		writeLog('Rev: ' + this.rev);
	},

	// Another client has joined
	'addPeer' : function(args) {
		if( args.id !== this.clientId ) {
			writeLog('Peer joined, id = ' + args.id + ', name = ' + args.name);
			this.clientNames[ args.id ] = args.name;
			this.clientSels[ args.id ] = [];
		}
	},

	// A peer has left
	'removePeer' : function(args) {
		writeLog('Peer left, id = ' + args.id + ', name = ' + args.name);
		delete this.clientNames[ args.id ];
		delete this.clientSels[ args.id ];
	},

	// Update the document based on the message received
	'applyExternalOp' : function(args) {

		this.doc = ot.applyOp(this.doc, args.op);
		this.rev++;

		writeLog( '-- Client ID: ' + this.clientId);
		writeLog( 'Received new op: ' + JSON.stringify(args.op) );
		writeLog( 'Doc rev: ' + this.rev);

		if( args.id === this.clientId ) {
			// This is an acknowledgement of our operation
			writeLog( 'Received ack.' );

			if( this.buffer.length ) {
				// Flush the buffer and send it to the server
				this.pending =this.buffer;

				this.send( this.clientId, 'op', 	{	'id' : this.clientId,
															'rev' : this.rev,
															'op' : this.pending 	} 	);
				this.buffer = [];

				writeLog('Flushed buffer.');
				writeLog('Sent op: ' + JSON.stringify(this.pending) );
			} else {
				// We are now synchronized - woo hoo!
				this.pending = [];
				if(this.clientDoc !== this.doc) debugDump(this);
			}
		} else {
			if( this.pending.length ) {
				if( this.buffer.length ) {
					var xform1 = ot.xform( this.pending, args.op );
					var xform2 = ot.xform( this.buffer, xform1[1] );
					this.pending = xform1[0];
					this.buffer = xform2[0];
					this.clientDoc = ot.applyOp(this.clientDoc, xform2[1]);
					return xform2[1];
				} else {
					var xform = ot.xform( this.pending, args.op );
					this.pending = xform[0];
					this.clientDoc = ot.applyOp(this.clientDoc, xform[1]);
					return xform[1];
				}
			} else {
				this.clientDoc = ot.applyOp(this.clientDoc, args.op);
				if(this.clientDoc !== this.doc) debugDump(this);
				return args.op;
			}
		}
		return [];
	},

	'applyInternalOp' : function(op) {
		op = ot.packOp(op);
		this.clientDoc = ot.applyOp(this.clientDoc, op);

		// Transform other selections
		for(var clientId in this.clientSels) {
			if( this.clientSels.hasOwnProperty(clientId) ) {
				this.clientSels[ clientId ] = xformSel( this.clientSels[ clientId ], op );
			}
		}

		if( this.pending.length ) {
			// We already sent an operation, so add this one to the buffer and don't send yet
			if(this.buffer.length) {
				this.buffer = ot.compose(this.buffer, op);
			} else {
				this.buffer = op;
			}
		} else {
			this.pending = op;
			this.send( this.clientId, 'op', {	'id' : this.clientId,
														'rev' : this.rev,
														'op' : op 			}	);
		}

		
		writeLog( '++ Client ID: ' + this.clientId );
		writeLog( 'New op: ' + JSON.stringify(op) );
		writeLog( 'Sent op: ' + JSON.stringify(this.pending) );
		writeLog( 'Buffer: ' + JSON.stringify(this.buffer) );
		writeLog( 'Doc rev: ' + this.rev );
	},

	'applyInternalSel' : function(sel) {
		this.send( this.clientId,	'sel', { 	'id' : this.clientId,
													'rev' : this.rev,
													'sel' : sel 			} );
	},

	'applyExternalSel' : function(args) {
		if( args.id !== this.clientId ) {
			var sel = args.sel;
			if( this.pending.length ) sel = xformSel ( sel, this.pending );
			if( this.buffer.length ) sel = xformSel( sel, this.buffer );
			this.clientSels[ args.id ] = sel;
		}
		return this.clientSels;
	}
};

module.exports = Client;
