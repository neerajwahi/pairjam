var React = require('react');

// Note: as of right now the variable 'ace' is globally available
// Not ideal

// TODO: figure out where to put AceAdapter
var LangBox = require('./LangBox.jsx');
var Adapter = require('../../../../lib/ot/AceAdapter.js');
var adapter = undefined;

var CodeEditor = React.createClass({
	getInitialState: function() {
		return {
			lang: 'Text',
			langs: [],
			cursors: []
		}
	},
	
	componentDidMount: function() {
		adapter = new Adapter(ace, 'editor');

		// TODO: don't like this method of callback
		// Event listeners?
		adapter.onOp = (function(op) {
			this.props.onDocChg(op);
		}).bind(this);

		adapter.onCursor = (function(cursor) {
			this.props.onCursorChg(cursor);
		}).bind(this);

		adapter.onRender(this.onRender);

		this.setState({
			langs: adapter.getAllLangs()
		});
	},

	onRender: function(firstRow, lastRow) {
		var clientPos = {};
		for (var key in this.state.cursors) {
			var cursor = this.state.cursors[key];

			if (cursor[0] < firstRow && cursor[1] < firstRow) {
				clientPos[key] = -1;
			} else if (cursor[0] > lastRow && cursor[1] > lastRow) {
				clientPos[key] = 1;
			} else {
				clientPos[key] = 0;
			}
		}
		this.props.onCursorPos(clientPos);
	},

	setFocus: function() {
		adapter.setFocus();
	},

	applyOp: function(op) {
		adapter.applyOp(op);
	},

	updateCursors: function() {
		adapter.updateMarkers(this.props.peers, this.props.peerColors, this.state.cursors);
	},

	updateDoc: function(doc, filename) {
		var lang = adapter.setDoc(doc, filename);
		this.setState({
			lang: lang
		});
		return lang;
	},

	updateLang: function(lang) {
		adapter.setLang(lang);
		this.setState({
			lang: lang
		});
	},

    render: function() {
        return (
        	<div>
        		<pre id='editor'></pre>
                <LangBox ref={'lang'}
             			 lang={this.state.lang}
                    	 langs={this.state.langs} 
                      	 onChoseLang={this.updateLang} />

        	</div>
        );
    }
});

module.exports = CodeEditor;
