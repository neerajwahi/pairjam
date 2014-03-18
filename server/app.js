// Requires
var http = require('http');
var sockjs = require('sockjs');
var Server = require('./Server.js');

// HTTP server
var httpServer = http.createServer();
var port = process.env.PORT || 3001;

// SockJS
// TODO: change URL
var sock_opts = {
	sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js",
	log: function(sev, msg) { console.log(sev + ': ' + msg); }
};

var sockServer = sockjs.createServer(sock_opts);
sockServer.installHandlers(httpServer, {prefix: '/jam'});
httpServer.listen(port);

// Logging
var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {'level': 'debug'});

// Start up the server
var server = new Server();
server.start(sockServer);
