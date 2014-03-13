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
	this.ace = ace;
	this.aceSession = session;
	this.aceDoc = this.aceSession.getDocument();

	this.lastLines = this.aceDoc.getAllLines();
	this.lastSel = [];

	this.Range = ace.require('ace/range').Range;
};

function drawUserMarkerFn(name, id) {
	return function(html, range, left, top, config) {
		var firstRow = config.firstRow;
		var lastRow = config.lastRow;

		var leftPos = left;
		var topPos = top + config.lineHeight;

		var el, caret;
		if(range.start.row == firstRow) {
			topPos = top + config.lineHeight;
			el = '<div class="userMarker guest1" style="left: ' + leftPos + 'px; top: ' + topPos + 'px">'+name+'</div>';
			caret = '<div class="ace_cursor guest1" style="left: ' + leftPos + 'px; top: ' + top + 'px;'
						+ 'height: ' + config.lineHeight + 'px; width:7px; background: none;"></div>';
		} else {
			el = '<div class="userMarker guest1" style="left: ' + leftPos + 'px; top: ' + topPos + 'px">'+name+'</div>';
			caret = '<div class="ace_cursor guest1" style="left: ' + leftPos + 'px; top: ' + top + 'px;'
						+ 'height: ' + config.lineHeight + 'px; width:7px; background: none;"></div>';
		}

		if(el) html.push(el);
		if(caret) html.push(caret);
	};
}

AceAdapter.prototype = {


	clearMarkers : function() {
		var markers = this.aceSession.getMarkers(true);
		for(var i in markers) {
			if(markers.hasOwnProperty(i)) {
				if(markers[i].clazz=='userMarker')
					this.aceSession.removeMarker(markers[i].id);
			}
		}

		markers = this.aceSession.getMarkers(false);
		for(var i in markers) {
			if(markers.hasOwnProperty(i)) {
				if(markers[i].clazz.indexOf('lineHighlight') !== -1)
					this.aceSession.removeMarker(markers[i].id);
			}
		}
	},

	setMarkers : function(sels, csscls) {
		this.clearMarkers();

		for(var s=0; s<sels.length; s++) {
			var sel = sels[s].sel;

			for(var i=0; i<sel.length; i++) {
				// Selection highlight
				var tempSel = [ sel[i][0], sel[i][1] ];
				if(sel[i][0] > sel[i][1]) tempSel = [ sel[i][1], sel[i][0] ];

				var rng = this.indicesToRange( tempSel );
				this.aceSession.addMarker(rng, 'lineHighlight guest1', 'line', false);

				// User marker
				rng = this.indicesToRange( [ sel[i][1], sel[i][1] === 0? sel[i][1] + 1 : sel[i][1] - 1 ] );
				this.aceSession.addMarker(rng, 'userMarker', drawUserMarkerFn(sels[s].name, 0), true);
			}
		}
	},

	saveState : function() {
		this.lastLines = this.aceDoc.getAllLines();
	},

	getSelection : function() {
		var rng = this.aceSession.selection.getRange();
		var curRng = this.aceSession.selection.getCursor();
		var sel = this.rangeToIndices(rng);

		// Cursor is at the beginning of the selection, so let's invert the tuple
		if(curRng.row === rng.start.row && curRng.column === rng.start.column) {
			sel = [ sel[1], sel[0] ];
		}

		if( !(sel[0] === this.lastSel[0] && sel[1] === this.lastSel[1]) ) {
			this.lastSel = sel;
			return [sel];
		}
		return [];
	},

	getCursor: function() {
		console.log( this.aceSession.selection.getCursor() );
		return [];
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
