/** @jsx React.DOM */

var App = require('./App.jsx');

var main = (function() {
	'use strict';

	var session = location.hash.replace('#', '');

	var app = new App(session);
	app.run();

})();
