/*
	OT
	Library for operational transformations

	Heavily influenced by https://github.com/Operational-Transformation/ot.js

	Great article on OT: http://www.codecommit.com/blog/java/understanding-and-applying-operational-transformation

*/

function ret(e) {
	return (typeof e === 'number' && e >= 0);
}

function ins(e) {
	return (typeof e === 'string');
}

function del(e) {
	return (typeof e === 'number' && e < 0);
}

module.exports = {

	// Apply a single operation and return the new document
	applyOp : function(pre, op) {
		var len = op.length, cur = 0, post = [], e = 0;

		for(var i = 0; i < len && (e = op[i]); i++) {
			if(ret(e)) post.push( pre.slice(cur, cur += e) );
			else if(del(e)) cur -= e;
			else if(ins(e)) post.push(e);
		}

		if(cur != pre.length) throw new Error('Operation does not span document');
		return post.join('');
	},

	packOp : function(op) {
		var packed = [], j = 0, len = op.length;
		for(var i = 0; i < len; i++) {
			var e = op[i];

			// TODO: make the rest of the library work with 0 retains
			if( ret(e) && e > 0 ) {
				if( j > 0 && ret(packed[j-1]) ) packed[j-1] += e;
				else packed[j++] = e;
			} else if( ins(e) ) {
				if( j > 0 && ins(packed[j-1]) ) packed[j-1] += e;
				else packed[j++] = e;
			} else if( del(e) ) {
				if( j > 0 && del(packed[j-1]) ) packed[j-1] += e;
				else packed[j++] = e;
			}
		}
		return packed;
	},

	compose : function(A, B) {
		var C = [], i = 0, j = 0, a = A[0], b = B[0];

		function subCompose() {
			var len_a = ins(a)? a.length : Math.abs(a);
			var len_b = Math.abs(b);

			if( len_a > len_b ) {
				if( ins(a) ) {
					if( ret(b) ) C.push( a.slice(0, len_b) );
					a = a.slice(len_b);
				} else if( ret(a) ) {
					C.push( b );
					a -= len_b;
				}

				b = B[++j];
			} else {
				if( !(del(b) && ins(a)) ) C.push( del(b)? -a : a );

				if( len_a !== len_b ) b = (del(b)? b + len_a : b - len_a);
				else b = B[++j];
				a = A[++i];
			}
		}

		while( i < A.length || j < B.length ) {
			if( del(a) ) {
				C.push( a );
				a = A[++i];
			} else if( ins(b) ) {
				C.push( b );
				b = B[++j];
			}
			else if( typeof a === 'undefined' || typeof b === 'undefined' ) break;
			else subCompose();
		}

		if( i < A.length || j < B.length ) {
			throw new Error('Operation length mismatch, A = ' + JSON.stringify(A) + ', B = ' + JSON.stringify(B));
		}

		return this.packOp(C);
	},

/*
	xform: function(A, B) {
		function align(A, B) {

		}

		function simpleXform(e) {
			var len = e.length;
			for(var i=0; i<len; i++) {
				var a = e[0], b = e[1];
				if( ins(a) )
			}
		}

		var aligned = align(A, B);
		return aligned.map( simpleXform );
	},
*/

	xform : function(A, B) {
		var Ap = [], Bp = [], i = 0, j = 0, a = A[0], b = B[0];

		function subXform() {
			// For how many characters do the two commands overlap?
			var len_a = Math.abs(a);
			var len_b = Math.abs(b);
			var overlap = Math.min( len_a, len_b );

			if( ret(a) && ret(b) ) {
				Ap.push( overlap );
				Bp.push( overlap );
			} else if( del(a) && ret(b) ) {
				Ap.push( -overlap );
			} else if( ret(a) && del(b) ) {
				Bp.push( -overlap );
			}

			if( len_a >= len_b ) {
				// If subop A spans more chars than subop B, push B ptr forward and reduce the chars in subop A
				if( len_a !== len_b ) a = del(a)? -(len_a - len_b) : (len_a - len_b);
				else a = A[++i];
				b = B[++j];
			} else {
				// If subop B spans more chars than subop A, push A ptr forward and reduce the chars in subop B
				b = del(b)? -(len_b - len_a) : (len_b - len_a);
				a = A[++i];
			}
		}

		while( i < A.length || j < B.length ) {
			// Inserts are always preserved
			if( ins(a) ) {
				Ap.push( a );
				Bp.push( a.length );
				a = A[++i];
			} else if( ins(b) ) {
				Bp.push( b );
				Ap.push( b.length );
				b = B[++j];
			}
			else if( typeof a === 'undefined' || typeof b === 'undefined' ) break;
			else subXform();
		}

		if( i < A.length || j < B.length ) {
			throw new Error('Operation length mismatch, A = ' + i + ', B = ' + j);
		}

		return [ this.packOp(Ap), this.packOp(Bp) ];
	},

	xformIdx : function(idx, op) {
		var cur = 0, len = op.length;
		for(var i = 0; i < len; i++) {
			var e = op[i];

			if( ret(e) ) {
				cur += e;
			} else if( ins(e) ) {
				idx += (cur <= idx? e.length : 0);
				cur += e.length;
			} else if( del(e) ) {
				idx -= (cur < idx? Math.min( -e, idx - cur ) : 0);
			}
		}
		return idx;
	}
};