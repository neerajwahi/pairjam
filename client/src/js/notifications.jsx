/** @jsx React.DOM */
var React = require('react');

// These are all the possible notification types in the program
module.exports = {
	connected: function() {
		var msg = 'Connected.'
		return {
			type: 'stateMsg',
			itemId: 'connection',
			content: msg
		};
	},

	lostConnection: function(retryTime) {
		var msg = 'Retrying connection.'
		if(retryTime > 0) msg = 'Lost connection. Retrying in ' + retryTime + '...'
		return {
			type: 'errorMsg',
			itemId: 'connection',
			content: msg,
			keepAlive: true
		};
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
		return {
			type: 'loadingMsg',
			itemId: 'load' + resource,
			content: msg,
			keepAlive: true
		};
	},

	loaded: function(resource, from) {
		var content = 'Loaded ' + resource + (from? ' ' + from : '');
		return {
			type: 'stateMsg',
			itemId: 'load' + resource,
			content: content
		};
	},

	loadError: function(resource, content) {
		return {
			type: 'errorMsg',
			itemId: 'load' + resource,
			content: content
		};
	},

	error: function(msg) {
		return {
			type: 'errorMsg',
			content: msg
		};
	},

	info: function(msg) {
		return {
			type: 'joinMsg',
			content: msg
		};
	},

	begForFeedback: function() {
		var msg = 'Do you have a second to provide your feedback on pair/jam?';
		var content = (
			<div>
				{msg}<br/>
				<div>Sure></div><div>Leave me alone</div>
			</div>
		);
		return {
			type: 'infoMsg',
			content: content,
			keepAlive: true
		};
	}
};
