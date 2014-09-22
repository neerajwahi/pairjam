var http = require('http');
var logger = require('winston');
var Server = require('./Server.js');
var WebSocketServer = require('ws').Server;
var Balancer = require('./Balancer.js');

// Socket server
var port = process.env.PORT || 3001;
var balancer = new Balancer(port);
var balanceServer = balancer.start([
	'ny1.pairjam.com',
	'ny2.pairjam.com',
	'ny3.pairjam.com'
]);

var wss = new WebSocketServer({server: balanceServer});

// Logging
if (!process.env.NODE_ENV !== 'production') {
	logger.remove(logger.transports.Console);
	logger.add(logger.transports.Console, {'level': 'debug'});
}

var server = new Server();
server.start(wss);
