var Document = require('../lib/ot/CodeDocument.js');
var util = require('./util.js');
var logger = require('winston');

//var diff_match_patch = require('googlediff');
//var dmp = new diff_match_patch();
var jsdiff = require('diff');

function Session(sessionId) {
	this.sessionId = sessionId;

	var defDoc = 'Welcome!\n\n' +
				 'Share the link below to collaborate:\n' +
				 'pairjam.com/#' + sessionId;

	// The 'master' document that the server knows
	this.doc = {};
	this.doc[0] = new Document(defDoc);
	this.activeDoc = 0;

	this.workspace = {};

	this.clients = {};
	this.sockets = {};
}

Session.prototype = {
	send: function(client, fn, args) {
		var payload = JSON.stringify({
			'fn': fn,
			'args': args
		});

		this.sockets[client.id].send(payload, function(err) {
			if (err) {
				logger.error(err);
			}
		});
	},

	sendAll: function(fn, args) {
		var payload = JSON.stringify({
			'fn': fn,
			'args': args
		});

		Object.keys(this.clients).forEach((function(i) {
			this.sockets[i].send(payload, function(err) {
				if (err) {
					logger.error(err);
				}
			});
		}).bind(this));
	},

	generateClientId: function() {
		var clientId = 1;
		Object.keys(this.clients).forEach(function(i) {
			if (parseInt(i) >= clientId) {
				clientId = parseInt(i)+1;
			}
		});
		return clientId;
	},

	addClient: function(socket, name) {
		name = name || 'Guest';
		clientId = this.generateClientId();

		var client = {
			id: clientId,
			name: name,
			audioStream: false,
			videoStream: false
		};

		this.clients[clientId] = client;
		this.sockets[clientId] = socket;

		this.send(client, 'welcome', {
			'id' : client.id,
			'clients': this.clients
		});

		this.send(client, 'setWorkspace', this.workspace);

		this.send(client, 'setDoc', {
			'doc': this.doc[this.activeDoc].text,
			'filename': this.doc[this.activeDoc].filename,
			'filepath': this.doc[this.activeDoc].filepath,
			'sels': this.doc[this.activeDoc].cursors,
			'rev': this.doc[this.activeDoc].history.length
		});

		this.sendAll('joined', {
			'client': client
		});

		return clientId;
	},

	removeClient: function(clientId, socket) {
		this.sendAll('left', {
			'client': this.clients[clientId]
		});

		delete this.clients[clientId];
		delete this.sockets[clientId];
		this.doc[this.activeDoc].removeCursor(clientId);
	},

	reqDoc: function(filename, filepath) {
		this.sendAll('reqDoc', {
			'filename': filename,
			'filepath': filepath
		});
	},

	setDocAsync: function(filename, filepath, retrieveDocFn) {
		this.sendAll('reqDoc', {
			'filename': filename,
			'filepath': filepath
		});

		// Do we have a cached and/or modified version of this doc?
		if (this.doc[filepath]) {
			logger.log('debug', 'Filepath: ' + filepath);

			this.activeDoc = filepath;
			this.setDoc("modified", filename, filepath);
		} else {
			retrieveDocFn(
				(function(file) {
					this.activeDoc = filepath;
					logger.log('debug', 'ActiveDoc: ' + this.activeDoc);

					this.doc[this.activeDoc] = new Document(file);
					this.doc[this.activeDoc].filename = filename;
					this.doc[this.activeDoc].filepath = filepath;

					this.setDoc(file, filename, filepath);
				}).bind(this),
				(function(errorMsg) {
					this.sendAll('reqDoc', {
						'error': errorMsg
					});
				}).bind(this)
			);
		}
	},

	setDoc: function(str, filename, filepath) {
		//this.doc[this.activeDoc].setText(str);
		util.clearKeyOnTree(this.workspace.tree, 'selected');
		util.setKeyOnTreePath(this.workspace.tree, filepath, 'selected', true);
		util.setKeyOnTreePath(this.workspace.tree, filepath, 'modified', true);

		this.sendAll('setDoc', {
			'doc': this.doc[this.activeDoc].text,
			'filename': filename,
			'filepath': filepath,
			'sels': this.doc[this.activeDoc].cursors,
			'rev': this.doc[this.activeDoc].history.length
		});

		//TODO: remove or better loggin
		logger.log('debug', this.doc[this.activeDoc].text.length);
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
			this.sendAll('reqWorkspace', {
				'user': user,
				'repo': repo,
				'error': errorMsg
			});
		}).bind(this));
	},

	reqWorkspace: function(user, repo) {
		this.sendAll('reqWorkspace', {
			'user': user,
			'repo': repo
		});
	},

	setWorkspace: function(workspace) {
		this.workspace = workspace;
		this.sendAll('setWorkspace', this.workspace);
	},

	setWorkTreeState: function(path, isopen) {
		util.setKeyOnTreePath(this.workspace.tree, path, 'opened', isopen);

		this.sendAll('setWorkTreeState', {
			'path': path,
			'isopen': isopen
		});
	},

	applyOp: function(clientId, op, rev) {
		op = this.doc[this.activeDoc].apply(op, rev);
		this.sendAll('opText', {
			'id': clientId,
			'op': op
		});
	},

	applyCursor: function(clientId, cursor) {
		this.doc[this.activeDoc].setCursor(clientId, cursor);
		this.sendAll('opCursor', {
			'id': clientId,
			'sel': cursor
		});
	},

	shareVideo: function(clientId, includeAudio, includeVideo) {
		this.clients[clientId].audioStream = includeAudio;
		this.clients[clientId].videoStream = includeVideo;
		this.sendAll('shareVideo', {
			'client': this.clients[clientId]
		});
	},

	unshareVideo: function(clientId) {
		this.clients[clientId].audioStream = false;
		this.clients[clientId].videoStream = false;
		this.sendAll('unshareVideo', {
			'client': this.clients[clientId]
		});
	},

	forwardRTCMessage: function(clientId, data) {
		if (!data.to) {
			logger.log('debug', 'forwardRTCMessage: no destination');
			return;
		}

		var client = this.clients[data.to];
		if (!client) {
			logger.log('debug', 'forwardRTCMessage: destination not an active client');
			return;
		}
		data.from = clientId;
		this.send(client, 'rtcMessage', data);
	},

	setLang: function(clientId, lang) {
		this.sendAll('setLang', {
			'client': this.clients[clientId],
			'lang': lang
		});
	},

	// Create a patchfile
	createPatch: function(clientId) {
		var patchText = '';
		Object.keys(this.doc).forEach((function(docId) {
			if (docId == 0) return;
			patchText += jsdiff.createPatch(this.doc[docId].filepath, this.doc[docId].origText, this.doc[docId].text);
		}).bind(this));

		this.send(this.clients[clientId], 'patchFile', patchText);
	}
};

module.exports = Session;
