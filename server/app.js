// Requires
var http = require('http');
var sockjs = require('sockjs');
var uuid = require('node-uuid');
var util = require('./util.js');
var rpc = require('./rpc.js');

// HTTP server
var httpServer = http.createServer();
var port = process.env.PORT || 9000;

// SockJS
var sock_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockServer = sockjs.createServer(sock_opts);
sockServer.installHandlers(httpServer, {prefix: '/jam'});
httpServer.listen(port);

//  A session is a group of users in the same 'room' with a shared document
var Session = require('../lib/ot/ServerSession.js');
var sessions = {};  // A map indexed by session Id
var clients = {};   // Maps clients to rooms => format: clients [sessionId] [clientId] = socket object

Session.prototype.send = function( clientId, msg, args ) {
    clients[this.sessionId][clientId].write( JSON.stringify( {'fn': msg, 'args': args} ) );
};

Session.prototype.sendAll = function( clientId, msg, args ) {
    var peers = clients[this.sessionId];
    var payload = JSON.stringify( {'fn': msg, 'args': args} );
    for(key in peers) {
        peers[key].write(payload);
    }
};

sockServer.on('connection', function(socket) {
    var clientId = undefined;
    var sessionId = undefined;

    function isValidSessionId(sesId) {
        // TODO: validate sessionId more
        if(!sesId) return false;
        return true;
    }

    // TODO: I don't like the way sessionIds are being passed (how does it scale?)
    function join(args) {
        if(!isValidSessionId(args.sessionId)) {
            console.error('Join message does not contain a valid sessionId');
        } else {
            clientId = uuid.v4();

            if( !sessions[args.sessionId] ) {
                // Session does not exist, create it
                sessions[args.sessionId] = new Session(args.sessionId, '');
                clients[args.sessionId] = {};
            }

            sessionId = args.sessionId;
            clients[sessionId][clientId] = socket;
            sessions[sessionId].addClient( clientId, args.name );
        }
    }

    socket.on('data', function(msg) {
        console.log( msg );

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
                    rpc[msg.fn](sessions[sessionId], clientId, msg.args);
                }
            }
        }
    });

    socket.on('close', function() {
        if(sessionId) {
            if(rpc['close']) rpc['close'](sessions[sessionId], clientId);

            delete clients[sessionId][clientId];
            sessions[sessionId].removeClient( clientId );

            if( !sessions[sessionId].getClients().length ) {
                delete sessions[sessionId];
                delete clients[sessionId];
            }
        }
    });
});