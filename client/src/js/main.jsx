/** @jsx React.DOM */

var pairjam = (function() {

	var hashURL = location.hash.replace('#', '');
	var util = require('./util.js');

	// Ace code editor
	var AceAdapter = require('../../../lib/ot/AceAdapter.js');
	var editor = ace.edit('editor');
	var modelist = ace.require('ace/ext/modelist');

	// OT client
	var Client = require('../../../lib/ot/Client.js');
	var Transport = require('./WSTransport.js');

	// Instantiation (sic?)
	var adapter = new AceAdapter(ace, editor.getSession());
	var client = new Client();
	var transport = new Transport('http://' + location.hostname + ':3001' + '/jam', hashURL);

	var suppressEvents = false;
	var pendingItem = {};

	Client.prototype.send = function(clientId, msg, args) {
		transport.send(msg, args);
	}

	editor.setTheme("ace/theme/tomorrow_night_eighties");
	editor.getSession().setMode("ace/mode/javascript");
	editor.getSession().setUseWorker(false);

	editor.renderer.on('themeLoaded', function() {
		document.getElementById('editor').style.visibility = 'visible';
	});

	// React components
	var React = require('react');
	var Notification = require('./react/Notification.jsx');
	var Tree = require('./react/TreeNode.jsx');
	var RepoSearch = require('./react/RepoSearch.jsx');
	var LangBox = require('./react/LangBox.jsx');
	var Gutter = require('./react/Gutter.jsx');
	var PeerInfoBox = require('./react/PeerInfoBox.jsx');

	var Notify = require('./notifications.jsx');

	var notifications = React.renderComponent(<Notification items={[]} />, document.getElementById('notifications'));

	// React callbacks
	var onLoadDocFn = function(user, repo, sha, name, path) {
		transport.send('reqGitFile', {	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : sha,
										'filename' : name,
										'filepath' : path	});
	};

	var openFolderFn = function(user, repo, path, isOpen) {
		transport.send('setGitTreeState', {	'path' : path,
											'isopen' : isOpen	});
	};

	var onRepoSearch = function(user, repo) {
		transport.send('reqGitRepo', {	'id' : client.clientId,
										'user' : user,
										'repo' : repo,
										'sha' : 'master'		});
	};

	var treePane = React.renderComponent(<Tree data={{}} onLoadDoc={onLoadDocFn} openFolder={openFolderFn}/>, document.getElementById('treePane'));
	var repoSearch = React.renderComponent(<RepoSearch onSubmit={onRepoSearch}/>, document.getElementById('repoSearch'));
	var langBox = React.renderComponent(<LangBox test={[]} />, document.getElementById('langbox'));
	var gutter = React.renderComponent(<Gutter pos='0'/>, document.getElementById('gutter'));
	var peerInfoBox = React.renderComponent(<PeerInfoBox content={''} />, document.getElementById('peerInfoBox'));

	// Handle editor events (TODO: should this be done here?)
	editor.getSession().on('change', function(e) {
	    if(suppressEvents === true) return;

		var op = adapter.opFromDelta( e.data );
		client.applyInternalOp( op );
		adapter.setMarkers( client.getSelections() );
	});

	editor.getSession().selection.on('changeSelection', function() {
	    if(suppressEvents === true) return;

	    var sel = adapter.getSelection();
	    client.applyInternalSel( sel );
	});

	// Handle incoming messages (TODO: should this be done here?)
	transport.preProcess = function() {
		suppressEvents = true;
	}

	transport.postProcess = function() {
		suppressEvents = false;
	}

	var pendingItem = {};

	// TODO: clean up selection handling (in adapter)
	// TODO: clean up notifications
	transport.handlers = {
		welcome : function(data) {
			this.setDoc(data);
			if(data.workspace && data.workspace.tree) this.setGitRepo(data.workspace);
			peerInfoBox.setState( { peers: client.getPeers() } );
		},

		opened : function() {
			notifications.replaceItem( pendingItem, Notify.connected() );
			pendingItem = {};
		},

		reconnecting : function(time) {
			pendingItem = notifications.replaceItem( pendingItem, Notify.lostConnection(time) );
		},

		closed : function() {
		},

		reqGitFile : function(data) {
			if(data.error) {
				notifications.replaceItem( pendingItem,  Notify.error(data.error) );
				pendingItem = {};
			} else {
				pendingItem = notifications.replaceItem( pendingItem, Notify.loading(data.filename) );
			}
		},

		setDoc : function(data) {
			client.reset( data );
			editor.setValue( data.doc, -1 );
			adapter.saveState();
			adapter.setMarkers( client.getSelections() );

			if( data.filename ) {
				var mode = modelist.getModeForPath( data.filename );
				editor.getSession().setMode(mode.mode);
				langBox.setState( {'lang' : mode.caption } );
				if(pendingItem) {
					notifications.clearItem(pendingItem);
					pendingItem = {};
				}
				notifications.addItem( Notify.loaded(data.filename) );

				if(data.filepath) {
					var tree = treePane.props.data;
					util.clearKeyOnTree(tree, 'selected');
					util.setKeyOnTreePath(tree, data.filepath, 'selected', true);
					treePane.setProps( { 'data' : tree } );
				}
			}
		},

		joined : function(data) {
			client.addPeer( data );

			peerInfoBox.setState( { peers: client.getPeers() } );

			console.log(client.clientId);
			if(data.id !== client.clientId) {
				notifications.addItem( Notify.joined('Guest') );
			}

			adapter.setMarkers( client.getSelections() );
		},

		left : function(data) {
			client.removePeer(data);

			peerInfoBox.setState( { peers: client.getPeers() } );
			notifications.addItem( Notify.left('Guest') );

			adapter.setMarkers( client.getSelections() );
		},

		opSel : function(data) {
			var sels = client.applyExternalSel( data );
			adapter.setMarkers( sels );

			if(data.sel) {
				var rng = adapter.indicesToRange(data.sel[0]);
				var pos = editor.renderer.$cursorLayer.getPixelPosition( {'row' : rng.start.row, 'col' : rng.start.col } );
				gutter.setProps({'pos' : pos.top });
			}
		},

		opText : function(data) {
			var op = client.applyExternalOp( data );
			if(op.length) adapter.applyOp( op );
			adapter.setMarkers( client.getSelections() );
		},

		reqGitRepo : function(data) {
			if(data.error) {
				notifications.replaceItem( pendingItem, Notify.error(data.error));
				pendingItem = {};
			} else {
				pendingItem = notifications.replaceItem( pendingItem, Notify.loading(data.user + '/' + data.repo, ' from GitHub') );
			}
		},

		setGitRepo : function(data) {
			//var tree = util.buildTree(data.tree);
			var tree = data.tree;
			repoSearch.setState( {'user' : data.user, 'repo' : data.repo} );

			treePane.setProps( {'user' : data.user, 'repo' : data.repo, 'data' : tree} );

			notifications.replaceItem( pendingItem, Notify.loaded(data.user + '/' + data.repo, ' from GitHub' ) );
			pendingItem = {};
			console.log(data.tree);
		},

		setGitTreeState : function(data) {
			var tree = treePane.props.data;
			util.setKeyOnTreePath(tree, data.path, 'opened', data.isopen);
			treePane.setProps( { 'data' : tree } );
		}
	};

})();
