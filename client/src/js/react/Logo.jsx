/** @jsx React.DOM */

var React = require('react');

var Logo = React.createClass({

    getInitialState: function() {
        return {
        };
    },

    render: function() {
        return (
            <div id="logo">
                <span>pair</span>
                <span className="slash">/</span>
                <span>jam</span>
            </div>
        );
    }

});

module.exports = Logo;
