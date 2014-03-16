/** @jsx React.DOM */

var React = require('react');

var LangBox = React.createClass({

    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <div className="langBox">{this.props.lang}</div>
        );
    }

});

module.exports = LangBox;
