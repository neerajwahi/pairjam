var ot = require('./ot.js');

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
	this.clientCursors = {};		// Dict of clients' cursors (both position and selection)

	this.workspace = {};
}

// TODO: Decouple from protocol knowledge
Session.prototype = {
	// Send a message from the server
	send: function(clientId, msg, args) {
		// Empty implementation
		console.log('Warning: Server.send not implemented.');
	},

	sendAll: function(clientId, msg, args) {
		// Empty implementation
		console.log('Warning: Server.sendAll not implemented.');
	},

	setWorkspace: function(wsp) {
		this.workspace = wsp;
	},

	getDoc: function() {
		return this.doc;
	},

	setDoc: function(clientId, str, filename, filepath) {
		this.doc = str;
		this.history = [];
		this.clientCursors = {};

		this.sendAll( clientId, 'setDoc', {	'doc' :  this.doc,
											'sels' : this.clientCursors,
											'rev' :  this.history.length,
											'filename' : filename,
											'filepath' : filepath		});
	},

	getClients: function() {
		return this.clientIds;
	},

	addClient: function(clientId, name) {
		name = name || 'Guest';

		this.clientIds.push( clientId );
		this.clientNames[ clientId ] = name;
		this.send( clientId, 'welcome', {	'id' :   clientId,
											'sels' : this.clientCursors,
											'clients' : this.clientNames });

		this.send( clientId, 'setDoc', {	'doc' :  this.doc,
											'sels' : this.clientCursors,
											'rev' :  this.history.length });

		if(this.workspace) {
			this.send( clientId, 'setGitRepo', { 	'user' : this.workspace.user,
			                               				'repo' : this.workspace.repo,
			                                            'tree' : this.workspace.tree  	});
		}

		this.sendAll( clientId, 'joined',  {	'id' : clientId,
												'name' : name	});
	},

	removeClient: function(clientId) {
		console.log('Client left, id = ' + clientId);
		this.sendAll( clientId, 'left',  {	'id' : clientId,
											'name' : this.clientNames[ clientId ]	});
		removeFromArray(this.clientIds, clientId);
		delete this.clientNames[ clientId ];
		delete this.clientCursors[ clientId ];
	},

	applyOp: function(clientId, args) {
		try {

			var priorOps = this.history.slice(args.rev);
			var op = args.op;
			for(var i = 0; i < priorOps.length; i++) {
				op = ot.xform(op, priorOps[i])[0];
			}

			this.doc = ot.applyOp(this.doc, op);
			this.history.push(op);

			args.op = op;

			this.sendAll(clientId, 'opText', args);

		} catch(err) {

			console.error( this.history.length );

			//TODO: handle errors more gracefully
			this.history = [];
			this.sendAll(clientId, 'setDoc', {	'doc' : this.doc,
												'rev' :  this.history.length	});
		}
	},

	applySel: function(clientId, args) {
		this.clientCursors[ clientId ] = args.sel;
		this.sendAll(clientId, 'opCursor', {	'id' : clientId,
												'sel' : args.sel	} );
	}
};

module.exports = Session;
