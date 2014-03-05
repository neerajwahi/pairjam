/** @jsx React.DOM */

var React = require('react');

var Gutter = React.createClass({

    getInitialState: function() {
        return {
        };
    },

    render: function() {
        return (
            <div className="userMarker" style={ {'top' : this.props.pos } }></div>
        );
    }

});

module.exports = Gutter;
