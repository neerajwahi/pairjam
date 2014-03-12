/** @jsx React.DOM */

var React = require('react/addons');

var PeerInfoBox = React.createClass({
    getInitialState: function() {
        return {
        	'peers' : []
        };
    },

    render: function() {
        var className = "inactiveSession";
        if(this.state.peers.length > 0) className = " activeSession";

        className = "notification " + className;

        return (
            <div>
                <div className="menuButton">Coding with</div>
                <div className={className}>{this.state.peers.length}</div>
            </div>
        );
    }

});

module.exports = PeerInfoBox;
