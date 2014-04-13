/** @jsx React.DOM */

var React = require('react');

// A really exciting React component
var Logo = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    render: function() {
        return (
            <a href="http://github.com/neerajwahi/pairjam" target="_blank" id="logo">
                <span>pair</span>
                <span className="slash">/</span>
                <span>jam</span>
            </a>
        );
    }
});

module.exports = Logo;
