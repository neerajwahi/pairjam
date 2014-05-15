var notice = require('./notifications.jsx');
var util = require('./util.js');

// TODO: adapter should be smarter about marker updates
module.exports = function(model, view) {
	return {
		// Connection level
		opened: function() {
			view.notify(notice.connected());
		},

		reconnecting: function(time) {
			view.notify(notice.lostConnection(time));
		},

		closed: function(data) {},

		// Joining and leaving
		welcome: function(data) {
			console.log('welcome');
			model.reset(data);
			view.setProps( {clients: model.clients} );
		},

		joined: function(data) {
			if(!data.client || !data.client.id) return;

			model.addPeer(data.client);
			view.setProps( {clients: model.clients} );

			// Someone else joined
			if(data.client.id !== model.clientId) {
				view.notify( notice.joined(data.client.name) );
			}

			view.updateCursors(model.clientCursors);
		},

		left: function(data) {
			if(!data.client || !data.client.id) return;

			model.removePeer(data.client);

			view.setProps( {clients: model.clients} );
			view.notify( notice.left(data.client.name) );
			view.updateCursors( model.clientCursors );

			if(view.state.videoClientId == data.client.id) {
				view.state.av.unsubscribe(data.client.id, function(err) {
					if(!err) {
						view.setState( {videoClientId: undefined} );
					}
				});
			}
		},

		// Workspace change functions
		reqDoc: function(data) {
			if(data.error) {
				view.notify(notice.error(data.error));
			} else {
				view.notify(notice.loading(data.filename));
			}
		},

		reqWorkspace: function(data) {
			if(data.error) {
				view.notify(notice.loadError(data.user + '/' + data.repo, data.error));
			} else {
				view.notify(notice.loading(data.user + '/' + data.repo, ' from GitHub'));
			}
		},

		setDoc: function(data) {
			model.setDoc(data.doc, data.rev, data.sels);

			view.updateDoc(data.doc, data.filename, data.filepath);

			// TODO: fix this
			view.updateCursors(model.clientCursors);
		},

		setWorkspace: function(data) {
			var tree = data.tree || {};
			var branches = data.branches || [];

			view.setWorkspace({
				user: data.user,
				repo: data.repo,
				tree: tree,
				sha: tree.sha,
				branches: branches
			});
		},

		setWorkTreeState: function(data) {
			var tree = view.state.tree;
			util.setKeyOnTreePath(tree, data.path, 'opened', data.isopen);
			view.setState( {'tree': tree} );
		},

		// Operations
		opText: function(data) {
			var op = model.applyExternalOp(data);
			if(op.length) view.applyOp(op);
			view.updateCursors(model.clientCursors);
		},

		opCursor: function(data) {
			model.applyExternalSel(data);
			view.updateCursors(model.clientCursors);
		},

		// Audio/video
		shareVideo: function(data) {
			if(!data.client || !data.client.id) return;
			if(data.client.id === model.clientId) return;

			model.setPeer(data.client);
			view.setProps( {clients: model.clients} );
			var msg = data.client.name + ' is now sharing audio + video. Click on ' + data.client.name + '\'s icon to watch the stream.';
			view.notify( {type: 'joinMsg', content: msg} );
		},

		unshareVideo: function(data) {
			if(!data.client || !data.client.id) return;
			if(data.client.id === model.clientId) return;

			model.setPeer(data.client);
			view.setProps( {clients: model.clients} );
						console.log(data.client.id);

			if(view.state.videoClientId == data.client.id) {
				view.state.av.unsubscribe(data.client.id, function(err) {
					if(!err) {
						view.setState( {videoClientId: undefined} );
					}
				});
			}
			var msg = data.client.name + ' has stopped sharing audio + video.';
			view.notify( {type: 'leaveMsg', content: msg} );
		},

		rtcMessage: function(data) {
			console.log('rtcMessage');
			console.log(data);
			if(!data.type || !data.from) return;
			if(!model.clients[data.from]) return;
			var guestName = model.clients[data.from].name;

			if(data.type === 'subscribe') {
				var msg = guestName + ' is now watching your video stream.';
				view.notify({type: 'joinMsg', content: msg});
				view.state.av.serve(data.from);
			} else if(data.type === 'unsubscribe') {
				var msg = guestName + ' has stopped watching your video stream.';
				view.notify({type: 'leaveMsg', content: msg});
				view.state.av.unserve(data.from);
			} else {
				view.state.av.onRTCMessage(data);
			}
		},
	};
};
