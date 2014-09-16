var express = require('express');
var app = express();
var HashRing = require('hashring');

var ring = new HashRing([
	'rt1.pairjam.com',
	'rt2.pairjam.com',
	'rt3.pairjam.com'
]);

var createSessionId = function() {
	var randomStr = "";
	var len = 6;
    var tokens = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++) {
        randomStr += tokens.charAt(Math.floor(Math.random() * tokens.length));
    }

    return randomStr;
};

// Allow cross-origin requests
var CORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(CORS);

// The one and only endpoint for the balancer
app.get(['/', '/:sessionId'], function(req, res) {
    var sessionId = req.params.sessionId;
    if (!sessionId) sessionId = createSessionId();

    res.send({
    	sessionId: sessionId,
    	server: ring.get(sessionId)
    });
});

app.listen(3333);
console.log('Balancer listening on port 3333...');
