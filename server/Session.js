var Document = require('../lib/ot/CodeDocument.js');

function removeFromArray(arr, val) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i] == val) arr.splice(i, 1);
	}
}

function Session(sessionId, defaultDoc) {
	this.sessionId = sessionId;

	this.doc = new Document(defaultDoc);	// The 'master' document that the server knows
	this.workspace = {};

	this.clients = [];				// List of clients' ids
	this.sockets = [];				// List of client sockets
	this.clientNames = {};			// Dict of clients' names
}

Session.prototype = {

	send: function(socket, fn, args) {
		var payload = JSON.stringify( {'fn': fn, 'args': args} );
		socket.write(payload);
	},

	sendAll: function(fn, args) {
		var payload = JSON.stringify( {'fn': fn, 'args': args} );
		for(var i = 0; i < this.sockets.length; i++) {
			this.sockets[i].write(payload);
		}
	},

	addClient: function(client, socket, name) {
		name = name || 'Guest';
		this.clients.push( client );
		this.sockets.push( socket );
		this.clientNames[ client ] = name;

		this.send(socket, 'welcome', { 	'id' : client,
										'clients': this.clientNames	});

		this.send(socket, 'setWorkspace', this.workspace	);

		this.send(socket, 'setDoc', { 	'doc': this.doc.text,
										'filename': this.doc.filename,
										'filepath': this.doc.filepath,
										'sels': this.doc.cursors,
										'rev': this.doc.history.length	});
										

		this.sendAll( 'joined', { 	'id' : client,
									'name' : name	});
	},

	removeClient: function(client, socket) {
		this.sendAll( 'left', { 	'id' : client,
									'name' : this.clientNames[client]	});

		removeFromArray(this.clients, client);
		removeFromArray(this.sockets, socket);
		delete this.clientNames[ client ];

		this.doc.removeCursor(client);
	},

	reqDoc: function(filename, filepath) {
		this.sendAll( 'reqDoc', {	'filename': filename,
									'filepath': filepath	} );
	},

	setDocAsync: function(filename, filepath, fn) {
		this.sendAll( 'reqDoc', {	'filename': filename,
									'filepath': filepath	} );

		fn( (function(file) {
			this.setDoc(file, filename, filepath);
		}).bind(this),
		(function(errorMsg) {
			this.sendAll( 'reqDoc', {	'error': errorMsg	} );
		}).bind(this));
	},

	setDoc: function(str, filename, filepath) {
		this.doc.setText(str);
		this.sendAll( 'setDoc', {	'doc': this.doc.text,
									'filename': filename,
									'filepath': filepath,
									'sels': this.doc.cursors,
									'rev': this.doc.history.length	} );
		console.log(this.doc.text.length);
	},

	setWorkspaceAsync: function(user, repo, fn) {
		this.sendAll( 'reqWorkspace', {	'user': user,
										'repo': repo	} );

		fn( (function(workspace) {
			this.setWorkspace(workspace);
		}).bind(this),
		(function(errorMsg) {
			this.sendAll( 'reqWorkspace', {	'error': errorMsg } );
		}).bind(this));
	},

	reqWorkspace: function(user, repo) {
		this.sendAll( 'reqWorkspace', {	'user': user,
										'repo': repo	} );
	},

	setWorkspace: function(workspace) {
		this.workspace = workspace;
		this.sendAll( 'setWorkspace', this.workspace );
	},

	setWorkTreeState: function(path, isopen) {
		this.sendAll( 'setWorkTreeState', { 'path' : path, 'isopen' : isopen } );
	},

	applyOp: function(client, op, rev) {
		op = this.doc.apply(op, rev);
		this.sendAll( 'opText', {'id': client, 'op': op} );
	},

	applyCursor: function(client, cursor) {
		this.doc.setCursor(client, cursor);
		this.sendAll( 'opCursor', {'id': client, 'sel': cursor} );
	}

};

module.exports = Session;
