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

                        <p>Subscribe to our <a target="_blank" href="http://eepurl.com/3G245" className='mailing'>mailing list</a> to stay informed on future updates.</p>
                        {this.state.showMailingNo ?
                            <form action={"//neerajwahi.us9.list-manage.com/subscribe/post-json?u=c79cc599085f47a39065ff3f1&amp;id=98bd15cce9&c=?"} method="get" id="mc-embedded-subscribe-form" onSubmit={this.postEmail} name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                            <div className="inputGroup">
                                <input className="emailInput" name="EMAIL" id="mce-EMAIL" type='text' placeholder={name.replace(/\s+/g, '').toLowerCase() + '@hotmail.com'}/>
                                <input type="submit" className='icon-mail' />
                            </div> 
                            <div style={{position: 'absolute', left: -5000}}><input type="text" name="b_c79cc599085f47a39065ff3f1_98bd15cce9" tabIndex="-1" value="" /></div>
                            </form> : ''
                        }
					</div>
                </div>
            );
	    }
	    return (<div></div>);
    }
});

module.exports = ModalWindow;
