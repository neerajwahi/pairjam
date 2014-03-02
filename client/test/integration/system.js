/**
	This is an integration test that wires up a server and a few clients.
    It randomly generates operations on a random document with tweakable parameters.

    Parameters:
    -- noOfClients: number of concurrent users editing a document
    -- networkDelay: delay in ms of the network connection (one-way from a client to server)
    -- activityDelay: delay in ms between each group of concurrent operations
    -- docLength: the starting length of the shared document
    -- rounds: number of rounds in which a group of concurrent operations is generated
*/

// Parameters for testing
var noOfClients = 5;
var networkDelay = 50;
var activityDelay = 5;
var docLength = 100;
var rounds = 10;

var assert = require('assert');
var ot = require('../../../lib/ot/ot.js');

var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ{} \n ""'
function randomString(length) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// Set up a fake client/server system
var Server = require('../../public/js/ot/serverSession.js');
var Client = require('../../public/js/ot/client.js');

Server.prototype.send = function(clientId, msg, args) {
    var onMsg = function() {
        var client = clients[clientId];

        if(msg === 'welcome') {
            client.reset(args);
        } else if(msg === 'joined') {
            client.addPeer(args);
        } else if(msg === 'docChange') {
            client.applyExternalOp(args);
        }
    };

    onMsg();
    //if(networkDelay) setTimeout(onMsg, networkDelay);
    //else onMsg();
};

Server.prototype.sendAll = function(clientId, msg, args) {
    var onMsg = function() {
        for(var i = 0; i < clients.length; i++) {
            var client = clients[i];

            if(msg === 'welcome') {
                client.reset(args);
            } else if(msg === 'joined') {
                client.addPeer(args);
            } else if(msg === 'docChange') {
                client.applyExternalOp(args);
            }
        }
    };

    onMsg();
    //if(networkDelay) setTimeout(onMsg, networkDelay);
    //else onMsg();
};

Client.prototype.send = function(clientId, msg, args) {
    var onMsg = function() {
        if(msg === 'docChange') {
            server.applyOp(clientId, args);
        }
    };

    if(networkDelay) setTimeout(onMsg, networkDelay);
    else onMsg();
};

var server = new Server();
var clients = [];

for(var i = 0; i < noOfClients; i++) {
    clients[i] = new Client();
}

// Helper function to generate valid operations from a given document
function generateOp(doc) {
    var op = [];
    var docLen = doc.length;
    var type = Math.floor( Math.random()*2 ) === 0? 'ins' : 'del';
    if(docLen === 0) type = 'ins';

    var start = Math.round( Math.random()*( docLen - (type=='del'? 1 : 0) ) );

    if(type === 'del') {
        var length = Math.round( Math.random()*(docLen - start - 1) ) + 1;
        var remaining = docLen - start - length;
        op.push( {'ret' : start} );
        op.push( {'del' : length} );
        op.push( {'ret' : remaining} );
    } else {
        var length = Math.round( Math.random()*100 ) + 1;
        var remaining = docLen - start;
        str = randomString(length);
        op.push( {'ret' : start} );
        op.push( {'ins' : str} );
        op.push( {'ret' : remaining} );
    }
    return ot.packOp(op);
}

function test1(callback) {
    var doc = randomString(docLength);
    //console.log(doc);
    server.setDoc( doc );

    // Clients connect
    for(var i = 0; i < clients.length; i++) {
        server.addClient( i );
        clients[i].setClientDoc( doc );
    }

    // Simulate concurrent operations
    var round = 0;

    var doneCallback = function() {
        // Check that things went ok!
        var serverDoc = server.getDoc();

        for(var i = 0; i < clients.length; i++) {
            var doc = clients[i].getClientDoc();
            if(doc !== serverDoc) {
                console.log('ERROR: Client ' + i + ' does not match server.\n');
                console.log('Client thinks the document is:\n');
                console.log('\t' + doc + '\n\n');
                console.log('Server thinks the document is:\n');
                console.log('\t' + serverDoc + '\n\n');
            } else {
                console.log('SUCCESS: Client ' + i + ' matches server.');
            }
        }

        console.log('Final doc: ' + serverDoc);
    };

    var timeoutFn = function() {
        for(var i = 0; i < clients.length; i++) {
            var doc = clients[i].getClientDoc();
            var op = generateOp(doc);
            clients[i].applyInternalOp(op);
        }

        round++;
        if(round < rounds) setTimeout(timeoutFn, activityDelay);
        // Make sure we wait long enough for all the communication to complete
        else setTimeout(doneCallback, noOfClients * Math.max(activityDelay, networkDelay));
    };

    setTimeout(timeoutFn , activityDelay);
}

console.log('Starting stochastic integration test...');
test1();