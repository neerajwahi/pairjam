/** @jsx React.DOM */

var React = require('react');

var ModalWindow = React.createClass({
    getInitialState: function() {
        return {
        	visible: true,
        	userName: '',
            showMailing: false
        };
    },

    handleSuccess: function(e) {
        e.preventDefault();
    	this.setState({
            visible: false
        });
    	this.props.onSuccess(this.state);
        return false;
    },

    onChange : function(e) {
    	this.setState({
            userName: e.target.value
        });
    },

    postEmail: function(e) {
        // TODO
    },

    toggleMailing: function() {
        this.setState({ showMailing: !this.state.showMailing });
    },

    render: function() {
    	if (this.state.visible) {
            var programmers = ['Ada Lovelace', 'Niklaus Wirth', 'Bill Gates', 'James Gosling', 'Guido van Rossum', 'Ken Thompson', 'Donald Knuth', 'Brian Kernighan', 'Tim Berners-Lee', 'Bjarne Stroustrup', 'Linus Torvalds', 'Dennis Ritchie'];
	        var name =  programmers[Math.floor(Math.random() * programmers.length)];
            return (
                <form className='modalContainer' onSubmit={this.handleSuccess}>
                    <div className='vcent'></div>
                    <div className='modalWindow'>
                        <h2>Pair programming in your browser</h2>
                        <a href="https://github.com/neerajwahi/pairjam" text="Star on GitHub" data-text="Star" className="github-button" data-icon="octicon-star" data-count-href="/neerajwahi/pairjam/stargazers" data-count-api="/repos/neerajwahi/pairjam#stargazers_count"></a>
                        <a href="https://github.com/neerajwahi/pairjam" text="Fork on GitHub" data-text="Fork" className="github-button" data-icon="octicon-git-branch" data-count-href="/neerajwahi/pairjam/network" data-count-api="/repos/neerajwahi/pairjam#forks_count"></a>

                        <p>Pairjam lets you code together, wherever you are. Load a public repository from Github; when you're done, everything is available to download as a patch.</p>
                        <div className="inputGroup">
                            <input type='text' onChange={this.onChange} value={this.state.userName} placeholder='Your Name'/>
        					<button className='icon-arrow-go' onClick={this.handleSuccess}></button>
                        </div>
                        <p>We've got loads of ideas; subscribe to our <span onClick={this.toggleMailing} className='mailing'>mailing list</span> if you want to stay in the loop.</p>
                        {this.state.showMailing ?
                            <div className="inputGroup">
                                <input className="emailInput" type='text' onChange={this.onChange} value={this.state.userName} placeholder={name.replace(/\s+/g, '').toLowerCase() + '@hotmail.com'}/>
                                <button className='icon-mail' onClick={this.postEmail}></button>
                            </div> : ''
                        }
					</div>
                </form>
            );
	    }
	    return (<div></div>);
    }
});

module.exports = ModalWindow;
