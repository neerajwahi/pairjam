/** @jsx React.DOM */

var React = require('react');
var uuid = require('node-uuid');

// TODO: replace uuid with client ID
var PeerInfoBox = React.createClass({
    getInitialState: function() {
        return {};
    },

    render: function() {
        var classList = [], users = '';
        classList.push('notification');

        if(this.props.peers.length) {
            classList.push('activeSession');
            var i = 1;
            users = this.props.peers.map( function(peer) {
                var guestClass = 'guest' + (i++);
                return (
                    <div key={uuid.v4()} className={classList.concat([guestClass]).join(' ')}>{peer}</div>
                );
            } );
        } else {
            classList.push('inactiveSession');
            users = (<div className={classList.join(' ')}>nobody :[</div>);
        }

        return (
            <div id="peerInfoBox">
                <div className="menuButton">Coding with</div>
                {users}
            </div>
        );
    }

});

module.exports = PeerInfoBox;
