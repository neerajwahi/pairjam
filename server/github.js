var GitHubApi = require("github");
var gitCred = require('./github_api_secret');
var util = require('./util.js');

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

module.exports = {
	getTree: function(user, repo, sha, successCb, errorCb) {
		github.gitdata.getTree({
		    user: user,
		    repo: repo,
		    sha: sha,
		    recursive: 1
		}, function(err, res) {
		    if(err) {
		        console.error(err);
                var msg = 'Error loading GitHub repo';
                if(err.code = 404) msg = 'GitHub repo ' + user + '/' + repo + ' does not exist';
                errorCb(msg);
		    } else {
                var tree = util.buildTree(res.tree);
                tree.opened = true;
				successCb(tree);
		    }
		});
	},

	getFile: function(user, repo, sha, successCb, errorCb) {
		github.gitdata.getBlob({
            user: user,
            repo: repo,
            sha: sha
        }, function(err, res) {
            console.log(JSON.stringify(res));
            if(!err) {
                var b64contents = res.content;
                var buf = new Buffer(b64contents, 'base64');
                successCb( buf.toString('ascii') );
            } else {
                console.error(err);

                var msg = 'Error loading GitHub file';
                if(err.code = 404) msg = 'File does not exist';
                errorCb(msg);
            }
        });
	}
};