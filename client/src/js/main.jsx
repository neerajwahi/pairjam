/** @jsx React.DOM */

var pairjam = (function() {

	var util = require('./util.js');

	// Ace code editor
	var AceAdapter = require('../../../lib/ot/ace_adapter.js');
	var editor = ace.edit('editor');
	var modelist = ace.require('ace/ext/modelist');

	// OT client
	var Client = require('../../../lib/ot/client.js');
	Client.prototype.send = function(clientId, msg, args) {
		socket.emit(msg, args);
	}

	// React components
	var React = require('react')
	var TreeNode = require('./react/TreeNode.jsx');
	var RepoSearch = require('./react/RepoSearch.jsx');
	var LangBox = require('./react/LangBox.jsx');
	var Gutter = require('./react/Gutter.jsx');

	// Instantiation (sic?)
	var socket = io.connect(window.location.hostname);
	var adapter = new AceAdapter(ace, editor.getSession());
	var client = new Client();

	editor.setTheme("ace/theme/tomorrow");
	//editor.setTheme("ace/theme/xcode");
	editor.getSession().setMode("ace/mode/javascript");
	editor.getSession().setUseWorker(false);

	var suppressEvents = false;

	// React callbacks
	var onLoadDocFn = function(user, repo, sha, docPath) {
		socket.emit('reqDocChg', 	{	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : sha,
										'filename' : docPath	});
	};

	var onRepoSearch = function(user, repo) {
		socket.emit('reqRepoTree', 	{	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : 'master'		});
	};

	// Render React components
	var treePane = React.renderComponent(<TreeNode node={{}} onLoadDoc={onLoadDocFn} />, document.getElementById('treePane'));
	var repoSearch = React.renderComponent(<RepoSearch onSubmit={onRepoSearch}/>, document.getElementById('repoSearch'));
	var langBox = React.renderComponent(<LangBox test={[]} />, document.getElementById('langbox'));
	var gutter = React.renderComponent(<Gutter pos='0'/>, document.getElementById('gutter'));

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
		var tree = util.buildTree(data.tree);
		repoSearch.setState( {'user' : data.user, 'repo' : data.repo} );
		treePane.setProps( {'user' : data.user, 'repo' : data.repo, 'node' : tree} );
		treePane.setState( {'isOpen' : true} );
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

		if(data.sel) {
			var rng = adapter.indicesToRange(data.sel[0]);
			//editor.getSession().addGutterDecoration(data.sel[0][0], 'lineHighlight');
			//console.log( editor.getSession().documentToScreenPosition(rng.start.row, rng.start.column) );
			var pos = editor.renderer.$cursorLayer.getPixelPosition( {'row' : rng.start.row, 'col' : rng.start.col } );
			//console.log(pos);
			gutter.setProps({'pos' : pos.top });
		}


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
