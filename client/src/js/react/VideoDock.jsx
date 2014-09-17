var React = require('react');
var Dock = require('./Dock.jsx');
var Notification = require('./Notification.jsx');

var VideoDock = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    handleVideoShare: function(clientId) {
        if (this.props.videoStatus === 'off') {
            this.props.shareVideo();
        } else {
            this.props.unshareVideo();
        }
    },

    handleAudioShare: function(clientId) {
        if (this.props.videoStatus === 'off') {
            this.props.shareVideo();
        } else {
            this.props.unshareVideo();
        }
    },

    handleVideoSubscribe: function(clientId) {
        if (!this.props.peers[clientId].videoStream) return;

        if (this.props.videoClientId && this.props.videoClientId === clientId) {
            this.props.unsubscribeVideo(clientId);
        } else {
            this.props.subscribeVideo(clientId);
        }
    },

    handleAudioSubscribe: function(clientId) {
        if (!this.props.peers[clientId].videoStream) return;

        if (this.props.videoClientId && this.props.videoClientId === clientId) {
            this.props.unsubscribeVideo(clientId);
        } else {
            this.props.subscribeVideo(clientId);
        }
    },

    render: function() {
        var listItems = [];
        var peers = this.props.peers;

        listItems.push(
            <li key='ownVideo'>
                Share your video?
                <input type="checkbox" value={this.props.videoStatus !== 'off'} onChange={this.handleVideoShare} />
            </li>
        );

        listItems.push(
            <li key='ownAudio'>
                Share your audio?
                <input type="checkbox" value={this.props.audioStatus !== 'off'} onChange={this.handleAudioShare} />
            </li>
        );

        Object.keys(peers).forEach((function (id) {
            var videoStatus = 'videoDisabled', audioStatus = 'audioDisabled';
            var color = this.props.peerColors[id];
            var videoStream = peers[id].videoStream;

            if (videoStream) {
                videoStatus = this.props.videoClientId === id ? 'videoActive' : 'videoEnabled';
            }

            listItems.push(
                <li key={'user ' + peers[id].name} data-color={color}>
                    <div className='videoUser'>{peers[id].name}</div>
                    <button className={'icon-cam ' + videoStatus} onClick={this.handleVideoSubscribe.bind(null, id)}></button>
                    <button className={'icon-mic ' + audioStatus} onClick={this.handleAudioSubscribe.bind(null, id)}></button>
                </li>
            );
        }).bind(this));

        return (
            <Dock
                classList='videoDock'
                icon='icon-cam'
                openDock={this.props.openDock}
                visibleDock={this.props.visibleDock}
                name='video' >
                {listItems}
            </Dock>
        );
    }
});

module.exports = VideoDock;
