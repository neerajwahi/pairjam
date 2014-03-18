// A session is a group of users in the same 'room' with a shared document
var Session = require('./Session.js');
var uuid = require('node-uuid');
var rpc = require('./protocol.js');
var logger = require('winston');

function isValidSessionId(sesId) {
    // TODO: validate sessionId more
    if(!sesId) return false;
    return true;
}

function Server() {
	// A map keyed by sessionId
	this.sessions = {};
}

Server.prototype = {
	start: function(transport) {
		var _this = this;

		transport.on('connection', function(socket) {
			var clientId = 0;
			var sessionId = 0;

		    // TODO: I don't like the way sessionIds are being passed (how does it scale?)
		    function join(args) {
		        if(!isValidSessionId(args.sessionId)) {
		            console.error('Join message does not contain a valid sessionId');
		        } else {
		            if( !_this.sessions[args.sessionId] ) {
		                // Session does not exist, create it
		                _this.sessions[args.sessionId] = new Session(args.sessionId, 'Welcome');
		            }

		            sessionId = args.sessionId;
		            //TODO: change away from uuid
		            clientId = _this.sessions[args.sessionId].clients.length? Math.max.apply(null, _this.sessions[args.sessionId].clients) + 1 : 0;
		            _this.sessions[sessionId].addClient( clientId, socket, args.name );

		            logger.log('debug', clientId + ' joined');
		            logger.log('debug', 'Current clients: ' + _this.sessions[args.sessionId].clients);
		        }
		    }

		    socket.on('data', function(msg) {
		        logger.log('debug', msg );

		        try {
		            msg = JSON.parse(msg);
		        } catch(e) {
		            console.error('Received non-JSON message. Ignoring.');
		            return;
		        }

		        if(!msg.fn || !msg.args) {
		            console.error('Invalid message received (must contain fn and args keys).');
		        } else if( msg.fn === 'join' ) {
		            join(msg.args);
		        } else {
		            if( !rpc[msg.fn] ) {
		                console.log('Invalid message. fn does not exist.');
		            } else {
		                // TODO: sanitize args here
		                if(sessionId) {
		                    rpc[msg.fn](_this.sessions[sessionId], clientId, msg.args);
		                }
		            }
		        }
		    });

		    socket.on('close', function() {
		        if(sessionId) {
		            // TODO: should we delete sessions right away? Or GC later?
		            if(rpc.close) rpc.close(_this.sessions[sessionId], clientId);

		            _this.sessions[sessionId].removeClient( clientId );

		        	logger.debug(clientId + ' left');
		            logger.log('debug', 'Current clients: ' + _this.sessions[sessionId].clients);

		            if( !_this.sessions[sessionId].clients.length ) {
		                delete _this.sessions[sessionId];
		            }
		        }
		    });

		});
	}
};


module.exports = Server;
