var express = require('express');
var HashRing = require('hashring');

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

var Balancer = function(port) {
    this.port = port;
    this.app = express();
    this.app.use(CORS);
};

Balancer.prototype = {
    start: function (servers) {
        var ring = new HashRing(servers);

        // The one and only endpoint for the balancer
        this.app.get(['/', '/:sessionId'], function(req, res) {
            var sessionId = req.params.sessionId;
            if (!sessionId) sessionId = createSessionId();

            res.send({
            	sessionId: sessionId,
            	server: ring.get(sessionId)
            });
        });

        return this.app.listen(3001);
    }
};

module.exports = Balancer;