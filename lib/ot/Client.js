var ot = require('./ot.js');

function Client() {
	this.doc = '';					// The 'master' document that the server knows
	this.rev = 0;					// Current document revision number that the server knows

	this.workspace = {};
	this.clientDoc = '';			// The current document from the client's point of view
	this.clientId = 0;				// ID for this client
	this.clients = {};				// Dict of other clients
	this.clientCursors = {};		// Dict of other clients' cursors

	this.pending = [];				// Operation that has been sent but not ACKed
	this.buffer = [];				// Buffer of operations applied since last operation was sent (often empty)
	this.pendingCur = null;
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
		return this.clientCursors;
	},

	setDoc: function(doc, rev, cursors) {
		this.doc = doc;
		this.clientDoc = doc;
		this.rev = rev;
		this.pending = [];
		this.buffer = [];
		this.pendingCur = null;
		this.clientCursors = cursors;

		if(this.clientCursors && this.clientCursors[this.clientId]) {
			delete this.clientCursors[this.clientId];
		}
		//console.log(this.doc.length);
	},

	// Reset the document
	reset: function(args) {
		this.setDoc(args);
		if (args.id) this.clientId = args.id;

		if (args.clients) {
			this.clients = args.clients;
			if (this.clients[this.clientId]) {
				delete this.clients[this.clientId];
			}
		} else this.clients = {};

		console.log('Me = ' + this.clientId);
		console.log(this.clients);
	},

	// Another client has joined
	addPeer: function(client) {
		if (client.id !== this.clientId) {
			console.log(client.id + ' joined');
			console.log(this.clients);

			this.clients[client.id] = client;
			this.clientCursors[client.id] = [];
		}
	},

	// A peer has left
	removePeer: function(client) {
		console.log(client.id + ' left');
		console.log(this.clients);

		//TODO: is this working?
		delete this.clients[client.id];
		delete this.clientCursors[client.id];
	},

	setPeer: function(client) {
		this.clients[client.id] = client;
	},

	getPeers: function() {
		var peers = [];
		Object.keys(this.clients).forEach(function(i) {
			if(i !== this.clientId) {
				peers.push(this.clients[i].name);
			}
		});
		return peers;
	},

	// Update the document based on the message received
	applyExternalOp: function(args) {
		// Apply the operation and increment the document revision number
		this.doc = ot.applyOp(this.doc, args.op);
		this.rev++;

		if(args.id === this.clientId) {
			// This is an acknowledgement of our operation
			if(this.buffer.length) {
				// Flush the buffer and send it to the server
				this.pending = this.buffer;
				this.sendOp(this.pending);
				if(this.pendingCur) {
					this.sendCursor(this.pendingCur);
					this.pendingCur = null;
				}
				this.buffer = [];
			} else {
				// We are now synchronized - woo hoo!
				this.pending = [];
			}
		} else {

			// TODO: should this be here?
			// Transform other selections
			for (var id in this.clientCursors) {
				if( this.clientCursors.hasOwnProperty(id) ) {
					var cursor = this.clientCursors[id];
					this.clientCursors[id] = [ ot.xformIdx( cursor[0], args.op ), ot.xformIdx( cursor[1], args.op ) ];
				}
			}

			if (this.pending.length) {
				if (this.buffer.length) {
					var xform1 = ot.xform(this.pending, args.op);
					var xform2 = ot.xform(this.buffer, xform1[1]);
					this.pending = xform1[0];
					this.buffer = xform2[0];
					this.clientDoc = ot.applyOp(this.clientDoc, xform2[1]);
					return xform2[1];
				} else {
					var xform = ot.xform(this.pending, args.op);
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
		Object.keys(this.clientCursors).forEach((function(id) {
			var cursor = this.clientCursors[id];
			this.clientCursors[id] = [ot.xformIdx( cursor[0], op ), ot.xformIdx( cursor[1], op )];
		}).bind(this));

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
		if(!this.buffer.length) {
			this.sendCursor(sel);
			this.pendingCur = null;
		} else {
			this.pendingCur = sel;
		}
	},

	applyExternalSel: function(args) {
		if( args.id !== this.clientId ) {
			var sel = args.sel;
			if(this.pending.length) {
				sel = [ot.xformIdx(sel[0], this.pending), ot.xformIdx(sel[1], this.pending)];
			}
			if(this.buffer.length)  {
				sel = [ot.xformIdx(sel[0], this.buffer), ot.xformIdx(sel[1], this.buffer)];
			}
			this.clientCursors[args.id] = sel;
		}
	}
};

module.exports = Client;
