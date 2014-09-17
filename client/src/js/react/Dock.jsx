var React = require('react');
var Notification = require('./Notification.jsx');

var Dock = React.createClass({
	getInitialState: function() {
		return {};
	},

	/*componentDidMount: function() {
		var checkboxes = this.props.children;
		console.log(checkboxes);
		//.querySelectorAll('input[type=checkbox]');
		[].forEach.call(checkboxes, function(box) {
			var switchery = new Switchery(box, {color: '#72d572'});
		});
	},*/

	handleClick: function () {
		this.props.openDock(this.props.name);
		if (this.props.action) this.props.action();
	},

	render: function() {
		return (
			<div className={'dock' + (this.props.classList ? ' ' + this.props.classList : '')} >
				<button
					className={this.props.icon + (this.props.visibleDock === this.props.name ? ' open' : '')}
					onClick={this.handleClick} />
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
