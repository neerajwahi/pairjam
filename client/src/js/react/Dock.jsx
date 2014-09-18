var React = require('react');

var Dock = React.createClass({
	getInitialState: function() {
		return {};
	},

	/*componentDidMount: function() {
		var checkboxes = this.props.children;
		console.log(checkboxes);
		//.querySelectorAll('input[type=checkbox]');
		//TODO do in for loop instead
		[].forEach.call(checkboxes, function(box) {
			var switchery = new Switchery(box, {color: '#72d572'});
		});
	},*/

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
