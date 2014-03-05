// Express
var express = require('express');
var app = express();

// Utility funnctions
var util = require('./util.js');

// Socket.io
var http = require('http');
var httpServer = http.createServer(app);
var io = require('socket.io').listen(httpServer);
io.set('log level', 2);

var port = process.env.PORT || 3000;
httpServer.listen(port);

var welcomeMsg =  '$ man pairjam\n\nWelcome to pair/jam\n\nShare the url to this page to start coding.\n\n' +
                  'You can browse github repos on the top left.\nYou can enable audio/video by clicking on empty blue-ish box on the bottom left.';

// Github
var GitHubApi = require("github");
var gitCred = require('./gitapiSecret');

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    timeout: 5000
});

github.authenticate({
    type: "oauth",
    key: gitCred.client_id,
    secret: gitCred.client_secret
});

// A session is a group of users in the same 'room' with a shared document
var Session = require('../lib/ot/serverSession.js');
var sessions = [];
var clients = [];   // Maps clients to rooms

Session.prototype.send = function( clientId, msg, args ) {
    //var room = clients[ clientId ];
    io.sockets.sockets[ clientId ].emit( msg, args );
};

Session.prototype.sendAll = function( clientId, msg, args ) {
    var room = clients[ clientId ];
    io.sockets.in(room).emit( msg, args );
};

//TODO: bug, this matches index.html and prevents a session from being created
app.use(
    express.static(__dirname + '/../client/public')
);

app.get('/', function (req, res) {
            var sessionId = util.generateSessionId(6);
            console.log(sessionId);
            res.redirect('/' + sessionId);
        }
).get('/*', function(req, res) {
            res.sendfile('client/index.html', {'root': __dirname + '/../'} );
        }
);


io.sockets.on('connection', function (socket) {

    var session = undefined;
    var sessionId = 0;

    socket.on('join', function(data) {
        session = sessions[ data.sessionId ];
        if(! sessions[ data.sessionId ] ) {
            session = sessions[ data.sessionId ] = new Session(welcomeMsg);
        }
        sessionId = data.sessionId;
        clients[ socket.id ] = data.sessionId;
        socket.join(sessionId);

        console.log('Client joined \n\t id = ' + socket.id + '\n\t name = ' + data.name + '\n\t session = ' + sessionId);
        session.addClient( socket.id, data.name );
    });

    socket.on('op', function (data) {
        if(session) {
            session.applyOp( socket.id, data );
        }
    });

    socket.on('sel', function (data) {
        if(session) {
            session.applySel( socket.id, data );
        }
    });

    socket.on('reqDocChg', function(data) {
        if(session) {
            github.gitdata.getBlob({
                user: data.user,
                repo: data.repo,
                sha: data.sha
            }, function(err, res) {
                console.log(JSON.stringify(res));
                if(!err) {
                    var b64contents = res.content;
                    var buf = new Buffer(b64contents, 'base64');
                    session.setDoc( data.id, buf.toString(), data.filename );
                } else {
                    console.error(err);
                }
            });

        }
    });

    socket.on('reqRepoTree', function(data) {
        if(session) {
            //TODO: VALIDATE!!
            github.gitdata.getTree({
                user: data.user,
                repo: data.repo,
                sha: data.sha,
                recursive: 1
            }, function(err, res) {
                if(err) {
                    console.error(err);
                } else {
                    var room = clients[ socket.id ];
                    io.sockets.in(room).emit( 'repoTree', { 'user' : data.user,
                                                            'repo' : data.repo,
                                                            'sha' : data.sha,
                                                            'tree' : res.tree  }   );
                }
            });
        }
    });

    socket.on('disconnect', function(data) {
        if(session) {
            socket.leave(sessionId);
            delete clients[ socket.id ];
            session.removeClient( socket.id );

            if( !session.getClients().length ) {
                session = undefined;
                delete sessions[ sessionId ];
            }
        }
    });

});