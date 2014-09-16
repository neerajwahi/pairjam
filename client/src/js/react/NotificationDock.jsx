var React = require('react');
var Dock = require('./Dock.jsx');

var NotificationDock = React.createClass({
	getInitialState: function () {
		return {};
	},

	render: function() {
		var notifications = this.props.notifications;
		var peerColors = this.props.peerColors;
		var listItems = notifications.map(function(notification, index) {
			var color = peerColors[notification.id];
			return (
				<li key={index}>
					{notification.content}
				</li>
			);
		});

		return (
			<Dock
				classList={'notificationDock' + (this.props.unreadCount ? ' unread' : '')}
				icon='icon-bell'
				action={this.props.clearUnread}
				openDock={this.props.openDock}
				visibleDock={this.props.visibleDock}
				name='notification' >
				{listItems}
			</Dock>
		);
    }
});

module.exports = NotificationDock;
