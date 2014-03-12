/*
	Converts ACE operations into 3 OT primitives:
	retain, insert, and delete

	Form of operations:
	var op = [
				{ 'ret' : 1 },
				{ 'del' : 6 },
				{ 'ins' : 'xkcd' },
				{ 'ret' : 3 }
	];

*/

var AceAdapter = function(ace, session) {

	this.aceSession = session;
	this.aceDoc = this.aceSession.getDocument();
	this.lastLines = this.aceDoc.getAllLines();

	this.Range = ace.require('ace/range').Range;

};

AceAdapter.prototype = {
	clearMarkers : function() {
		var markers = this.aceSession.getMarkers(true);
		for(var i in markers) {
			if(markers.hasOwnProperty(i)) {
				if(markers[i].clazz=="lineHighlight") this.aceSession.removeMarker(markers[i].id);
			}
		}
	},

	setMarkers : function(sels, csscls) {
		this.clearMarkers();

		for(var key in sels) {
			if(sels.hasOwnProperty(key)) {
				var sel = sels[key];

				for(var i=0; i<sel.length; i++) {
					var temp = sel[i];
					var rng = this.indicesToRange( sel[i] );
					this.aceSession.addMarker(rng, "lineHighlight", "text", true);
				}
			}
		}
	},

	saveState : function() {
		this.lastLines = this.aceDoc.getAllLines();
	},

	getSelection : function() {
		var ranges = this.aceSession.selection.getAllRanges();
		var i = ranges.length;
		var sel = [];

		while( i-- ) {
			sel.push( this.rangeToIndices(ranges[i]) );
		}

		return sel;
	},

	rangeToIndices : function(rng) {
		var start = this.aceDoc.positionToIndex( {'row' : rng.start.row, 'column' : rng.start.column }, 0 );
		var end = this.aceDoc.positionToIndex( {'row' : rng.end.row, 'column' : rng.end.column }, 0 );
		return [start, end];
	},

	indicesToRange : function(indices) {
		var from = this.aceDoc.indexToPosition( indices[0], 0 );
		var to = this.aceDoc.indexToPosition( indices[1], 0 );
		var rng = this.Range.fromPoints( from, to );
		return rng;
	},

	opFromDelta : function(delta) {
		var start = this.aceDoc.positionToIndex( delta.range.start );
		var end = this.aceDoc.positionToIndex( delta.range.end );
		var docLen = this.lastLines.join('\n').length;

		var op = [];

		//Retain to cursor
		op.push( {'ret' : start} );

		if( delta.action === 'insertLines' ) {
			text = delta.lines.join('\n') + '\n';
			op.push( {'ins' : text} );
			op.push( {'ret' : docLen - start} );
		} else if( delta.action === 'removeLines' ) {
			text = delta.lines.join('\n') + '\n';
			op.push( {'del' : text.length} );
			op.push( {'ret' : docLen - start - text.length} );
		} else if( delta.action === 'insertText' ) {
			op.push( {'ins' : delta.text} );
			op.push( {'ret' : docLen - start} );
		} else if( delta.action === 'removeText' ) {
			op.push( {'del' : delta.text.length} );
			op.push( {'ret' : docLen - start - delta.text.length} );
		}

		this.saveState();
		return op;
	},

	applyOp : function(op) {
		var elem, pos, index=0;
		for(var i=0; i < op.length; i++) {
			elem = op[i];
			if( elem.ret ) {
				// Retain
				index += elem.ret;
			} else if( elem.del ) {
				// Delete
				var from = this.aceDoc.indexToPosition( index, 0 );
				var to = this.aceDoc.indexToPosition( index + elem.del, 0 );
				var range = this.Range.fromPoints( from, to );
				this.aceDoc.remove( range );
			} else if( elem.ins ) {
				// Insert
				pos = this.aceDoc.indexToPosition( index, 0 );
				this.aceDoc.insert(pos, elem.ins);
				index += elem.ins.length;
			}
		}

		this.saveState();
	}
};

module.exports = AceAdapter;
