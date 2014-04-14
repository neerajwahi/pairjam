/** @jsx React.DOM */

var App = require('./App.jsx');
var React = require('react');
window.React = React;

var main = (function() {
	'use strict';

	var session = location.hash.replace('#', '');
	var url = 'ws://rt.pairjam.com';

	// @if NODE_ENV !== 'production'
	url = 'ws://localhost:3001';
	// @endif

	var app = new App(session, url);
	app.run();

})();
