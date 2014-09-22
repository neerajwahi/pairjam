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

	componentDidUpdate: function() {
		var notifications = this.refs.notificationList.getDOMNode().querySelectorAll('.replaceable');
		var el, prevWidth, newWidth;
		for (var i = 0, _len = notifications.length; i < _len; i++) {
			el = notifications[i];
			prevWidth = getComputedStyle(el).width;
			el.style.width = 'auto';
			newWidth = getComputedStyle(el).width;
			el.style.width = prevWidth;
			el.offsetWidth; // force repaint
			el.style.width = newWidth;
		}
	},

	pushNotification: function(notification) {
		if (notification) {
			var newList = this.state.notifications;
			var newId = notification.itemId;

			// TODO: use a better UID
			notification.key = Math.random();

			if (newId) {
				newList = newList.filter(function(existing) {
					return existing.itemId !== newId ? true : (notification.key = existing.key) && false;
				});
			}

			newList = [notification].concat(newList);

			if (notification.keepHistory) {
				this.setState({
					unreadCount: this.state.unreadCount + 1,
					persistentNotifications: [notification].concat(this.state.persistentNotifications),
					notifications: newList
				});
			} else {
				this.setState({
					notifications: newList
				});
			}

			if (!notification.keepAlive) {
				setTimeout((function() {
					this.clearNotification(notification);
				}).bind(this), notification.displayTime || 2500);
			}
		}
	},

	clearNotification: function(notification) {
        var notifications = this.state.notifications.filter(function(existing) {
            return existing !== notification;
        });
        this.setState( {notifications: notifications} );
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
				<li className={'notification' + (notification.itemId ? ' replaceable' : '')} key={notification.key}>
					{notification.content}
				</li>
			);
		});

		return (
			<div className='dockContainer'>
				<ReactCSSTransitionGroup
					ref='notificationList'
					className='notificationList'
					component={React.DOM.ul}
					transitionName='notification' >
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
