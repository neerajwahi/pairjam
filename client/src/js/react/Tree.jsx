/** @jsx React.DOM */

var React = require('react');
var uuid = require('node-uuid');

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
        if(this.props.children) {
            classList.push('togglable');
            if(this.state.opened) classList.push('togglable-down');
            else classList.push('togglable-up');
        }

        if(this.props.selected) classList.push('selected');

        return (
            <ul>
                <li>
                    <label onClick={this.handleClick} className={classList.join(' ')}>
                        {this.props.name}
                    </label>
                    { this.state.opened? this.props.children : '' }
                </li>
            </ul>
        );
    }

});

var Tree = React.createClass({

    getInitialState: function() {
        return {};
    },

    handleClick : function(node) {
        if( this.props.user && this.props.repo ) {
            if( !node.props.children ) {
                this.props.onLoadDoc( this.props.user, this.props.repo, node.props.sha, node.props.name, node.props.path );
            } else {
                this.props.openFolder( this.props.user, this.props.repo, node.props.path, !node.props.opened );
                node.setState( {'opened' : !node.props.opened} );
            }
        }
    },

    renderNode : function(node) {
        if(!node) return;

        var childNodes;
        if(node.children) {
            childNodes = node.children.map( (function(node) {
                return this.renderNode(node);
            }).bind(this) );
        }

        return (
            <Node   key={uuid.v4()}
                    name={node.name}
                    path={node.path}
                    sha={node.sha}
                    opened={node.opened}
                    selected={node.selected}
                    onClick={this.handleClick}>
                {childNodes}
            </Node>
        );
    },

    render: function() {
        return (
            <div>{this.renderNode(this.props.data)}</div>
        );
    }
});

module.exports = Tree;

