var React = require('react');
var OptionDock = require('./OptionDock.jsx');
var VideoDock = require('./VideoDock.jsx');
var NotificationDock = require('./NotificationDock.jsx');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var DockContainer = React.createClass({
	getInitialState: function() {
		return {
			unreadCount: 0,
			notifications: [],
			persistentNotifications: [],
			visibleDock: null
		};
	},

	pushNotification: function(notification) {
		if (notification) {
			// TODO: use a better UID
			notification.key = Math.random();
			if (/*notification.persistent*/true) {
				this.setState({
					unreadCount: this.state.unreadCount + 1,
					notifications: [notification].concat(this.state.notifications),
					persistentNotifications: [notification].concat(this.state.persistentNotifications)
				});
			} else {
				this.setState({
					unreadCount: this.state.unreadCount + 1,
					notifications: [notification].concat(this.state.notifications)
				});
			}
			setTimeout((function () {
				this.setState({ notifications: this.state.notifications.slice(0,-1) });
			}).bind(this), 2500);
		}
	},

	clearUnread: function() {
		this.setState({ unreadCount: 0 });
	},

	openDock: function (title) {
		if (this.state.visibleDock !== title) {
			this.setState({visibleDock: title});
		}
	},

	handleBlur: function() {
		this.setState({ visibleDock: null });
	},

	render: function () {
		var notifications = this.state.notifications.map(function(notification) {
			return (
				<li className='notification' key={notification.key}>
					{notification.content}
				</li>
			);
		});

		return (
			<div className='dockContainer'>
				<ReactCSSTransitionGroup className='notificationList' component={React.DOM.ul} transitionName='notification'>
					{notifications}
				</ReactCSSTransitionGroup>
				<OptionDock
					lightTheme={this.props.lightTheme}
					changeTheme={this.props.changeTheme}
					savePatch={this.props.savePatch}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
				<VideoDock
					videoStatus={this.props.videoStatus}
					audioStatus={this.props.audioStatus}
					peers={this.props.peers}
					peerColors={this.props.peerColors}
					audioSub={this.props.audioSub}
					videoSub={this.props.videoSub}
					shareVideo={this.props.shareVideo}
					unshareVideo={this.props.unshareVideo}
					muteVideo={this.props.muteVideo}
					subscribeVideo={this.props.subscribeVideo}
					unsubscribeVideo={this.props.unsubscribeVideo}
					muteSubscribed={this.props.muteSubscribed}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
				<NotificationDock
					peerColors={this.props.peerColors}
					notifications={this.state.persistentNotifications}
					unreadCount={this.state.unreadCount}
					clearUnread={this.clearUnread}
					openDock={this.openDock}
					visibleDock={this.state.visibleDock} />
				<div className='dockBlocker'></div>
			</div>
		);
	}
});

module.exports = DockContainer;
