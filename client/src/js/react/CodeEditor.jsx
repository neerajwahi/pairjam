var React = require('react');

// Note: as of right now the variable 'ace' is globally available
// Not ideal
var Adapter = require('../../../../lib/ot/AceAdapter.js');
var adapter = undefined;

var CodeEditor = React.createClass({

	componentDidMount: function() {
		adapter = new Adapter(ace, 'editor');

		adapter.onOp = (function(op) {
			this.props.onDocChg(op);
		}).bind(this);

		adapter.onCursor = (function(cursor) {
			this.props.onCursorChg(cursor);
		}).bind(this);
	},

	setFocus: function() {
		adapter.setFocus();
	},
	
	getMode: function() {
		return adapter.getMode();
	},

	applyOp: function(op) {
		adapter.applyOp(op);
	},

	updateCursors: function(cursors) {
		adapter.setMarkers( cursors );
	},

	updateDoc: function(doc, filename) {
		adapter.setDoc( doc, filename );
	},

    // The code editor doesn't really fall under React's control, so don't re-render it
    shouldComponentUpdate: function(nextProps, nextState) {
        return false;
    },

    render: function() {
        return (<pre id='editor'></pre>);
    }

});

module.exports = CodeEditor;
