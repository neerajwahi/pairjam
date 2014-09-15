/** @jsx React.DOM */
var React = require('react');
var Notification = React.createClass({
    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <div className={'notification' + (this.props.activeNotification ? ' active' : '')}>
                {this.props.activeNotification ? this.props.activeNotification.content: ''}
            </div>
        );
    }
});

module.exports = Notification;
