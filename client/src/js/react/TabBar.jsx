/** @jsx React.DOM */
var React = require('react');

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
        this.setState({tabs: tabs, activeTab: tabs.length-1, tabWidth: tabWidth});
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
        this.setState({tabs: tabs, activeTab: activeTab});
        e.stopPropagation();
    },

    selectTab: function(i, e) {
        this.setState({activeTab: i});
        e.stopPropagation();
    },

    resizeTabs: function() {
        var tabWidth = 100 / this.state.tabs.length;
        if(this.state.tabWidth !== tabWidth) {
            this.setState({tabWidth: tabWidth});
        }
    },

    render: function() {
        var tabs = this.state.tabs.map((function(s, i) {
            var isActive = false;
            if(this.state.activeTab === i) isActive = true;

            return (
                <li className={isActive? 'active' : ''}
                    style={{width: this.state.tabWidth + '%'}}>
                    <div className="tabClose"
                         onClick={this.closeTab.bind(null, i)}
                         onDoubleClick={this.closeTab.bind(null, i)}>
                         {'\u2715'}
                    </div>
                    <div className="tabTitle"
                         onClick={this.selectTab.bind(null, i)}
                         onDoubleClick={this.selectTab.bind(null, i)}>
                         {s}
                    </div>
                </li>
            );
        }).bind(this));

        return (
            <div>
                <ul className="tabBar" onMouseLeave={this.resizeTabs} onDoubleClick={this.newTab}>
                    {tabs}
                </ul>
            </div>
        );
    }
});

module.exports = TabBar;
