/** @jsx React.DOM */
var React = require('react');
var UI = require('./react/UI.jsx');

var AV = require('./AV.js');

var Client = require('../../../lib/ot/Client.js');
var Transport = require('./Transport.js');

var protocol = require('./protocol.js');

// Constructor
function App(sessionId, url) {
	if(!sessionId) this.sessionId = this.createSessionId();
	else this.sessionId = sessionId;

	this.client = new Client();
	this.transport = new Transport(url, this.sessionId, 'Guest');

	// The entire application UI
	this.UI = React.renderComponent(
				<UI handlers={this.createCallbacks(this.client, this.transport)}
					clients={{}} />,
					document.getElementById('appContainer'));
	this.UI.setState( {av: new AV(this.transport, 'mainVideo', 'localVideo')} );
}

App.prototype = {
	createSessionId: function() {
		var randomStr = "";
		var len = 6;
	    var tokens = "abcdefghijklmnopqrstuvwxyz0123456789";

	    for (var i = 0; i < len; i++) {
	        randomStr += tokens.charAt(Math.floor(Math.random() * tokens.length));
	    }

	    window.location.hash = randomStr;
	    return randomStr;
	},

	initTransport: function() {
		this.transport.handlers = protocol(this.client, this.UI);
	},

	initClient: function() {
		var _this = this;

		this.client.sendOp = function(op) {
			_this.transport.send('opText',	{'id' : this.clientId,
											 'rev' : this.rev,
											 'op' : op});
		};

		this.client.sendCursor = function(cursor) {
			_this.transport.send('opCursor', {'id' : this.clientId,
											  'rev' : this.rev,
											  'sel' : cursor });
		};
	},

	run: function() {
		this.initTransport();
		this.initClient();
	},

	// UI event handlers
	createCallbacks: function(client, transport) {
		return {
			onReady: function(state) {
				transport.userName = state.userName;
				transport.connect();
			},

			// GitHub integration
			onLoadFile: function(user, repo, sha, name, path) {
				transport.send('reqDoc', {'id': client.clientId,
										  'user': user,
										  'repo': repo,
										  'sha': sha,
										  'filename': name,
										  'filepath': path});
			},

			onOpenFolder: function(user, repo, path, isOpen) {
				transport.send('setWorkTreeState', {'path': path,
													'isopen': isOpen});
			},

			onLoadRepo: function(user, repo) {
				transport.send('reqWorkspace', {'id': client.clientId,
												'user': user,
												'repo': repo,
												'sha': 'master'});
			},

			// Code editing
			onDocChg: function(op) {
				client.applyInternalOp(op);
			},

			onCursorChg: function(sel) {
				client.applyInternalSel(sel);
			}
		};
	}
};

module.exports = App;
