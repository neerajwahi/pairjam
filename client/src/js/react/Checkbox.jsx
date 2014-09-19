var React = require('react');
var Switchery = require('../../../bower_components/switchery/switchery.js');

var Checkbox = React.createClass({
	getInitialState: function() {
		return {};
	},

	componentDidMount: function() {
		var domNode = this.getDOMNode();
		var switchery = new Switchery(domNode, {color: '#72d572'});
		domNode.onchange = this.props.handleChange;
	},

	render: function() {
		return (
			<input type="checkbox" />
		);
	}
});

module.exports = Checkbox;
