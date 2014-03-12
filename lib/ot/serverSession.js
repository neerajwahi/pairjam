var ot = require('./ot.js');
var crypto = require('crypto');

function removeFromArray(arr, val) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i] == val) arr.splice(i, 1);
	}
}

function Session(sessionId, defaultDoc) {
	this.doc = defaultDoc;			// The 'master' document that the server knows
	this.sessionId = sessionId;

	this.history = [];				// History of prior operations
	this.clientIds = [];			// List of clients' ids
	this.clientNames = {};			// Dict of clients' names
	this.clientSels = {};			// Dict of clients' text selections
}

// TODO: Decouple from protocol knowledge
Session.prototype = {
	getDoc : function() {
		return this.doc;
	},

	setDoc : function(clientId, str, filename) {
		this.doc = str;
		this.history = [];
		this.clientSels = {};

		this.sendAll( clientId, 'setDoc', {	'doc' :  this.doc,
											'sels' : this.clientSels,
											'rev' :  this.history.length,
											'filename' : filename		});
	},

	getClients : function() {
		return this.clientIds;
	},

	// Send a message from the server
	send : function(clientId, msg, args) {
		// Empty implementation
		console.log('Warning: Server.send not implemented.');
	},

	sendAll : function(clientId, msg, args) {
		// Empty implementation
		console.log('Warning: Server.sendAll not implemented.');
	},

	addClient : function(clientId, name) {
		name = name || 'Guest';

		this.clientIds.push( clientId );
		this.clientNames[ clientId ] = name;
		this.send( clientId, 'welcome', {	'id' :   clientId,
											'doc' :  this.doc,
											'sels' : this.clientSels,
											'rev' :  this.history.length,
											'clients' : this.clientNames });
		this.sendAll( clientId, 'joined',  {	'id' : clientId,
												'name' : this.client	});
	},

	removeClient : function(clientId) {
		console.log('Client left, id = ' + clientId);
		this.sendAll( clientId, 'left',  {	'id' : clientId,
											'name' : this.client	});
		removeFromArray(this.clientIds, clientId);
		delete this.clientNames[ clientId ];
		delete this.clientSels[ clientId ];
	},

	applyOp : function(clientId, args) {
		try {

			var priorOps = this.history.slice(args.rev);
			var op = args.op;
			for(var i = 0; i < priorOps.length; i++) {
				op = ot.xform(op, priorOps[i])[0];
			}

			this.doc = ot.applyOp(this.doc, op);

			//var docHash = crypto.createHash('sha1').update(doc).digest('hex');
			//args.serverHash = docHash;
			args.op = op;

			this.history.push(op);

			this.sendAll(clientId, 'opText', args);

		} catch(err) {

			console.error( this.history.length );
			//throw new Error(err);
			this.history = [];
			var docHash = crypto.createHash('sha1').update(this.doc).digest('hex');
			this.sendAll(clientId, 'setDoc', {	'doc' : this.doc,
												'serverHash' : docHash,
												'rev' :  this.history.length	});
		}
	},

	applySel : function(clientId, args) {
		this.clientSels[ clientId ] = args.sel;
		this.sendAll(clientId, 'opSel', {	'id' : clientId,
											'sel' : args.sel	} );
	}
};

module.exports = Session;
