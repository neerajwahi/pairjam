var React = require('react');

var markdown = require( "markdown" ).markdown;

var MarkdownEditor = React.createClass({
	getInitialState: function() {
		return {
			doc: '**Test**'
		}
	},
	
    render: function() {
        return (
    		<div className='markdown' dangerouslySetInnerHTML={{
    			 	__html: markdown.toHTML(this.state.doc)
    			 }}>
    		</div>
        );
    }
});

module.exports = MarkdownEditor;
