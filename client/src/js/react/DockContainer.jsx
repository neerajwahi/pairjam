var React = require('react');
var Notification = require('./Notification.jsx');
var OptionDock = require('./OptionDock.jsx');
var VideoDock = require('./VideoDock.jsx');
var NotificationDock = require('./NotificationDock.jsx');

var DockContainer = React.createClass({
	getInitialState: function() {
		return {
			activeNotification: false,
			unreadCount: 0,
			notifications: [],
			notificationQueue: [],
			visibleDock: null
		};
	},

	pushNotification: function(notice) {
		if (notice) {
			if (this.state.activeNotification) {
				this.setState({
					unreadCount: this.state.unreadCount + 1,
					notifications: this.state.notifications.concat([notice]),
					notificationQueue: this.state.notificationQueue.concat([notice])
				});
			} else {
				this.setState({
					activeNotification: notice,
					unreadCount: this.state.unreadCount + 1,
					notifications: this.state.notifications.concat([notice])
				});
			}
			setTimeout((function () {
				this.setState({ activeNotification: null });
				if (this.state.notificationQueue.length) {
					setTimeout((function() {
						this.pushNotification(this.state.notificationQueue[0]);
						this.setState({ notificationQueue: this.state.notificationQueue.slice(1) });
					}).bind(this), 500);
				}
			}).bind(this), 2500);
		}
	},

	clearUnread: function() {
		this.setState({ unreadCount: 0 });
	},

	openDock: function (title) {
		if (this.state.visibleDock !== title) {
			this.setState({visibleDock: title});
		} else {
			this.setState({visibleDock: null});
		}
	},

	render: function () {
		return (
			<div className='dockContainer'>
				<Notification
					activeNotification={this.state.activeNotification} />
				<OptionDock
					lightTheme={this.props.lightTheme}
					changeTheme={this.props.changeTheme}
					savePatch={this.props.savePatch}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
				<VideoDock
					videoStatus={this.props.videoStatus}
					audioStatus='TODO'
					peers={this.props.peers}
					peerColors={this.props.peerColors}
					videoClientId={this.props.videoClientId}
					shareVideo={this.props.shareVideo}
					unshareVideo={this.props.unshareVideo}
					subscribeVideo={this.props.subscribeVideo}
					unsubscribeVideo={this.props.unsubscribeVideo}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
				<NotificationDock
					peerColors={this.props.peerColors}
					notifications={this.state.notifications}
					unreadCount={this.state.unreadCount}
					clearUnread={this.clearUnread}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
			</div>
		);
	}
});

module.exports = DockContainer;
