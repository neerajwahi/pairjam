var React = require('react');
var Dock = require('./Dock.jsx');
var Checkbox = require('./Checkbox.jsx');

var VideoDock = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    handleVideoShare: function(clientId) {
        if (this.props.videoStatus === 'off') {
            this.props.shareVideo(true, true);
        } else {
            this.props.unshareVideo();
        }
    },

    handleAudioShare: function(clientId) {
        if (this.props.audioStatus === 'off') {
            if (this.props.videoStatus === 'off') {
                this.props.shareVideo(true, false);
            } else {
                this.props.muteVideo(false);
            }
        } else {
            if (this.props.videoStatus === 'off') {
                this.props.unshareVideo();
            } else {
                this.props.muteVideo(true);
            }
        }
    },

    handleVideoSubscribe: function(clientId) {
        if (!this.props.peers[clientId].videoStream) return;

        if (this.props.videoSub == clientId) {
            this.props.unsubscribeVideo(clientId);
        } else {
            this.props.subscribeVideo(clientId, true, true);
        }
    },

    handleAudioSubscribe: function(clientId) {
        if (!this.props.peers[clientId].audioStream) return;

        if (this.props.audioSub == clientId) {
            if (this.props.videoSub == clientId) {
                // Mute the audio here
                this.props.muteSubscribed(true);
            } else {
                this.props.unsubscribeVideo(clientId);
            }
        } else {
            if (this.props.videoSub == clientId) {
                // Unmute the audio here
                this.props.muteSubscribed(false);
            } else {
                this.props.subscribeVideo(clientId, true, false);
            }
        }
    },

    render: function() {
        var listItems = [];
        var peers = this.props.peers;

        listItems.push(
            <li key='ownVideo'>
                Share your video?
                <Checkbox handleChange={this.handleVideoShare} checked={this.props.videoStatus !== 'off'} />
            </li>
        );

        listItems.push(
            <li key='ownAudio'>
                Share your audio?
                <Checkbox handleChange={this.handleAudioShare} checked={this.props.audioStatus !== 'off'} />
            </li>
        );

        Object.keys(peers).forEach((function (id) {
            var videoStatus = 'videoDisabled', audioStatus = 'audioDisabled';
            var color = this.props.peerColors[id];
            var audioStream = peers[id].audioStream;
            var videoStream = peers[id].videoStream;

            if (videoStream) {
                videoStatus = (this.props.videoSub == id? 'videoActive' : 'videoEnabled');
            }
            if (audioStream) {
                audioStatus = (this.props.audioSub == id? 'audioActive' : 'audioEnabled');
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
