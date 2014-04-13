/** @jsx React.DOM */

var React = require('react');

// TODO: replace uuid with client ID
var PeerInfoBox = React.createClass({
    getInitialState: function() {
        return {
            peerPos: {}
        };
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

                console.log(id);
                var peerStream = this.props.peerStreams[id], icons = '';
                if(!peerStream) {
                    icons = (
                        <img src='img/video-camera.svg' />
                    );
                }

                return (
                    <div className={classList.concat([guestClass]).join(' ')}>
                    {this.props.peers[id]}
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
