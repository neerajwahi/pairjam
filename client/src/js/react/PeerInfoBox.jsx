/** @jsx React.DOM */

var React = require('react');
var uuid = require('node-uuid');

// TODO: replace uuid with client ID
var PeerInfoBox = React.createClass({
    getInitialState: function() {
        return {
            peerPos: {}
        };
    },

    render: function() {
        var classList = [], users = '';
        classList.push('notification');

        if(Object.keys(this.props.peers).length) {
            var i = 1;
            users = Object.keys(this.props.peers).map( (function(id) {
                var guestClass = this.props.peerColors[id];
                var guestPos = this.state.peerPos[id];
                if(guestPos && guestPos != 0) classList.push(guestPos < 0? 'userBehind' : 'userAhead');

                return (
                    <div key={uuid.v4()} className={classList.concat([guestClass]).join(' ')}>{this.props.peers[id]}</div>
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
