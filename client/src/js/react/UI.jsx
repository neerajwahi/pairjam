/** @jsx React.DOM */
var React = require('react');

// React UI components
var Workspace = require('./Workspace.jsx');
var RepoSearch = require('./RepoSearch.jsx');
var ModalWindow = require('./ModalWindow.jsx');
var Video = require('./Video.jsx');
var TabBar = require('./TabBar.jsx');
var DockContainer = require('./DockContainer.jsx');

var IndicatorContainer = require('./IndicatorContainer.jsx');

var CodeEditor = require('./CodeEditor.jsx');
var MarkdownEditor = require('./MarkdownEditor.jsx');

//var AV = require('../AV.js');
                            /*<Video videoStatus={this.state.videoStatus}
                                   videoClientId={this.state.videoClientId}
                                   shareVideo={this.shareVideo}
                                   unshareVideo={this.unshareVideo} />*/

var util = require('../util.js');
var notice = require('../notifications.jsx');

// TODO: remove unnecessary DIVs
// TODO: speed up UI using shouldComponentRender
// BUG: with 2+ ppl random dropped connections (is this a Chrome limit?)

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
                this.setState({
                    'tree': tree
                });
            }
        }
        this.refs.markdown.setState({doc: doc});
    },

    updateClientPos: function(clientPos) {
        this.refs.indicatorContainer.setState({
            peerPos: clientPos
        });
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
    shareVideo: function() {
        this.setState({
            videoStatus: 'awaitingPermission'
        });

        var msg = '\u25b2 Allow pair/jam access to your camera and microphone';
        this.notify({
            type: 'joinMsg',
            itemId: 'video',
            content: msg,
            keepAlive: true
        });

        this.state.av.share((function(err) {
            if (err) {
                this.setState({
                    videoStatus: 'off'
                });
                this.unshareVideo();
                this.notify({
                    type: 'errorMsg',
                    itemId: 'video',
                    content: err
                });
            } else {
                this.setState({
                    videoStatus: 'connecting'
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
        if (this.state.videoStatus === 'awaitingPermission') {
            var msg = '\u25b2 Your browser is already asking you for access to your camera and microphone.';
            this.notify({
                type: 'errorMsg',
                content: msg
            });
            return;
        }
        if (this.state.videoStatus === 'off') return;

        this.setState({
            videoStatus: 'off'
        });

        var msg = 'You are no longer sharing audio + video.';
        this.notify({
            type: 'errorMsg',
            itemId: 'video',
            content: msg
        });

        this.state.av.unshare();
    },

    subscribeVideo: function(clientId) {
        this.state.av.subscribe(clientId, (function(err) {
            if (!err) {
                this.setState({
                    videoClientId: clientId
                });
            }
        }).bind(this));
    },

    unsubscribeVideo: function(clientId) {
        this.state.av.unsubscribe(clientId, (function(err) {
            if (!err) {
                this.setState({
                    videoClientId: undefined
                });
            }
        }).bind(this));
    },

    onDocChange: function(op) {
        this.props.handlers.onDocChg(op);
    },

    changeTheme: function (checkboxValue) {
    	this.setState({
    		lightTheme: checkboxValue
    	});
    },

    savePatch: function () {
    	// do shit
    },

    render: function() {
        console.log(this.props.clients);
        return (
            <div>
                <ModalWindow onSuccess={this.onEntrySuccess} />

                <div id="mainContainer" className={
                	(this.state.allowInteraction ? '' : 'popupScreen') +
                	(this.state.lightTheme ? ' lightTheme' : '')
                }>
                    <div id="sidePane" className={this.state.videoClientId? 'videoStreaming' : ''}>
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
							audioStatus='TODO'
							peers={this.props.clients}
							peerColors={this.state.clientColors}
							videoClientId={this.state.videoClientId}
							shareVideo={this.shareVideo}
							unshareVideo={this.unshareVideo}
							subscribeVideo={this.subscribeVideo}
							unsubscribeVideo={this.unsubscribeVideo}
							peerColors={this.state.clientColors}
    						notifications={this.state.notifications} />

					</div>

					<div className="editorContainer">
						<TabBar initialTabs={['Scratchpad', 'main.c', 'Solution.java', 'fml.hs']} />

                        <CodeEditor ref={'editor'}
                        			lightTheme={this.props.lightTheme}
                                    peers={this.props.clients}
                                    cursors={this.props.cursors}
                                    peerColors={this.state.clientColors}
                                    onDocChg={this.onDocChange}
                                    onCursorChg={this.props.handlers.onCursorChg}
                                    onCursorPos={this.updateClientPos} />

						<IndicatorContainer ref='indicatorContainer'
							peers={this.props.clients}
						/>
                    </div>

                    <div className="rightContainer">

                        <TabBar initialTabs={['Terminal', 'Live Preview']} />

                        <MarkdownEditor ref={'markdown'} />

                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UI;
