var React = require('react');

// Note: as of right now the variable 'ace' is globally available
// Not ideal
var Adapter = require('../../../../lib/ot/AceAdapter.js');
var adapter = undefined;

var CodeEditor = React.createClass({
	
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

		adapter.onRender( this.onRender );
	},

	onRender: function(firstRow, lastRow) {
		var clientPos = {};
		for(var key in this.props.cursors) {
			var cursor = this.props.cursors[key];

			if(cursor[0] < firstRow && cursor[1] < firstRow) clientPos[key] = -1;
			else if(cursor[0] > lastRow && cursor[1] > lastRow) clientPos[key] = 1;
			else clientPos[key] = 0;
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
		adapter.updateMarkers(this.props.peers, this.props.peerColors, this.props.cursors);
	},

	updateDoc: function(doc, filename) {
		return adapter.setDoc( doc, filename );
	},

    // This component doesn't really fall under React's control, so don't re-render it
    shouldComponentUpdate: function(nextProps, nextState) {
        return false;
    },

    render: function() {
        return (
        	<div>
        		<pre id='editor'></pre>
        	</div>
        );
    }

});

module.exports = CodeEditor;
