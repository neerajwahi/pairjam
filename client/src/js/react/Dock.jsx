var React = require('react');

var Dock = React.createClass({
	getInitialState: function() {
		return {};
	},

	handleClick: function() {
		this.props.openDock(this.props.name);
		if (this.props.action) this.props.action();
	},

	render: function() {
		return (
			<div className={'dock' +
				(this.props.visibleDock === this.props.name ? ' open' : '') +
				(this.props.classList ? ' ' + this.props.classList : '')} >
				<button
					className={this.props.icon}
					onClick={this.handleClick} />
				<div className="members">
					<ul>{this.props.children}</ul>
				</div>
			</div>
		);
	}
});

module.exports = Dock;
