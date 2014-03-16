/** @jsx React.DOM */

var React = require('react');
var uuid = require('node-uuid');

// TODO: get rid of uuid here

var Notification = React.createClass({

    getInitialState: function() {
        return {
            items: [],
            pendingNotice: {},
            displayTime: 2500
        };
    },

    addItem: function(item) {
        var pending = this.state.pendingNotice;

        var items = this.state.items.filter( function(elem) {
            return (elem !== pending);
        } );

        pending = item.keepAlive? item : {};
        this.setState( { pendingNotice: pending, items: [item].concat(items) } );

        if(!item.keepAlive) {
            setTimeout( (function() {
                this.clearItem(item);
            }).bind(this), this.state.displayTime);
        }
        return item;
    },

    clearItem: function(item) {
        var items = this.state.items.filter( function(elem) {
            return (elem !== item);
        } );
        this.setState( { items: items } );
    },

    render: function() {
        items = this.state.items.map( function(item) {
            return (
                <div key={uuid.v4()} className={item.type}>
                    {item.content}
                </div>
            );
        });

        return (
            <div className="notificationPopup">
                { items }
            </div>
        );
    }

});

module.exports = Notification;
