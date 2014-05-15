var github = require('./github.js');
var util = require('./util.js');
var logger = require('winston');

// TODO: add validation!
module.exports = {
	// WebRTC signaling
	shareVideo: function(session, clientId, data) {
		logger.log('debug', clientId + ' is sharing video');
		session.shareVideo(clientId);
	},

	unshareVideo: function(session, clientId, data) {
		logger.log('debug', clientId + ' is unsharing video');
		session.unshareVideo(clientId);
	},

	rtcMessage: function(session, clientId, data) {
		console.log('Video signaling message');
		session.forwardRTCMessage(clientId, data);
	},

	// Text operation
	opText: function(session, clientId, data) {
		session.applyOp(clientId, data.op, data.rev);
	},

	// Selection operation
	opCursor: function(session, clientId, data) {
		session.applyCursor(clientId, data.sel);
	},

	// Request a GitHub repo tree
	reqWorkspace: function(session, clientId, data) {
		var user = data.user;
		var repo = data.repo;
		var sha = data.sha;

		session.setWorkspaceAsync( user, repo, function(success, error) {
			github.getBranches(user,repo, function(branches) {
				github.getTree(user, repo, sha, function(tree) {
					success( {
						'user' : data.user,
						'repo' : data.repo,
						'tree' : tree,
						'branches': branches
					});
				},
				function(err) {
					error(err);
				});
			},
			function(err){
				error(err);
			});
		});
	},

	// Request a GitHub file
	reqDoc: function(session, clientId, data) {
		var user = data.user;
		var repo = data.repo;
		var sha = data.sha;

		session.setDocAsync( data.filename, data.filepath, function(success, error) {
			github.getFile(user, repo, sha, function(file) {
				util.clearKeyOnTree( session.workspace.tree, 'selected' );
				util.setKeyOnTreePath( session.workspace.tree, data.filepath, 'selected', true );
				success( file, data.filename, data.filepath );
			},
			function(err) {
				error( err );
			});
		});
	},

	// Set a folder open or closed
	setWorkTreeState: function(session, clientId, data) {
		util.setKeyOnTreePath( session.workspace.tree, data.path, 'opened', data.isopen );
		session.setWorkTreeState(data.path, data.isopen);
	}
};
