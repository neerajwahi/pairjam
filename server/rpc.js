var github = require('./github.js');

module.exports = {
	// Text operation
	opText: function(session, clientId, data) {
		session.applyOp(clientId, data);
	},

	// Selection operation
	opSel: function(session, clientId, data) {
		session.applySel(clientId, data);
	},

	// Request a GitHub repo tree
	reqGitRepo: function(session, clientId, data) {
		var user = data.user;
		var repo = data.repo;
		var sha = data.sha;

		session.sendAll( clientId, 'reqGitRepo', { 	'user' : data.user,
		                               				'repo' : data.repo,
		                               				'sha' : data.sha	});

		github.getTree(user, repo, sha, function(tree) {
			session.sendAll( clientId, 'setGitRepo', { 	'user' : data.user,
			                               				'repo' : data.repo,
			                               				'sha' : data.sha,
			                                            'tree' : tree  	});
		},

		function(errorMsg) {
			session.sendAll( clientId, 'reqGitRepo', { 	'error' : errorMsg } );
		});
	},

	// Request a GitHub file
	reqGitFile: function(session, clientId, data) {
		var user = data.user;
		var repo = data.repo;
		var sha = data.sha;

		session.sendAll( clientId, 'reqGitFile', { 	'user' : data.user,
		                               				'repo' : data.repo,
		                               				'sha' : data.sha,
		                               				'filename' : data.filename });

		github.getFile(user, repo, sha, function(file) {
			session.setDoc( clientId, file, data.filename );
		});
	}
};
