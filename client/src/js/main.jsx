/** @jsx React.DOM */
var App = require('./App.jsx');
var React = require('react');
var http = require('http');

// For React developer tools
window.React = React;

var main = (function() {
	'use strict';

	var session = location.hash.replace('#', '');

	// Load balancer URL
	var lbHost = 'lb.pairjam.com';
	// @if NODE_ENV !== 'production'
	lbHost = 'localhost';
	// @endif

	// Connect to the appropriate Node server for this session
	http.get({
		host: lbHost,
		port: 3333,
		path: '/' + session,
		withCredentials: false
	}, function(res) {
		res.on('data', function(msg) {
			var data = JSON.parse(msg);
			var url = data.server;
			var sessionId = data.sessionId;
			if (!session) {
				window.location.hash = '#' + sessionId;
			}
			window.addEventListener('hashchange', function() {
				if (window.location.hash !== '#' + sessionId) {
					window.location.reload();
				}
			});

			console.log('Connecting to ' + url);

			// @if NODE_ENV !== 'production'
			url = 'ws://localhost:3001';
			// @endif

			var app = new App(sessionId, url);
			app.run();
		});
	});
})();
