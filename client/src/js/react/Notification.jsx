/** @jsx React.DOM */
var React = require('react');

// TODO: add key to items for React
var Notification = React.createClass({
    getInitialState: function() {
        return {
            items: [],
            displayTime: 2500
        };
    },

    addItem: function(item) {
        var items = this.state.items.filter(function(elem) {
            return item.itemId? (elem.itemId !== item.itemId) : true;
        });

        this.setState({
            items: [item].concat(items)
        });

        if (!item.keepAlive) {
            setTimeout((function() {
                this.clearItem(item);
            }).bind(this), this.state.displayTime);
        }
        return item;
    },

    clearItem: function(item) {
        var items = this.state.items.filter(function(elem) {
            return (elem !== item);
        });
        this.setState({
            items: items
        });
    },

    render: function() {
        items = this.state.items.map(function(item) {
            return (
                <div className={item.type}>
                    {item.content}
                </div>
            );
        });

        return (
            <div className="notificationPopup">
                {items}
            </div>
        );
    }
});

module.exports = Notification;
