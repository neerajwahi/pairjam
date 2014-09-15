var React = require('react');
var Notification = require('./Notification.jsx');

var Dock = React.createClass({
	getInitialState: function() {
		return {
			open: false
		};
	},

	handleClick: function () {
		this.setState({ open: !this.state.open });
		if (this.props.action) this.props.action();
	},

	render: function() {
		return (
			<div className={'dock' + (this.props.classList ? ' ' + this.props.classList : '')} >
				<button className={this.props.icon + (this.state.open ? ' open' : '')} onClick={this.handleClick} />
				<div className="members">
					<ul>
						{this.props.children}
					</ul>
				</div>
			</div>
		);
	}
});

module.exports = Dock;
