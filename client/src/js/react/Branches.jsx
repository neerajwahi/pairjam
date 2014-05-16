/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
	  return {};
	},

	handleClick: function(e) {
	  var sha = e.currentTarget.dataset.sha;
	  var branch = e.currentTarget.innerText;
	  this.props.onSelectBranch(sha);

	  return false;
	},

	_renderList: function(branches) {
	  return branches.map(this._renderBranch.bind(this));
	},

	_renderBranch: function(branch) {
	  return <li>
		<label
		  onClick={this.handleClick}
		  data-sha={branch.commit.sha}>
		  {branch.name}
		</label>
	  </li>;
	},

	render: function() {
	  return (
	  	<div className="treePane">
			<ul>
			  {this._renderList(this.props.branches)}
			</ul>
		</div>
	  )
	}
});
