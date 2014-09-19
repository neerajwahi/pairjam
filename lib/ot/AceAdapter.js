var modelist = ace.require('ace/ext/modelist');

function drawUserMarkerFn(name, colorClass) {
	return function(html, range, left, top, config) {
		var firstRow = config.firstRow;
		var lastRow = config.lastRow;

		var leftPos = left;
		var topPos = top + config.lineHeight;

		var el, caret;
		el = '<div class="userMarker ' + colorClass + '" style="left: ' + leftPos + 'px; top: ' + topPos + 'px">'+name+'</div>';
		caret = '<div class="ace_cursor ' +
					colorClass + '" style="left: ' +
					leftPos + 'px; top: ' + top + 'px;' +
					'height: ' + config.lineHeight + 'px; width:7px; background: none;"></div>';

		if(el) html.push(el);
		if(caret) html.push(caret);
	};
}

function ret(e) {
	return (typeof e === 'number' && e >= 0);
}

function ins(e) {
	return (typeof e === 'string');
}

function del(e) {
	return (typeof e === 'number' && e < 0);
}

var AceAdapter = function(ace, elId) {
	this.ace = ace;
	this.elId = elId;
	this.editor = this.ace.edit(elId);
	this.editor.resize(true);
	this.session = this.editor.getSession();
	this.doc = this.session.getDocument();

	this.lastLines = this.doc.getAllLines();
	this.lastSel = [];

	this.Range = ace.require('ace/range').Range;
	this.suppressEvents = false;

	this.init();

	// TODO: cursors should live in CodeEditor.jsx
	this.markerIds = {};
};

AceAdapter.prototype = {
	onOp: function(op) {
		// Empty implementation
	},

	onCursor: function(cursor) {
		// Empty implementation
	},

	onRender: function(fn) {
		//TODO: clean this up (make this render not scroll?)
		var onBeforeRender = (function() {
			var firstRow = this.editor.renderer.getFirstFullyVisibleRow();
			var lastRow = this.editor.renderer.getLastFullyVisibleRow();
			var firstIdx = this.doc.positionToIndex( {'row' : firstRow, 'column' : 0 }, 0 );
			var lastIdx = this.doc.positionToIndex( {'row' : lastRow, 'column' : 0 }, 0 );
			fn(firstIdx, lastIdx);
		}).bind(this);

		this.editor.renderer.on('beforeRender', onBeforeRender);
	},

	getAllLangs: function() {
		return modelist.modes.map( function(mode) {
			return mode.caption;
		});
	},

	saveState : function() {
		this.lastLines = this.doc.getAllLines();
	},

	init: function() {
		var _this = this;

		this.editor.setTheme("ace/theme/" + (localStorage.lightTheme === "true" ? "spacegray" : "tomorrow_night_eighties"));
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

		var onChangeCursor = (function() {
			if(_this.suppressEvents === true) return;

			setTimeout( function() {
				var sel = _this.getSelection();
				if(sel && sel.length) {
				_this.onCursor( sel );
				}
			}, 0);
		}).bind(this);

		this.session.selection.on('changeSelection', onChangeCursor);
		this.session.selection.on('changeCursor', onChangeCursor);

		this.editor.setFontSize(13);
		this.editor.renderer.setPadding(8);
	},

	setTheme: function(theme) {
		this.editor.setTheme(theme);
	},

	setFocus: function() {
		this.editor.focus();
	},

	setDoc: function(doc, filename) {
		this.suppressEvents = true;

		var mode;
		this.editor.setValue( doc, -1 );
		if(filename) {
			mode = modelist.getModeForPath( filename );
			this.session.setMode(mode.mode);
		}
		this.saveState();
		this.suppressEvents = false;

		if(mode) return mode.caption;
		else return undefined;
	},

	setLang: function(lang) {
		var mode = modelist.modes.filter( function(item) {
			return (item.caption === lang);
		});
		this.session.setMode(mode[0].mode);
		return lang;
	},

	addMarker: function(id, name, colorClass, cursor) {
		var marker1 = this.session.addMarker({}, 'userMarker', drawUserMarkerFn(name, colorClass), true);
		var marker2 = this.session.addMarker({}, 'lineHighlight ' + colorClass, 'line', true);
		this.markerIds[id] = [marker1, marker2];
	},

	removeMarker: function(id) {
		this.session.removeMarker( this.markerIds[id][0] );
		this.session.removeMarker( this.markerIds[id][1] );
		delete this.markerIds[id];
	},

	updateMarkers: function(clients, colorClasses, cursors) {
		var markers = this.session.getMarkers(true), marker1, marker2, id, cursor;
		for (id in cursors) {
			if (!this.markerIds.hasOwnProperty(id)) {
				// Add marker
				this.addMarker(id, clients[id].name, colorClasses[id], cursors[id]);
			}
		}

		for(id in this.markerIds) {
			if (!cursors.hasOwnProperty(id)) {
				// Remove marker
				this.removeMarker(id);
			} else {
				// Update marker
				cursor = cursors[id];
				marker1 = markers[ this.markerIds[id][0] ];
				marker2 = markers[ this.markerIds[id][1] ];

				marker1.range = this.indicesToRange( [ cursor[1], cursor[1] === 0? cursor[1] + 1 : cursor[1] - 1 ] );
				marker2.range = this.indicesToRange( [Math.min(cursor[0], cursor[1]), Math.max(cursor[0], cursor[1])] );
				this.editor.renderer.updateFrontMarkers();
			}
		}
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
			return sel;
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
		op.push( start );

		if( delta.action === 'insertLines' ) {
			text = delta.lines.join('\n') + '\n';
			op.push( text );
			op.push( docLen - start );
		} else if( delta.action === 'removeLines' ) {
			text = delta.lines.join('\n') + '\n';
			op.push( -text.length);
			op.push( docLen - start - text.length );
		} else if( delta.action === 'insertText' ) {
			op.push( delta.text );
			op.push( docLen - start );
		} else if( delta.action === 'removeText' ) {
			op.push( -delta.text.length );
			op.push( docLen - start - delta.text.length );
		}

		this.saveState();
		return op;
	},

	applyOp : function(op) {
		this.suppressEvents = true;

		var e, pos, index=0;
		for(var i=0; i < op.length; i++) {
			e = op[i];
			if( ret(e) ) {
				// Retain
				index += e;
			} else if( del(e) ) {
				// Delete
				var from = this.doc.indexToPosition( index, 0 );
				var to = this.doc.indexToPosition( index - e, 0 );
				var range = this.Range.fromPoints( from, to );
				this.doc.remove( range );
			} else if( ins(e) ) {
				// Insert
				pos = this.doc.indexToPosition( index, 0 );
				this.doc.insert(pos, e);
				index += e.length;
			}
		}

		this.saveState();

		this.suppressEvents = false;
	},

	scrollToCursor: function(cursor) {
		var cur = cursor[0] < cursor[1]? cursor[0] : cursor[1];
		var pos = this.doc.indexToPosition(cur, 0);
		this.editor.setAnimatedScroll(true);
		this.editor.gotoLine(pos.row, pos.column, true);
		//this.editor.scrollToLine(pos.row, false, true, function() {});
	}
};

module.exports = AceAdapter;
