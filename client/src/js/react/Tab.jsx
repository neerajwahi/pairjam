/** @jsx React.DOM */
var React = require('react');
var Draggable = require('react-draggable');

var Tab = React.createClass({
    getInitialState: function() {
        return {
            position: {
                top: 0, left: 0
            }
        };
    },
    render: function() {
        return (
            <Draggable
                axis="x">
                <li
                    style={{width: this.props.width + '%', left: this.state.position.left}}>
                    <div className="tabClose"
                        onClick={this.props.closeTab.bind(null, this.key)}
                        onDoubleClick={this.props.closeTab.bind(null, this.key)}>
                        {'\u2715'}
                    </div>
                    <div className="tabTitle"
                        onClick={this.props.selectTab.bind(null, this.key)}
                        onDoubleClick={this.props.selectTab.bind(null, this.key)}>
                        {this.props.tabState}
                    </div>
                </li>
            </Draggable>
        );
    }
});

module.exports = Tab;
