/** @jsx React.DOM */

var React = require('react');

var LangBox = React.createClass({

    getInitialState: function() {
        return {
        	opened: false
        };
    },

    handleClick: function(e) {
    	this.setState( {opened: !this.state.opened} );
    },

    itemClick: function(e) {
    	var lang = e.target.dataset.lang;
    	this.props.onChoseLang(lang);
    	this.setState( {opened: false} );
    },

    hideMenu: function() {
    	if(this.state.opened) {
    		this.setState( {opened: false} );
    	}
    },

    componentDidUpdate: function(prevProps, prevState) {
    	if(this.state.opened) {
    		if(this.refs.langPopup) {
    			this.refs.langPopup.getDOMNode().focus();
    		}
    	}
    },

    // TODO: fix this - clicking on lang box does not close menu
    render: function() {
    	var popupMenu = '';

    	if(this.state.opened) {
    		var nodes = this.props.langs.map( (function(e) {
    			return <div className='langBoxItem' key={e} onClick={this.itemClick} data-lang={e}>{e}</div>
    		}).bind(this) );
    		popupMenu = (
    			<div className='langBoxPopup' tabIndex="0" onBlur={this.hideMenu} ref='langPopup'>
    			{nodes}
    			</div>
    		);
    	}

        return (
	        <div>
	            {popupMenu}
	            <div className="langBox" onClick={this.handleClick}>{this.props.lang}</div>
	        </div>
        );
    }

});

module.exports = LangBox;
