var modelist = ace.require('ace/ext/modelist');

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

var AceAdapter = function(ace, elId) {
	this.ace = ace;
	this.elId = elId;
	this.editor = this.ace.edit(elId);
	this.session = this.editor.getSession();
	this.doc = this.session.getDocument();

	this.lastLines = this.doc.getAllLines();
	this.lastSel = [];

	this.Range = ace.require('ace/range').Range;
	this.suppressEvents = false;

	this.languageMode = 'Text';
	this.init();
};

AceAdapter.prototype = {
	onOp: function(op) {
		// Empty implementation
	},

	onCursor: function(cursor) {
		// Empty implementation
	},

	init: function() {
		this.editor.setTheme("ace/theme/tomorrow_night_eighties");
		this.session.setMode("ace/mode/javascript");
		this.session.setUseWorker(false);
		this.editor.setShowFoldWidgets(false);

		this.editor.renderer.on('themeLoaded', (function() {

			document.getElementById(this.elId).style.visibility = 'visible';

		}).bind(this));

		this.editor.getSession().on('change', (function(e) {
		    if(this.suppressEvents === true) return;

			var op = this.opFromDelta( e.data );
			this.onOp( op );

		}).bind(this));

		var _this = this;
		var onChangeCursor = function() {
			setTimeout( function() {
			    if(_this.suppressEvents === true) return;

		   		var sel = _this.getSelection();
			    if(sel && sel.length) {
			    	_this.onCursor( sel );
			    }
			}, 0);
		};

		this.session.selection.on('changeSelection', onChangeCursor);
		this.session.selection.on('changeCursor', onChangeCursor);
	},

	setFocus: function() {
		this.editor.focus();
	},

	getMode: function() {
		return this.languageMode;
	},

	setDoc: function(doc, filename) {
		this.suppressEvents = true;

		this.editor.setValue( doc, -1 );
		if(filename) {
			var mode = modelist.getModeForPath( filename );
			this.session.setMode(mode.mode);
			this.languageMode = mode.caption;
		}
		this.saveState();

		this.suppressEvents = false;
	},

	clearMarkers : function() {
		var markers = this.session.getMarkers(true);
		for(var i in markers) {
			if(markers.hasOwnProperty(i)) {
				if(markers[i].clazz=='userMarker')
					this.session.removeMarker(markers[i].id);
			}
		}

		markers = this.session.getMarkers(false);
		for(var i in markers) {
			if(markers.hasOwnProperty(i)) {
				if(markers[i].clazz.indexOf('lineHighlight') !== -1)
					this.session.removeMarker(markers[i].id);
			}
		}
	},

	setMarkers : function(sels, csscls) {
		this.suppressEvents = true;

		this.clearMarkers();

		for(var s=0; s<sels.length; s++) {
			var sel = sels[s].sel;

			for(var i=0; i<sel.length; i++) {
				// Selection highlight
				var tempSel = [ sel[i][0], sel[i][1] ];
				if(sel[i][0] > sel[i][1]) tempSel = [ sel[i][1], sel[i][0] ];

				var rng = this.indicesToRange( tempSel );
				this.session.addMarker(rng, 'lineHighlight guest1', 'line', false);

				// User marker
				rng = this.indicesToRange( [ sel[i][1], sel[i][1] === 0? sel[i][1] + 1 : sel[i][1] - 1 ] );
				this.session.addMarker(rng, 'userMarker', drawUserMarkerFn(sels[s].name, 0), true);
			}
		}

		this.suppressEvents = false;
	},

	saveState : function() {
		this.lastLines = this.doc.getAllLines();
	},

	getSelection : function() {
		var rng = this.session.selection.getRange();
		var curRng = this.session.selection.getCursor();
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

	rangeToIndices : function(rng) {
		var start = this.doc.positionToIndex( {'row' : rng.start.row, 'column' : rng.start.column }, 0 );
		var end = this.doc.positionToIndex( {'row' : rng.end.row, 'column' : rng.end.column }, 0 );
		return [start, end];
	},

	indicesToRange : function(indices) {
		var from = this.doc.indexToPosition( indices[0], 0 );
		var to = this.doc.indexToPosition( indices[1], 0 );
		var rng = this.Range.fromPoints( from, to );
		return rng;
	},

	opFromDelta : function(delta) {
		var start = this.doc.positionToIndex( delta.range.start );
		var end = this.doc.positionToIndex( delta.range.end );
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
		this.suppressEvents = true;

		var elem, pos, index=0;
		for(var i=0; i < op.length; i++) {
			elem = op[i];
			if( elem.ret ) {
				// Retain
				index += elem.ret;
			} else if( elem.del ) {
				// Delete
				var from = this.doc.indexToPosition( index, 0 );
				var to = this.doc.indexToPosition( index + elem.del, 0 );
				var range = this.Range.fromPoints( from, to );
				this.doc.remove( range );
			} else if( elem.ins ) {
				// Insert
				pos = this.doc.indexToPosition( index, 0 );
				this.doc.insert(pos, elem.ins);
				index += elem.ins.length;
			}
		}

		this.saveState();

		this.suppressEvents = false;
	}
};

module.exports = AceAdapter;
