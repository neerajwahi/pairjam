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
var networkDelay = 100;
var activityDelay = 0;
var docLength = 100;
var rounds = 100;

var assert = require('assert');
var ot = require('../../../lib/ot/ot.js');

// Set up a fake client/server system
var Document = require('../../../lib/ot/CodeDocument.js');
var Client = require('../../../lib/ot/Client.js');

var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ{} \n ""'
function randomString(length) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
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
        op.push( start );
        op.push( -length );
        op.push( remaining );
    } else {
        var length = Math.round( Math.random()*100 ) + 1;
        var remaining = docLen - start;
        str = randomString(length);
        op.push( start );
        op.push( str );
        op.push( remaining );
    }
    return ot.packOp(op);
}

function test1(callback) {
    var doc = new Document();
    var serverQueue = [];
    var clients = [];

    doc.setText( randomString(docLength) );
    console.log(doc.text);

    var sendToClients = function(id, op, rev) {
        var applyOp = function() {
            op = doc.apply(op, rev);

            for(var i = 0; i < noOfClients; i++) {
                //console.log(id + ', ' + op + ', ' + rev);
                clients[i].applyExternalOp({'id':id, 'op':op, 'rev':rev});
            }
        };

        if(networkDelay) setTimeout(applyOp, networkDelay);
        else applyOp();
    }

    var serverRound = function() {
        while(serverQueue.length) {
            var msg = serverQueue.shift();
            //console.log(msg);
            sendToClients(msg.id, msg.op, msg.rev);
        }
    };

    // Clients connect
    for(var i = 0; i < noOfClients; i++) {
        clients[i] = new Client();
        clients[i].setDoc( doc.text, 0, {} );
        clients[i].clientId = i;
        clients[i].sendOp = function(op) {
            var clientId = this.clientId;
            var rev = this.rev;

            //console.log(op);
            serverQueue.push(  {'id': clientId,
                                'op': op,
                                'rev': rev      });
            serverRound();
        };
    }

    var doneCallback = function() {
        // Check that things went ok!
        var serverDoc = doc.text;

        for(var i = 0; i < clients.length; i++) {
            var clientDoc = clients[i].clientDoc;
            if(clientDoc !== serverDoc) {
                console.log('ERROR: Client ' + i + ' does not match server.\n');
                console.log('Client thinks the document is:\n');
                console.log('\t' + clientDoc + '\n\n');
            } else {
                console.log('SUCCESS: Client ' + i + ' matches server.');
            }
        }
        console.log('Server thinks the document is:\n');
        console.log('\t' + serverDoc + '\n\n');
    };

    // Simulate concurrent operations
    var round = 0;

    var doRound = function() {
        for(var i = 0; i < clients.length; i++) {
            var clientDoc = clients[i].clientDoc;
            var op = generateOp(clientDoc);
            //console.log(op);
            clients[i].applyInternalOp(op);
        }

        console.log('Round ' + (round+1) + '. Done.');
        round++;

        if(round < rounds) setTimeout(doRound, activityDelay);
        // Make sure we wait long enough for all the communication to complete
        else setTimeout(doneCallback, noOfClients * Math.max(activityDelay, 2*networkDelay));
    };

    setTimeout(doRound, activityDelay);
}

console.log('Starting stochastic integration test...');
test1();