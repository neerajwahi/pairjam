var ot = require('./ot.js');

function CodeDocument(defaultText) {
	this.text = defaultText || '';
	this.rev = 0;
	this.history = [];
	this.lang = 'Text';

	this.filename = 'default.txt';
	this.filepath = 0;

	this.cursors = {};
}

CodeDocument.prototype = {
	// Apply an operation to the document
	apply: function(op, rev) {
		//console.log(this.text);
		if(rev < this.rev) {
			var priorOps = this.history.slice(rev);
			for(var i = 0; i < priorOps.length; i++) {
				op = ot.xform(op, priorOps[i])[0];
			}
		}
		this.text = ot.applyOp(this.text, op);
		this.history.push(op);
		this.rev++;
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
