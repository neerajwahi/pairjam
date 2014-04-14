// Requires
var http = require('http');
var logger = require('winston');
var Server = require('./Server.js');
var WebSocketServer = require('ws').Server;

// Socket server
var port = process.env.PORT || 3001;
var wss = new WebSocketServer({port: port});

// Logging
if(!process.env.NODE_ENV !== 'production') {
	logger.remove(logger.transports.Console);
	logger.add(logger.transports.Console, {'level': 'debug'});
}

var server = new Server();
server.start(wss);
