var ot = require('./ot.js');

function xformSel(sel, op) {
	for(var i = 0; i < sel.length; i++ ) {
		sel[i] = [	ot.xformIdx( sel[i][0], op ),
					ot.xformIdx( sel[i][1], op )	];
	}
	return sel;
}

// TODO: make this a Web Worker?

function Client() {
	this.doc = '';					// The 'master' document that the server knows
	this.rev = 0;					// Current document revision number that the server knows

	this.workspace = {};
	this.clientDoc = '';			// The current document from the client's point of view
	this.clientId = 0;				// ID for this client
	this.clientNames = {};			// Dict of other clients' names
	this.clientCursors = {};		// Dict of other clients' cursors

	this.pending = [];				// Operation that has been sent but not ACKed
	this.buffer = [];				// Buffer of operations applied since last operation was sent (often empty)
}

Client.prototype = {

	sendOp: function(op) {
		// Empty implementation, should be overriden by instance

	},

	sendCursor: function(cursor) {
		// Empty implementation, should be overriden by instance
	},

	// TODO: clean this up
	getCursors: function() {
		var cursors = [];
		for(var key in this.clientCursors) {
			if(this.clientCursors.hasOwnProperty(key)) {
				cursors.push({ 	'name': this.clientNames[key],
								'sel' : this.clientCursors[key]	});
			}
		}
		return cursors;
	},

	setDoc: function(doc, rev, cursors) {
		this.doc = doc;
		this.clientDoc = doc;
		this.rev = rev;		
		this.pending = [];
		this.buffer = [];
		this.clientCursors = cursors;
		//console.log(this.doc.length);
	},

	// Reset the document
	reset: function(args) {
		this.setDoc(args);
		if(args.id) this.clientId = args.id;

		if(args.clients) this.clientNames = args.clients;
		else this.clientNames = {};
	},

	// Another client has joined
	addPeer: function(args) {
		if( args.id !== this.clientId ) {
			this.clientNames[ args.id ] = args.name;
			this.clientCursors[ args.id ] = [];
		}
	},

	// A peer has left
	removePeer: function(args) {
		delete this.clientNames[ args.id ];
		delete this.clientCursors[ args.id ];
	},

	getPeers: function() {
		var peers = [];
		for(key in this.clientNames) {
			if(this.clientNames.hasOwnProperty(key)) {
				if(key != this.clientId)
					peers.push( this.clientNames[key] );
			}
		}
		console.log(this.clientId);
		console.log(this.clientNames);
		return peers;
	},

	// Update the document based on the message received
	applyExternalOp: function(args) {
		// Apply the operation and increment the document revision number
		this.doc = ot.applyOp(this.doc, args.op);
		this.rev++;

		if( args.id === this.clientId ) {
			// This is an acknowledgement of our operation
			if( this.buffer.length ) {
				// Flush the buffer and send it to the server
				this.pending = this.buffer;
				this.sendOp( this.pending );
				this.buffer = [];
			} else {
				// We are now synchronized - woo hoo!
				this.pending = [];
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
				return args.op;
			}
		}
		return [];
	},

	applyInternalOp: function(op) {
		op = ot.packOp(op);
		this.clientDoc = ot.applyOp(this.clientDoc, op);

		// Transform other selections
		for(var clientId in this.clientCursors) {
			if( this.clientCursors.hasOwnProperty(clientId) ) {
				this.clientCursors[ clientId ] = xformSel( this.clientCursors[ clientId ], op );
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
			this.sendOp(op);
		}
	},

	applyInternalSel: function(sel) {
		this.sendCursor(sel);
	},

	applyExternalSel: function(args) {
		if( args.id !== this.clientId ) {
			var sel = args.sel;
			if( this.pending.length ) sel = xformSel ( sel, this.pending );
			if( this.buffer.length ) sel = xformSel( sel, this.buffer );
			this.clientCursors[ args.id ] = sel;
		}
	}
};

module.exports = Client;
