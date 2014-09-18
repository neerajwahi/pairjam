/** @jsx React.DOM */
var React = require('react');

// External libraries
var Switchery = require('../../../bower_components/switchery/switchery.js');

// React UI components
var Workspace = require('./Workspace.jsx');
var RepoSearch = require('./RepoSearch.jsx');
var ModalWindow = require('./ModalWindow.jsx');
var Video = require('./Video.jsx');
var TabBar = require('./TabBar.jsx');
var DockContainer = require('./DockContainer.jsx');

var CodeEditor = require('./CodeEditor.jsx');
var MarkdownEditor = require('./MarkdownEditor.jsx');

var util = require('../util.js');
var notice = require('../notifications.jsx');

// TODO: remove unnecessary DIVs
// TODO: speed up UI using shouldComponentRender

var UI = React.createClass({
	getInitialState: function() {
		return {
			allowInteraction: false,
			user: '',
			repo: '',
			tree: {},
			branches: [],
			clientColors: {},
			colorPool: ['guest1', 'guest2', 'guest3', 'guest4', 'guest5', 'guest6', 'guest7', 'guest8', 'guest9', 'guest10'],
			videoStatus: 'off',
            audioStatus: 'off',
			av: null,
			lightTheme: false,
			notifications: []
		};
	},

	componentWillReceiveProps: function(nextProps) {
		// TODO: add all of the CSS color classes
		// TODO: this is so ugly, find a better way
		// Generate color classes
		var clientColors = this.state.clientColors;
		var colorPool = this.state.colorPool;
		var changed = false;

		var keys = Object.keys(nextProps.clients);
		for (var i = 0; i < keys.length; i++) {
			if (!clientColors[keys[i]]) {
				// Add client
				clientColors[keys[i]] = colorPool[0];
				colorPool = colorPool.slice(1);
				changed = true;
			}
		}
        keys = Object.keys(clientColors);
        for (i = 0; i < keys.length; i++) {
            if (!nextProps.clients[keys[i]]) {
                colorPool.push(clientColors[keys[i]]);
                delete clientColors[keys[i]];
                changed = true;
            }
        }
        if (changed) {
            colorPool.sort(function(a, b) {
                return parseInt( a.slice('guest'.length) ) - parseInt( b.slice('guest'.length) )
            });
            this.setState({
                clientColors: clientColors, colorPool: colorPool
            });
        }
    },

    applyOp: function(op) {
        this.refs.editor.applyOp(op);
    },

    updateCursors: function(cursors) {
        // TODO: probably don't have to pass in 1st arg here
        this.refs.editor.setState({
            cursors: cursors
        });
        this.refs.editor.updateCursors();
    },

    updateDoc: function(doc, filename, path) {
        var lang = this.refs.editor.updateDoc(doc, filename);
        if (filename) {
            //TODO: how?
            this.notify(notice.loaded(filename));

            if (path) {
                //TODO: fix this (not very reactive)
                var tree = this.state.tree;
                util.clearKeyOnTree(tree, 'selected');
                util.setKeyOnTreePath(tree, path, 'selected', true);
                util.setKeyOnTreePath(tree, path, 'modified', true);
                this.setState({
                    'tree': tree
                });
            }
        }
        //this.refs.markdown.setState({doc: doc});
    },

    setWorkspace: function(workspace) {
        this.refs.repoBox.setState({
            user: workspace.user,
            repo: workspace.repo
        });

        this.setState({
            user: workspace.user,
            repo: workspace.repo,
            tree: workspace.tree,
            sha: workspace.sha,
            branches: workspace.branches
        });

        if (workspace.user && workspace.repo && workspace.tree) {
            this.notify(notice.loaded(workspace.user + '/' + workspace.repo, ' from GitHub'));
        }
    },

    setLang: function(clientName, lang) {
        this.refs.editor.setLang(lang);
        this.notify(notice.langChanged(clientName, lang));
    },

    notify: function(notice) {
        this.refs.dockContainer.pushNotification(notice);
    },

    // Welcome modal window handler
    onEntrySuccess: function(state) {
        this.setState({allowInteraction: true});
        this.refs.editor.setFocus();
        this.props.handlers.onReady(state);
    },

    // Audio/video
    shareVideo: function(includeAudio, includeVideo) {
        this.setState({
            audioStatus: includeAudio? 'awaitingPermission' : this.state.audioStatus,
            videoStatus: includeVideo? 'awaitingPermission' : this.state.videoStatus
        });

        var msg = '\u25b2 Allow Pairjam access to your camera and microphone';
        this.notify({
            type: 'joinMsg',
            itemId: 'video',
            content: msg,
            keepAlive: true
        });

        this.state.av.share(includeAudio, includeVideo, (function(err) {
            if (err) {
                this.setState({
                    audioStatus: includeAudio? 'off' : this.state.audioStatus,
                    videoStatus: includeVideo? 'off' : this.state.videoStatus
                });
                this.unshareVideo();
                this.notify({
                    type: 'errorMsg',
                    itemId: 'video',
                    content: err
                });
            } else {
                this.setState({
                    audioStatus: includeAudio? 'connecting' : this.state.audioStatus,
                    videoStatus: includeVideo? 'connecting' : this.state.videoStatus
                });
                var msg = 'You are now sharing audio + video.';
                this.notify({
                    type: 'stateMsg',
                    itemId: 'video',
                    content: msg
                });
            }
        }).bind(this));
    },

    unshareVideo: function() {
        if (this.state.audioStatus === 'awaitingPermission' ||
            this.state.videoStatus === 'awaitingPermission') {
            var msg = '\u25b2 Your browser is already asking you for access to your camera and microphone.';
            this.notify({
                type: 'errorMsg',
                content: msg
            });
            return;
        }
        if (this.state.audioStatus === 'off' &&
            this.state.videoStatus === 'off') return;

        this.setState({
            audioStatus: 'off',
            videoStatus: 'off'
        });

        var msg = 'You are no longer sharing audio or video.';
        this.notify({
            type: 'errorMsg',
            itemId: 'video',
            content: msg
        });

        this.state.av.unshare();
    },

    muteVideo: function(isMuted) {
        this.setState({
            audioStatus: isMuted? 'off' : this.state.videoStatus
        });
        this.state.av.mute(isMuted);
    },

    subscribeVideo: function(clientId, includeAudio, includeVideo) {
        this.state.av.subscribe(clientId, includeAudio, includeVideo, (function(err) {
            if (!err) {
                this.setState({
                    audioSub: includeAudio? clientId : undefined,
                    videoSub: includeVideo? clientId : undefined
                });
            }
        }).bind(this));
    },

    unsubscribeVideo: function(clientId) {
        this.state.av.unsubscribe(clientId, (function(err) {
            if (!err) {
                this.setState({
                    audioSub: undefined,
                    videoSub: undefined
                });
            }
        }).bind(this));
    },

    muteSubscribed: function(isMuted) {
        this.setState({
            audioSub: isMuted? undefined : this.state.videoSub
        });
        this.state.av.muteSub(isMuted);
    },

    onDocChange: function(op) {
        this.props.handlers.onDocChg(op);
    },

    changeTheme: function (checkboxValue) {
        this.refs.editor.setTheme('ace/theme/' + (checkboxValue ? 'spacegray' : 'tomorrow_night_eighties'));
        this.setState({
            lightTheme: checkboxValue
        });
    },

    savePatch: function() {
        console.log('saving patch');
        this.props.handlers.onRequestPatch();
    },

    render: function() {
        return (
            <div>
                <ModalWindow onSuccess={this.onEntrySuccess} />

                <div id="mainContainer" className={
                	(this.state.allowInteraction ? '' : 'popupScreen') +
                	(this.state.lightTheme ? ' lightTheme' : '')
                }>
                    <div id="sidePane" className={this.state.avSubscription? 'videoStreaming' : ''}>
                        <RepoSearch
                          ref='repoBox'
                          onSubmit={this.props.handlers.onLoadRepo} />

                        <Workspace ref='workspace'
                            user={this.state.user}
                            repo={this.state.repo}
                            data={this.state.tree}
                            branches={this.state.branches}
                            sha={this.state.sha}
                            onSelectFile={this.props.handlers.onLoadFile}
                            onToggleOpen={this.props.handlers.onOpenFolder}
                            onSelectBranch={this.props.handlers.onLoadRepo} />

                        <DockContainer ref='dockContainer'
                        	lightTheme={this.state.lightTheme}
                            changeTheme={this.changeTheme}
                            savePatch={this.savePatch}
							videoStatus={this.state.videoStatus}
							audioStatus={this.state.audioStatus}
							peers={this.props.clients}
							peerColors={this.state.clientColors}
							audioSub={this.state.audioSub}
                            videoSub={this.state.videoSub}
							shareVideo={this.shareVideo}
							unshareVideo={this.unshareVideo}
                            muteVideo={this.muteVideo}
							subscribeVideo={this.subscribeVideo}
							unsubscribeVideo={this.unsubscribeVideo}
                            muteSubscribed={this.muteSubscribed}
                            notifications={this.state.notifications} />

                        {(this.state.videoStatus !== 'off' || this.state.videoSub)?
                            <Video videoStatus={this.state.videoStatus}
                                   videoSub={this.state.videoSub}
                                   shareVideo={this.shareVideo}
                                   unshareVideo={this.unshareVideo} /> : ''
                        }
					</div>

					<div className="editorContainer">
						<TabBar initialTabs={[]} />
                        <CodeEditor ref={'editor'}
                        			lightTheme={this.state.lightTheme}
                                    peers={this.props.clients}
                                    cursors={this.props.cursors}
                                    peerColors={this.state.clientColors}
                                    onDocChg={this.onDocChange}
                                    onCursorChg={this.props.handlers.onCursorChg}
                                    updateLang={this.props.handlers.onLangChg} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UI;
