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
	},

	setFocus: function() {
		adapter.setFocus();
	},
	
	// TODO: 'languageMode' should not live with AceAdapter
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

	refreshMarkers: function(firstRow, lastRow, cursors) {
		for(var s=0; s<cursors.length; s++) {
			var sel = cursors[s].sel;

			for(var i=0; i<sel.length; i++) {
				// User marker
				var pos = this.doc.indexToPosition( sel[i][1] );
				if(pos.row < firstRow) {
					document.getElementById('userBehindMarker').style.visibility = 'visible';
				} else if(pos.row > lastRow) {
					document.getElementById('userAheadMarker').style.visibility = 'visible';
				} else {
					document.getElementById('userBehindMarker').style.visibility = 'hidden';
					document.getElementById('userAheadMarker').style.visibility = 'hidden';
				}
			}
		}
	},

    // This component doesn't really fall under React's control, so don't re-render it
    shouldComponentUpdate: function(nextProps, nextState) {
        return false;
    },

    render: function() {
        return (
        	<div>
        		<pre id='editor'></pre>
                <div id="userBehindMarker">Below</div>
                <div id="userAheadMarker">Above</div>
        	</div>
        );
    }

});

module.exports = CodeEditor;
