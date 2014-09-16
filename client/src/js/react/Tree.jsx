/** @jsx React.DOM */

var React = require('react');

var Node = React.createClass({
    getInitialState: function() {
        return {
            opened: this.props.opened
        };
    },

    handleClick: function() {
        this.props.onClick(this);
    },

    render: function() {
        var classList = [];
        if(!this.props.leaf) {
            classList.push('togglable');
            if(this.state.opened) classList.push('icon-arrow-up');
            else classList.push('icon-arrow-down');
        }

        if (this.props.selected) classList.push('selected');
        if (this.props.modified) classList.push('modified');

        return (
            <ul>
                <li>
                    <label onClick={this.handleClick} className={classList.join(' ')}>
                        {this.props.name}
                    </label>
                    {this.props.children}
                </li>
            </ul>
        );
    }

});

var Tree = React.createClass({
    getInitialState: function() {
        return {};
    },

    handleClick: function(node) {
        if (this.props.user && this.props.repo) {
            if (node.props.leaf) {
                this.props.onSelectFile(this.props.user, this.props.repo, node.props.sha, node.props.name, node.props.path);
            } else {
                this.props.onToggleOpen(this.props.user, this.props.repo, node.props.path, !node.props.opened);
                //TODO: Make this optimistic
                //node.setState( {'opened' : !node.props.opened} );
            }
        }
    },

    //TODO: make sure this is bulletproof before enabling
/*
    shouldComponentUpdate: function(nextProps, nextState) {
        var shouldUpdate = false;
        for(key in nextProps) {
            if(nextProps[key] !== this.props[key]) shouldUpdate = true;
        }
        return shouldUpdate;

        return true;
    },
*/

    renderNode: function(node, isRoot) {
        if (!node) return;

        var childNodes;
        if (node.children && node.opened) {
            childNodes = node.children.map((function(node) {
                return this.renderNode(node, false);
            }).bind(this));
        }

        if (isRoot) {
            return (
                <div id="treeRoot">
                    {childNodes}
                </div>
            );
        }
        return (
            <Node key={node.path + node.opened + node.selected}
                  name={node.sha !== 'master' ? node.name : '/'}
                  path={node.path}
                  sha={node.sha}
                  opened={node.opened}
                  selected={node.selected}
                  modified={node.modified}
                  leaf={node.children? false : true}
                  onClick={this.handleClick}>
                  {childNodes}
            </Node>
        );
    },

    render: function() {
        return (
            <div className="treePane">
              {this.renderNode(this.props.data, true)}
            </div>
        );
    }
});

module.exports = Tree;
