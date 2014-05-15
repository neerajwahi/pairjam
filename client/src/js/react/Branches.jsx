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
        <a
          onClick={this.handleClick}
          data-sha={branch.commit.sha}>
          {branch.name}
        </a>
      </li>;
    },

    render: function() {
      return (
        <ul class="branches-list">
          {this._renderList(this.props.branches)}
        </ul>
      )
    }
});
