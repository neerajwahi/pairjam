/** @jsx React.DOM */
var React = require('react');
var Tab = require('./Tab.jsx')

var TabBar = React.createClass({
    getInitialState: function() {
        return {
            tabs: this.props.initialTabs,
            activeTab: 0,
            dragTab: {},
            tabWidth: 100 / this.props.initialTabs.length,
        };
    },

    newTab: function() {
        var tabs = this.state.tabs.concat(['*']);
        var tabWidth = 100 / tabs.length;
        this.setState({
            tabs: tabs,
            activeTab: tabs.length-1,
            tabWidth: tabWidth
        });
    },

    closeTab: function(i, e) {
        var tabs = this.state.tabs;
        var activeTab = this.state.activeTab;
        tabs.splice(i, 1);

        activeTab = activeTab <= i? activeTab : activeTab-1;
        if(activeTab >= tabs.length) activeTab--;

        if(tabs.length === 0) {
            tabs = ['New tab'];
            activeTab = 0;
        }
        this.setState({
            tabs: tabs,
            activeTab: activeTab
        });
        e.stopPropagation();
    },

    selectTab: function(i, e) {
        this.setState({
            activeTab: i
        });
        e.stopPropagation();
    },

    resizeTabs: function() {
        var tabWidth = 100 / this.state.tabs.length;
        if(this.state.tabWidth !== tabWidth) {
            this.setState({
                tabWidth: tabWidth
            });
        }
    },

    render: function() {
        var stateTabs = this.state.tabs;
        var hidden = stateTabs.length < 10;
        var tabs = hidden ? [] : stateTabs.map((function(s, i) {
            return (
                <Tab
                    className={this.state.activeTab === i ? 'active' : ''}
                    key={i}
                    tabState={s}
                    width={this.state.tabWidth}
                    closeTab={this.closeTab}
                    selectTab={this.selectTab}>
                </Tab>
            );
        }).bind(this));

        return (
            <ul
                className={(hidden ? 'hidden ' : '') + 'tabBar'}
                onMouseLeave={this.resizeTabs}
                onDoubleClick={this.newTab}>
                {tabs}
            </ul>
        );
    }
});

module.exports = TabBar;
