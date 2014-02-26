/** @jsx React.DOM */

var buildTreeFromGH = function(flat) {
	/*
	flat.sort( function(a, b) {
		if(a['type'] === 'tree' && b['type'] !== 'tree') return 1;
		else if(a['type'] !== 'tree' && b['type'] === 'tree') return 1;
		else return !a.path.localeCompare(b);
	} );
	*/


	var node = { name: 'master', sha: 0 }, temp = node;
	console.log(temp);

	for(var i = 0; i < flat.length; i++) {
		var flatNode = flat[i];
		var splitPath = flatNode.path.split('/');
		var sha = flatNode.sha;
		temp = node;

		for(var j = 0 ; j < splitPath.length; j++) {
			if(!temp.children) {
				temp.children = [ { 'name' : splitPath[j], 'sha' : sha } ];
				temp = temp.children[0];
			} else {
				var subNode = temp.children.filter(function (obj) {
	    			return obj.name === splitPath[j];
				})[0];

				if(subNode) temp = subNode;
				else temp = temp.children.push( { 'name' : splitPath[j], 'sha' : sha } );
			}
		}
	}

	return node;
};

var pairjam = (function() {

	var AceAdapter = require('./ot/ace_adapter.js');
	var Client = require('./ot/client.js');

	var React = require('react')
	var TreeNode = require('./gitTree.jsx');
	var RepoSearch = require('./repoSearch.jsx');
	var LangBox = require('./langBox.jsx');

	var editor = ace.edit('editor');
	var modelist = ace.require('ace/ext/modelist');

	var socket = io.connect(window.location.hostname);
	var adapter = new AceAdapter(ace, editor.getSession());
	var client = new Client();

	var onLoadDocFn = function(user, repo, sha, docPath) {
		socket.emit('reqDocChg', 	{	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : sha,
										'filename' : docPath	});
	};

	//var tree = buildTreeFromGH(gitTree);
	//console.log(tree);

	var treePane = React.renderComponent(<TreeNode node={{}} onLoadDoc={onLoadDocFn} />, document.getElementById('treePane'));

	var onRepoSearch = function(user, repo) {
		socket.emit('reqRepoTree', 	{	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : 'master'		});
	};

	var repoSearch = React.renderComponent(<RepoSearch onSubmit={onRepoSearch}/>, document.getElementById('repoSearch'));
	var langBox = React.renderComponent(<LangBox test={[]} />, document.getElementById('langbox'));

	editor.setTheme("ace/theme/tomorrow");
	editor.getSession().setMode("ace/mode/javascript");
	editor.getSession().setUseWorker(false);

	var suppressEvents = false;


	Client.prototype.send = function(clientId, msg, args) {
		socket.emit(msg, args);
	}

	socket.on('connect', function() {
		socket.emit('join', 	{	'sessionId' : window.location.pathname,
									'name' : 'Guest' 	});
	});

	socket.on('welcome', function(data) {
		suppressEvents = true;

		console.log( data );
		client.reset( data );
		editor.setValue( data.doc, -1 );
		adapter.saveState();
		adapter.setMarkers( client.getSelections() );

		if( data.filename ) {
			console.log( data.filename );
			var mode = modelist.getModeForPath( data.filename );
			console.log(mode);
			editor.getSession().setMode(mode.mode);
			langBox.setState( {'lang' : mode.caption } );
		}

		suppressEvents = false;
	});

	socket.on('repoTree', function(data) {
		var tree = buildTreeFromGH(data.tree);
		repoSearch.setState( {'user' : data.user, 'repo' : data.repo} );
		treePane.setProps( {'user' : data.user, 'repo' : data.repo, 'node' : tree} );
		treePane.setState( {'visible' : true} );
	});

	socket.on('joined', function(data) {
		suppressEvents = true;

		client.addPeer( data );
		adapter.setMarkers( client.getSelections() );

		suppressEvents = false;
	});

	socket.on('left', function(data) {
		suppressEvents = true;

		client.removePeer(data);
		adapter.setMarkers( client.getSelections() );

		suppressEvents = false;
	})

	socket.on("sel", function(data) {
		suppressEvents = true;

		var sels = client.applyExternalSel( data );
		adapter.setMarkers( sels );

		suppressEvents = false;
	});

	socket.on("op", function(data) {
		suppressEvents = true;
		var op = client.applyExternalOp( data );
		if(op.length) adapter.applyOp( op );
		adapter.setMarkers( client.getSelections() );
		suppressEvents = false;
	});

	editor.getSession().on('change', function(e) {
	    if(suppressEvents === true) return;

		var op = adapter.opFromDelta( e.data );
		client.applyInternalOp( op );
		adapter.setMarkers( client.getSelections() );
	});

	editor.getSession().selection.on('changeSelection', function() {
	    if(suppressEvents === true) return;

	    var sel = adapter.getSelection();
	    client.applyInternalSel(sel);
	});

})();
