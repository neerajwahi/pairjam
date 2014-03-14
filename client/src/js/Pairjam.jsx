/** @jsx React.DOM */

var Client = require('../../../lib/ot/Client.js');
var Transport = require('./WSTransport.js');
var util = require('./util.js');

// Ace code editor
var AceAdapter = require('../../../lib/ot/AceAdapter.js');
var modelist = ace.require('ace/ext/modelist');

// React UI components
var React = require('react');
var Notification = require('./react/Notification.jsx');
var Tree = require('./react/Tree.jsx');
var RepoSearch = require('./react/RepoSearch.jsx');
var LangBox = require('./react/LangBox.jsx');
var PeerInfoBox = require('./react/PeerInfoBox.jsx');
var ModalWindow = require('./react/ModalWindow.jsx');

// Helper files
var notify = require('./notifications.jsx');

// Constructor
function Pairjam(ace) {

	// Code editor
	this.ace = ace;
	this.editor = ace.edit('editor');
	this.adapter = new AceAdapter(this.ace, this.editor.getSession());

	this.client = new Client();
	this.transport = new Transport('http://' + location.hostname + ':3001' + '/jam', hashURL, 'Guest');

}

Pairjam.prototype = {

};

module.exports = Pairjam;




