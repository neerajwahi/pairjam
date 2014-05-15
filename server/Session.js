var Document = require('../lib/ot/CodeDocument.js');
var logger = require('winston');

function Session(sessionId) {
	this.sessionId = sessionId;

	var defDoc = 'Welcome!\n\n' +
				 'Share the link below to collaborate:\n' +
				 'pairjam.com/#' + sessionId;

	// The 'master' document that the server knows
	this.doc = new Document(defDoc);
	this.workspace = {};

	this.clients = {};
	this.sockets = {};
}

Session.prototype = {
	send: function(client, fn, args) {
		var payload = JSON.stringify({'fn': fn, 'args': args});
		this.sockets[client.id].send(payload, function(err) {
			if(err) {
				logger.log('debug', err);
			}
		});
	},

	sendAll: function(fn, args) {
		var payload = JSON.stringify({'fn': fn, 'args': args});
		Object.keys(this.clients).forEach((function(i) {
			this.sockets[i].send(payload, function(err) {
				if(err) {
					logger.log('debug', err);
				}
			});
		}).bind(this));
	},

	generateClientId: function() {
		var clientId = 1;
		Object.keys(this.clients).forEach(function(i) {
			if(parseInt(i) >= clientId) clientId = parseInt(i)+1;
		});
		return clientId;
	},

	addClient: function(socket, name) {
		name = name || 'Guest';
		clientId = this.generateClientId();

		var client = {
			id: clientId,
			name: name,
			videoStream: false
		};

		this.clients[clientId] = client;
		this.sockets[clientId] = socket;

		this.send(client, 'welcome', {'id' : client.id,
									  'clients': this.clients});

		this.send(client, 'setWorkspace', this.workspace);

		this.send(client, 'setDoc', {'doc': this.doc.text,
									 'filename': this.doc.filename,
									 'filepath': this.doc.filepath,
									 'sels': this.doc.cursors,
									 'rev': this.doc.history.length});

		this.sendAll('joined', {'client': client});

		return clientId;
	},

	removeClient: function(clientId, socket) {
		this.sendAll('left', {'client': this.clients[clientId]});

		delete this.clients[clientId];
		delete this.sockets[clientId];
		this.doc.removeCursor(clientId);
	},

	reqDoc: function(filename, filepath) {
		this.sendAll('reqDoc', {'filename': filename,
								'filepath': filepath});
	},

	setDocAsync: function(filename, filepath, fn) {
		this.sendAll('reqDoc', {'filename': filename,
								'filepath': filepath});

		fn( (function(file) {
			this.setDoc(file, filename, filepath);
		}).bind(this),
		(function(errorMsg) {
			this.sendAll('reqDoc', {'error': errorMsg});
		}).bind(this));
	},

	setDoc: function(str, filename, filepath) {
		this.doc.setText(str);
		this.sendAll('setDoc', {'doc': this.doc.text,
								'filename': filename,
								'filepath': filepath,
								'sels': this.doc.cursors,
								'rev': this.doc.history.length});
		logger.log('debug', this.doc.text.length);
	},

	setWorkspaceAsync: function(user, repo, fn) {
		this.sendAll('reqWorkspace', {
			'user': user,
		  'repo': repo
		});

		fn( (function(workspace) {
			this.setWorkspace(workspace);
		}).bind(this),
		(function(errorMsg) {
			this.sendAll('reqWorkspace', {'user': user, 'repo': repo, 'error': errorMsg});
		}).bind(this));
	},

	reqWorkspace: function(user, repo) {
		this.sendAll('reqWorkspace', {'user': user,
									  'repo': repo});
	},

	setWorkspace: function(workspace) {
		this.workspace = workspace;
		this.sendAll('setWorkspace', this.workspace);
	},

	setWorkTreeState: function(path, isopen) {
		this.sendAll('setWorkTreeState', {'path': path, 'isopen': isopen});
	},

	applyOp: function(clientId, op, rev) {
		op = this.doc.apply(op, rev);
		this.sendAll('opText', {'id': clientId, 'op': op});
	},

	applyCursor: function(clientId, cursor) {
		this.doc.setCursor(clientId, cursor);
		this.sendAll('opCursor', {'id': clientId, 'sel': cursor});
	},

	shareVideo: function(clientId) {
		this.clients[clientId].videoStream = true;
		this.sendAll('shareVideo', {'client': this.clients[clientId]} );
	},

	unshareVideo: function(clientId) {
		this.clients[clientId].videoStream = false;
		this.sendAll('unshareVideo', {'client': this.clients[clientId]} );
	},

	forwardRTCMessage: function(clientId, data) {
		if(!data.to) {
			logger.log('debug', 'forwardRTCMessage: no destination');
			return;
		}

		var client = this.clients[data.to];
		if(!client) {
			logger.log('debug', 'forwardRTCMessage: destination not an active client');
			return;
		}
		data.from = clientId;
		this.send(client, 'rtcMessage', data);
	}
};

module.exports = Session;
