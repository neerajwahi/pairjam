/** @jsx React.DOM */

var React = require('react/addons');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Notification = React.createClass({
    getInitialState: function() {
        return {
            displayTime: 2500
        };
    },

    addItem: function(item) {
        this.setProps( { items: [item].concat(this.props.items) } );
        if(!item.keepAlive) {
            setTimeout(function() {
                this.clearItem( item )
            }.bind(this), this.state.displayTime);
        }
        return item;
    },

    replaceItem: function(oldItem, newItem) {
        this.clearItem(oldItem);
        this.addItem(newItem);
        return newItem;
    },

    clearItem: function(item) {
        if(item) {
            var length = this.props.items.length;
            var items = [];

            for(var i=0; i<length; i++) {
                if( this.props.items[i] !== item ) {
                    items.push( this.props.items[i] );
                }
            }

            this.setProps( { items: items } );
        }
    },

    render: function() {
        items = this.props.items.map( function(item) {
            return (
                <div className={item.type}>
                    {item.content}
                </div>
            );
        });

        return (
            <div>
                { items }
            </div>
        );
    }
});

module.exports = Notification;
