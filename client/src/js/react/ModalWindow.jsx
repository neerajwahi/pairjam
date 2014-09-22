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
        if (this.state.userName.length) {
        	this.setState({
                visible: false
            });
        	this.props.onSuccess(this.state);
        }
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
	        var name = programmers[Math.floor(Math.random() * programmers.length)];
            return (
                <div className="modalContainer">
                    <div className='vcent'></div>
                    <div className='modalWindow'>
                        <h2>Pair programming in your browser</h2>
                        <a href="https://github.com/neerajwahi/pairjam" text="Star on GitHub" data-text="Star" className="github-button" data-icon="octicon-star" data-count-href="/neerajwahi/pairjam/stargazers" data-count-api="/repos/neerajwahi/pairjam#stargazers_count"></a>
                        <a href="https://github.com/neerajwahi/pairjam" text="Fork on GitHub" data-text="Fork" className="github-button" data-icon="octicon-git-branch" data-count-href="/neerajwahi/pairjam/network" data-count-api="/repos/neerajwahi/pairjam#forks_count"></a>

                        <p>Pairjam lets you code together, wherever you are. Load a public repository from Github; when you're done, everything is available to download as a patch.</p>
                        <form onSubmit={this.handleSuccess}>
                        <div className="inputGroup">
                                <input type='text' onChange={this.onChange} value={this.state.userName} placeholder='Your Name'/>
                                <button className='icon-arrow-go' onClick={this.handleSuccess}></button>
                        </div>
                        </form>

                        <p><a target="_blank" href="http://eepurl.com/3G245" className='mailing'>Sign up</a> for future updates.</p>

                        <p>This is a demo. It's likely full of bugs and comes with no warranty.</p>

                        <a href="https://github.com/neerajwahi/pairjam"><img style={{position: 'absolute', top: 0, right: 0, border: 0}} src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png" /></a>
					</div>
                </div>
            );
	    }
	    return (<div></div>);
    }
});

module.exports = ModalWindow;
