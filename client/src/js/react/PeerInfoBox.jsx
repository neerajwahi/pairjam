/** @jsx React.DOM */

var React = require('react');

// TODO: replace uuid with client ID
var PeerInfoBox = React.createClass({
    getInitialState: function() {
        return {
            peerPos: {}
        };
    },

    handleClick: function(clientId) {
        if(!this.props.peers[clientId].videoStream) return;

        if(this.props.videoClientId && this.props.videoClientId === clientId) {
            this.props.unsubscribeVideo(clientId);
        } else {
            this.props.subscribeVideo(clientId);
        }
    },

    render: function() {
        var classList = [], users = '';
        classList.push('userTag');

        if(Object.keys(this.props.peers).length) {
            var i = 1;
            users = Object.keys(this.props.peers).map( (function(id) {
                var guestClass = this.props.peerColors[id];
                var guestPos = this.state.peerPos[id];
                if(guestPos && guestPos != 0) classList.push(guestPos < 0? 'userBehind' : 'userAhead');

                var peerStream = this.props.peers[id].videoStream, icons = '';
                if(peerStream) {
                    classList.push('streamable');
                    icons = (
                        <img src={'img/video-camera' + (this.props.videoClientId === id? '_active' : '') + '.svg'} />
                    );
                }

                return (
                    <div className={classList.concat([guestClass]).join(' ')} onClick={this.handleClick.bind(null, id)}>
                    {this.props.peers[id].name}
                    {icons}
                    </div>
                );
            }).bind(this) );
        } else {
            classList.push('inactiveSession');
            users = (<div className={classList.join(' ')}>nobody :[</div>);
        }

        return (
            <div id='peerInfoBox'>
                <div className='menuButton'>Coding with</div>
                {users}
            </div>
        );
    }
});

module.exports = PeerInfoBox;
