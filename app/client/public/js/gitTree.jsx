/** @jsx React.DOM */

var React = require('react');

var TreeNode = React.createClass({

    getInitialState: function() {
        return {
            visible: false
        };
    },

    render: function() {
        var childNodes;
        var className = "";
        if (this.props.node.children != null) {
            var _this = this;
            childNodes = this.props.node.children.map( function(node) {
                return (<TreeNode user={_this.props.user} repo={_this.props.repo} node={node} onLoadDoc={_this.props.onLoadDoc} />);
            });

            className = "togglable";
            if (this.state.visible) {
                className += " togglable-down";
            } else {
                className += " togglable-up";
            }
        }

        var style = {};
        if (!this.state.visible) {
            style.display = "none";
        }

        return (
            <ul>
                <li onClick={this.toggle} className={className}>
                    {this.props.node.name}
                </li>
                <li>
                    <ul style={style}>
                        <li>                      
                            {childNodes}
                        </li>
                    </ul>
                </li>
            </ul>
        );
    },

    toggle: function() {
        if(this.props.node.children != null) {
            this.setState({visible: !this.state.visible});
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

