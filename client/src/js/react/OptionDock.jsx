var React = require('react');
var Dock = require('./Dock.jsx');

var OptionDock = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    handleThemeChange: function (event) {
        this.props.changeTheme(event.target.value);
    },

    render: function() {
        var peers = this.props.peers;
        var listItems = [
            <li key='lightTheme'>
                Light theme?
                <input type="checkbox" value={this.props.lightTheme} onChange={this.handleThemeChange} />
            </li>,
            <li key='gitPatch'>
                Download Git patch
                <input type="checkbox" value={this.props.audioStatus !== 'off'} onChange={this.handleAudioShare} />
            </li>
        ];

        return (
            <Dock classList='optionDock' icon='icon-settings'>
                {listItems}
            </Dock>
        );
    }
});

module.exports = OptionDock;
