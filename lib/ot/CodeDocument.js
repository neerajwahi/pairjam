var ot = require('./ot.js');

function CodeDocument(defaultText) {
	this.text = defaultText || '';
	this.origText = this.text;

	this.rev = 0;
	this.history = [];
	this.lang = 'Javascript';

	this.filename = 'welcome.js';
	this.filepath = 0;

	this.cursors = {};
}

CodeDocument.prototype = {
	// Apply an operation to the document
	// TODO: check error checking
	apply: function(op, rev) {
		//console.log(this.text);
		try {
			if(rev < this.rev) {
				var priorOps = this.history.slice(rev);
				for(var i = 0; i < priorOps.length; i++) {
					op = ot.xform(op, priorOps[i])[0];
				}
			}
			this.text = ot.applyOp(this.text, op);
			this.history.push(op);
			this.rev++;
		} catch(e) {
			logger.log('error', e);
			logger.log('error', op);
		}
		return op;
	},

	setText: function(text) {
		this.text = text;
		this.history = [];
		this.lang = 'Text';
		this.cursors = {};
		this.rev = 0;
	},

	// Change a cursor
	setCursor: function(id, cursor) {
		this.cursors[id] = cursor;
	},

	removeCursor: function(id) {
		delete this.cursors[id];
	}
};

module.exports = CodeDocument;
