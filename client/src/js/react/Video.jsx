/** @jsx React.DOM */
var React = require('react');

// TODO: refactor this code
var Video = React.createClass({
    getInitialState: function() {
        return {};
    },

    handleClick: function() {
        if (this.props.videoStatus === 'off') {
            this.props.shareVideo();
        } else {
            this.props.unshareVideo();
        }
    },

    componentDidUpdate: function(prevProps, nextProps) {
    },

    render: function() {
        var buttonClass = 'notInSession';

        if (this.props.videoStatus !== 'off') {
            buttonClass = 'inSession';
            if (this.props.videoStatus === 'awaitingPermission') {
                buttonClass = 'disabled';
            }
        }

        return (
            <div className='videoContainer'>
                <video id='mainVideo' className={this.props.videoSub? 'showing' : ''}></video>
                <video id='localVideo' className={this.props.videoStatus === 'connecting'? 'showing' : ''}></video>
            </div>
        );
    }
});

module.exports = Video;
