/** @jsx React.DOM */

var React = require('react');

var TreeNode = React.createClass({

    getInitialState: function() {
        return {
            isOpen: false
        };
    },

    render: function() {

        var childNodes;
        var className = "";
        if (this.props.node.children != null) {
            var _this = this;
            var children = this.props.node.children;

            childNodes = children.map( function(node) {
                return (<TreeNode user={_this.props.user} repo={_this.props.repo} node={node} onLoadDoc={_this.props.onLoadDoc} />);
            });

            className = "togglable";
            if (this.state.isOpen) className += " togglable-down";
            else className += " togglable-up";
        } else {
            
        }

        var style = {};
        if (!this.state.isOpen) style.display = "none";

        childNodes = (
            <ul style={style}>
                <li>                      
                    {childNodes}
                </li>
            </ul>
        );

        return (
            <ul>
                <li onClick={this.toggle} className={className}>
                    {this.props.node.name}
                </li>
                <li>{ this.props.node.children? childNodes : '' }</li>
            </ul>
        );
    },

    toggle: function() {
        if(this.props.node.children != null) {
            this.setState({isOpen: !this.state.isOpen});
        } else {
            this.loadDocument();
        }
    },

    loadDocument: function() {
        if( this.props.user && this.props.repo )
            this.props.onLoadDoc( this.props.user, this.props.repo, this.props.node.sha, this.props.node.name );
    }

});

module.exports = TreeNode;

