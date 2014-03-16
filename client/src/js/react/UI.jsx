/** @jsx React.DOM */

var React = require('react');

var util = require('../util.js');
var notice = require('../notifications.jsx');

// React UI components
var Notification = require('./Notification.jsx');
var Tree = require('./Tree.jsx');
var RepoSearch = require('./RepoSearch.jsx');
var LangBox = require('./LangBox.jsx');
var PeerInfoBox = require('./PeerInfoBox.jsx');
var ModalWindow = require('./ModalWindow.jsx');
var Logo = require('./Logo.jsx');
var Video = require('./Video.jsx');
var CodeEditor = require('./CodeEditor.jsx');

// TODO: remove unnecessary DIVs
var UI = React.createClass({

    getInitialState: function() {
        return {
            allowInteraction: false,
            lang: 'Text'
        };
    },

    applyOp: function(op) {
        this.refs.editor.applyOp(op);
    },

    updateCursors: function(cursors) {
        this.refs.editor.updateCursors(cursors);
    },

    updateDoc: function(doc, filename, path) {
        this.refs.editor.updateDoc(doc, filename);
        if(filename) {
            //TODO: how?
            this.setState( {'lang' : this.refs.editor.getMode() } );
            this.notify( notice.loaded(filename) );

            if(path) {
                //TODO: fix this (not very reactive)
                var tree = this.props.tree;
                util.clearKeyOnTree(tree, 'selected');
                util.setKeyOnTreePath(tree, path, 'selected', true);
                this.setProps( {'tree' : tree} );
            }
        }
    },

    notify: function(notice) {
        this.refs.notifications.addItem(notice);
    },

    // Welcome modal window handler
    onEntrySuccess: function(state) {
        this.setState( {allowInteraction: true} );
        this.refs.editor.setFocus();
        var userName = state.userName;
        this.props.handlers.onReady(state);
    },

    render: function() {
        return (
            <div>

                <ModalWindow onSuccess={this.onEntrySuccess}/>

                <div id="mainContainer" className={this.state.allowInteraction? '' : 'popupScreen'}>

                    <div id="menuContainer">
                        <Logo />
                        <div id="rightMenu">
                            <ul>
                                <li>
                                    <PeerInfoBox peers={this.props.clients} />
                                    <Notification ref={'notifications'} />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div id="container">
                        <div id="sidePane">
                            <RepoSearch onSubmit={this.props.handlers.onLoadRepo}/>
                            <Tree   ref={'tree'}
                                    user={this.props.user}
                                    repo={this.props.repo}
                                    data={this.props.tree}
                                    onSelect={this.props.handlers.onLoadFile}
                                    onToggleOpen={this.props.handlers.onOpenFolder}/>
                            <Video />
                        </div>

                        <CodeEditor ref={'editor'}
                                    onDocChg={this.props.handlers.onDocChg}
                                    onCursorChg={this.props.handlers.onCursorChg}      />
                        <LangBox    ref={'lang'}
                                    lang={this.state.lang}  />
                    </div>

                </div>

            </div>
        );
    }

});

module.exports = UI;
