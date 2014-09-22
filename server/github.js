var GitHubApi = require("github");
var gitCred = require('./github_api_secret');
var util = require('./util.js');
var logger = require('winston');

var github = new GitHubApi({
    // required
    version: "3.0.0",

    // optional
    debug: true,
    protocol: "https",
    timeout: 5000
});

if (node.env.GITHUB_CLIENT_ID && node.env.GITHUB_CLIENT_SECRET) {
    github.authenticate({
        type: "oauth",
        key: node.env.GITHUB_CLIENT_ID,
        secret: node.env.GITHUB_CLIENT_SECRET
    });
}

module.exports = {
	getTree: function(user, repo, sha, successCb, errorCb) {
		github.gitdata.getTree({
		    user: user,
		    repo: repo,
		    sha: sha,
		    recursive: 1
		}, function(err, res) {
		    if(err) {
		        logger.error(err);
                var msg = 'Error loading GitHub repo';
                if(err.code = 404) {
                    msg = 'GitHub repo ' + user + '/' + repo + ' does not exist';
                }
                errorCb(msg);
		    } else {
                var tree = util.buildTree(res.tree);
                tree.opened = true;
                tree.sha = res.sha;
				successCb(tree);
		    }
		});
	},

    getBranches: function(user, repo, successCb, errorCb) {
        github.repos.getBranches({
            user: user,
            repo: repo,
        }, function(err, res) {
            if (err) {
                logger.error(err);
                var msg = 'Error loading GitHub repo';
                if (err.code = 404) {
                    msg = 'GitHub repo ' + user + '/' + repo + ' does not exist';
                }
                errorCb(msg);
              } else {
                successCb(res);
            }
        });
    },

	getFile: function(user, repo, sha, successCb, errorCb) {
		github.gitdata.getBlob({
            user: user,
            repo: repo,
            sha: sha
        }, function(err, res) {
            logger.log('debug', JSON.stringify(res));
            if (!err) {
                var b64contents = res.content;
                var buf = new Buffer(b64contents, 'base64');
                successCb(buf.toString('ascii'));
            } else {
                logger.error(err);

                var msg = 'Error loading GitHub file';
                if (err.code = 404) {
                    msg = 'File does not exist';
                }
                errorCb(msg);
            }
        });
	}
};
