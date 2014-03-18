/** @jsx React.DOM */

var Client = require('../../../lib/ot/Client.js');
var Transport = require('./Transport.js');

// React components
var React = require('react');
var UI = require('./react/UI.jsx');

var protocol = require('./protocol.js');

// Constructor
function App(sessionId) {
	this.client = new Client();
	this.transport = new Transport('http://' + location.hostname + ':3001' + '/jam', sessionId, 'Guest');

	// The entire application UI
	this.UI = React.renderComponent(<UI handlers={this.createCallbacks(	this.client,
																		this.transport,
																		this.UI			)}
										clients={{}} 						/>,
										document.getElementById('appContainer'));
}

App.prototype = {

	initTransport: function() {
		/*
			this.transport.subscribe( protocol(this.client, this.UI) );

			this.transport.publish(stream, args)
		*/
		this.transport.handlers = protocol(this.client, this.UI);
	},

	initClient: function() {
		var _this = this;

		this.client.sendOp = function(op) {
			_this.transport.send('opText',	{	'id' : this.clientId,
												'rev' : this.rev,
												'op' : op		});
		};

		this.client.sendCursor = function(cursor) {
			_this.transport.send('opCursor',	{	'id' : this.clientId,
													'rev' : this.rev,
													'sel' : cursor		});
		};
	},

	run: function() {
		// Initialize the goodness
		this.initTransport();
		this.initClient();
	},

	// UI event handlers
	createCallbacks: function(client, transport, UI) {
		return {
			onReady: function(state) {
				transport.userName = state.userName;
				transport.connect();
			},

			onLoadFile: function(user, repo, sha, name, path) {
				transport.send('reqDoc', {	'id' : client.clientId,
											'user' : user,
											'repo' : repo,
											'sha' : sha,
											'filename' : name,
											'filepath' : path	});
			},

			onOpenFolder: function(user, repo, path, isOpen) {
				transport.send('setWorkTreeState', {	'path' : path,
														'isopen' : isOpen	});
			},

			onLoadRepo: function(user, repo) {
				transport.send('reqWorkspace', {	'id' : client.clientId,
													'user' : user,
													'repo' : repo,
													'sha' : 'master'		});
			},

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
