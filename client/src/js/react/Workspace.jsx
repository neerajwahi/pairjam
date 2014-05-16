/** @jsx React.DOM */

var React = require('react');
var Tree = require('./Tree.jsx');
var Branches = require('./Branches.jsx');


module.exports = React.createClass({
	getInitialState: function() {
		return {
		  showTree: true
		};
	},

	currentBranchName: function() {
	  var sha = this.props.sha;
	  var branches = this.props.branches.filter(function(branch) {
		if (branch.commit.sha == sha) {
		  return branch;
		}
	  });

	  // TODO: could be weird
	  return branches.length > 0 ? branches[0].name : sha;
	},

	handleClick: function() {
	  this.setState({ showTree: !this.state.showTree });
	},

	onBranchClick: function(sha) {
	  this.props.onSelectBranch(this.props.user, this.props.repo, sha);
	  this.setState({ showTree: !this.state.showTree });
	},

	render: function() {
		if (!Object.keys(this.props.data).length) {
			return <div></div>;
		}

	  	var tree = <Tree ref='tree'
			user={this.props.user}
			repo={this.props.repo}
			data={this.props.data}
			onSelectFile={this.props.onSelectFile}
			onToggleOpen={this.props.onToggleOpen} />;

	  	var branches = <Branches
			branches={this.props.branches}
			onSelectBranch={this.onBranchClick} />;

		var body = this.state.showTree? tree : branches;

		return <div id="workspace">
		  <a onClick={this.handleClick} className="current-branch">{this.currentBranchName()}</a>
		  {body}
		</div>

	}
});
