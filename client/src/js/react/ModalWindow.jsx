/** @jsx React.DOM */

var React = require('react');

var ModalWindow = React.createClass({
    getInitialState: function() {
        return {
        	visible: true,
        	userName: 'Guest'
        };
    },

    handleSuccess: function(e) {
        e.preventDefault();
    	this.setState( {visible: false} );
    	this.props.onSuccess(this.state);
        return false;
    },

    onChange : function(e) {
    	this.setState( {userName: e.target.value} );
    },

    render: function() {
    	if(this.state.visible) {
	        return (
                <form className='modalContainer' onSubmit={this.handleSuccess}>
					<div className='modalWindow'>
                        <div>Welcome!</div>
                        <div style={ {float: 'right'} }>
                            <div>
                                <label>Your name:</label>
                                <input type='text' onChange={this.onChange} value={this.state.userName} />
                            </div>
    						<div className='btn btn-success' onClick={this.handleSuccess}>Join</div>
                        </div>
					</div>
                </form>
            );
	    }
	    return (<div></div>);
    }
});

module.exports = ModalWindow;
