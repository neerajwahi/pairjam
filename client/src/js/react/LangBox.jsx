/** @jsx React.DOM */

var React = require('react');

var LangBox = React.createClass({

    getInitialState: function() {
        return {
        	'lang' : 'Javascript'
        };
    },

    render: function() {
        return (
            <div>{this.state.lang}</div>
        );
    }

});

module.exports = LangBox;
