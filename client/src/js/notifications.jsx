/** @jsx React.DOM */

var React = require('react');

// These are all the possible notification types in the program
module.exports = {
	connected: function() {
		var msg = 'Connected.'
		return { type: 'stateMsg', content: msg };
	},

	lostConnection: function(retryTime) {
		var msg = 'Retrying connection.'
		if(retryTime > 0) msg = 'Lost connection. Retrying in ' + retryTime + '...'
		var content = (
			<div>
				{msg}
			</div>
		);

		return { type: 'errorMsg', content: content, keepAlive: true };
	},

	joined: function(name) {
		return {
			type: 'joinMsg',
			content: name + ' has joined'
		};
	},

	left: function(name) {
		return {
			type: 'leaveMsg',
			content: name + ' has left the building'
		};
	},

	loading: function(resource, from) {
		var msg = 'Loading ' + resource + (from? ' ' + from : '');
		return { type: 'loadingMsg', content: msg, keepAlive: true };
	},

	loaded: function(resource, from) {
		var content = 'Loaded ' + resource + (from? ' ' + from : '');
		return { type: 'stateMsg', content: content };
	},

	error: function(msg) {
		return { type: 'errorMsg', content: msg };
	},

	begForFeedback: function() {
		var msg = 'Do you have a second to provide your feedback on pair/jam?';
		var content = (
			<div>
				{msg}<br/>
				<div>Sure></div><div>Leave me alone</div>
			</div>
		);
		return { type: 'infoMsg', content: content, keepAlive: true };
	}
};