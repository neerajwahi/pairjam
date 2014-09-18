var Session = require('./Session.js');
var rpc = require('./protocol.js');
var logger = require('winston');

function Server() {
	this.sessions = {};
}

function isValidSession(sesId) {
    // TODO: better validation
    if (!sesId) return false;
    return true;
};

function parseQueryString(queryString) {
    var params = {};
 
    // Split into key/value pairs
    var queries = queryString.split("&");
 
    // Convert the array of strings into an object
    for (var i = 0; i < queries.length; i++) {
        var temp = queries[i].split('=');
        params[temp[0]] = decodeURIComponent(temp[1]);
    }
    return params;
};

Server.prototype = {
	start: function(transport) {
		var _this = this;

		transport.on('connection', function(socket) {
			var clientId = 0;
			var sessionId = 0;
			var queryString = socket.upgradeReq.url;
		    var args = parseQueryString(queryString);

	    	// Bail if not a valid session
	        if (!isValidSession(args.sessionId)) {
	            logger.error('Join message does not contain a valid sessionId');
	            // TODO: add an error code
	            socket.close();
	            return;
	        }

            if (!_this.sessions[args.sessionId]) {
                // Session does not exist, create it
                logger.log('debug', 'Creating new session, id = ' + args.sessionId);
                _this.sessions[args.sessionId] = new Session(args.sessionId);
            }

            sessionId = args.sessionId;
           	var session = _this.sessions[sessionId];
            clientId = session.addClient(socket, args.name);

            logger.log('debug', clientId + ' joined');
            logger.log('debug', 'Current clients:');
            logger.log('debug', session.clients);

            // Received a message
		    socket.on('message', function(msg) {
		    	// Make sure the message is JSON
		        try {
		            msg = JSON.parse(msg);
		        } catch(e) {
		            logger.error('Received non-JSON message. Ignoring.');
		            return;
		        }

		        if (!msg.fn || !msg.args) {
		            logger.error('Invalid message received (must contain fn and args keys).');
		        } else {
		            if( !rpc[msg.fn] ) {
		                logger.error('Invalid message. fn does not exist.');
		            } else {
		                // TODO: sanitize args here
		                if(sessionId) {
		                    rpc[msg.fn](_this.sessions[sessionId], clientId, msg.args);
		                }
		            }
		        }
		    });

		    // Socket closed
		    socket.on('close', function() {
		        if (!sessionId) return;

	            // TODO: should we delete sessions right away? Or GC later?
	            if (rpc.close) rpc.close(_this.sessions[sessionId], clientId);

	            _this.sessions[sessionId].removeClient(clientId);

	        	logger.log('debug', clientId + ' left');
	            logger.log('debug', 'Current clients:')
	            logger.log('debug', _this.sessions[sessionId].clients);

	            if (!Object.keys(_this.sessions[sessionId].clients).length) {
	                delete _this.sessions[sessionId];
	            }
		    });

		    socket.on('error', function(err) {
		    	logger.error(err);
		    });
		});
	}
};

module.exports = Server;
