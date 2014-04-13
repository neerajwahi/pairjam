/** @jsx React.DOM */

var App = require('./App.jsx');

var main = (function() {
	'use strict';

	var session = location.hash.replace('#', '');
	var url = 'http://localhost:3001/jam'; //'http://rt.pairjam.com/jam';

	var app = new App(session, url);
	app.run();

})();
