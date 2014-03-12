/*
	OT
	Library for operational transformations

	Heavily influenced by https://github.com/Operational-Transformation/ot.js

	Great article on OT: http://www.codecommit.com/blog/java/understanding-and-applying-operational-transformation
*/

module.exports = function ot() {
	var _this = this;

	function getType(subop, type) {
		if(subop) {
			if(subop.hasOwnProperty('ret')) return 'ret';
			if(subop.hasOwnProperty('ins')) return 'ins';
			if(subop.hasOwnProperty('del')) return 'del';
		}
		return 'unknown';
	}

	function isType(subop, type) {
		if( getType(subop) === type ) return true;
		else return false;
	}

	return {
		// Apply a single operation and return the new document
		applyOp : function(doc, op) {
			var elem, newDoc = [], index = 0, j = 0;

			for(var i=0; i < op.length; i++) {
				elem = op[i];
				if( elem.ret ) {
					// Retain
					newDoc[j++] = doc.slice(index, index + elem.ret);
					index += elem.ret;
				} else if( elem.del ) {
					// Delete
					index += elem.del;
				} else if( elem.ins ) {
					// Insert
					newDoc[j++] = elem.ins;
				}
			}

			if(index !== doc.length) throw new Error('Operation does not span document, op = ' + JSON.stringify(op) + ' doc = ' + doc);
			return newDoc.join('');
		},

		// Compose operation A with operation B, return operation C (which contains effects of A + B)
		compose : function(Ain, Bin) {
			var A = JSON.parse(JSON.stringify(Ain)),
				B = JSON.parse(JSON.stringify(Bin)),	// A and B
				C = [],									// C = the composed operation
				iA = 0, iB = 0,							// index of A and index of B
				subA = A[0], subB = B[0];				// element of A and element of B

			function processSubOp(typeA, typeB) {
				var lenA = typeA === 'ins'? subA.ins.length : subA[typeA];
				var lenB = subB[typeB];

				if( lenA > lenB ) {
					if( typeA === 'ins' ) {
						if( typeB === 'ret' ) C.push( {'ins' : subA.ins.slice(0, lenB)} );
						subA.ins = subA.ins.slice(lenB);
					} else if( typeA === 'ret' ) {
						if( typeB === 'del' ) C.push( {'del' : lenB} );
						else if( typeB === 'ret') C.push( {'ret' : lenB} );
						else throw new Error('Subop B must be either a delete or retain');

						subA[typeA] = lenA - lenB;
					} else throw new Error('Subop A must be either an insert or retain');

					subB = B[++iB];
				} else {
					if( typeB === 'ret' && typeA === 'ins' ) C.push( {'ins' : subA.ins} );
					else if( typeB === 'ret' && typeA === 'ret' ) C.push( {'ret' : lenA} );
					else if( typeB === 'del' && typeA === 'ret' ) C.push( {'del' : lenA} );

					if( lenA !== lenB ) subB[typeB] = lenB - lenA;
					else subB = B[++iB];
					subA = A[++iA];
				}
			}

			// Main loop
			while( iA < A.length || iB < B.length ) {
				if( subA && subA.del ) {
					C.push( {'del' : subA.del} );
					subA = A[++iA];
				}
				else if( subB && subB.ins ) {
					C.push( {'ins' : subB.ins} );
					subB = B[++iB];
				}
				else if( typeof subA === 'undefined' || typeof subB === 'undefined' ) break;
				else processSubOp( getType(subA), getType(subB) );
			}

			if( iA < A.length || iB < B.length ) {
				throw new Error('Operation length mismatch, A = ' + JSON.stringify(A) + ', B = ' + JSON.stringify(B));
			}
			return this.packOp(C);
		},

		/**
			Pack an operation into its simplest representation
			Example:
				ret 1, ret 2, del 1, ret 3
				=> ret 3, del 1, ret 3
		*/
		packOp : function(op) {
			var packed = [], j = 0;
			for(var i = 0; i < op.length; i++) {
				if( op[i].ret ) {
					if( j > 0 && packed[j-1].ret ) packed[j-1].ret += op[i].ret;
					else packed[j++] = { 'ret' : op[i].ret };
				} else if( op[i].ins ) {
					if( j > 0 && packed[j-1].ins ) packed[j-1].ins += op[i].ins;
					else packed[j++] = { 'ins' : op[i].ins };
				} else if( op[i].del ) {
					if( j > 0 && packed[j-1].del ) packed[j-1].del += op[i].del;
					else packed[j++] = { 'del' : op[i].del };
				}
			}
			return packed;
		},

		// Transform operation A past operation B, return [ A', B' ]
		xform : function(Ain, Bin) {
			var A = JSON.parse(JSON.stringify(Ain)),
				B = JSON.parse(JSON.stringify(Bin)),	// A and B
				Ap = [], Bp = [],						// A' and B'
				iA = 0, iB = 0,							// index of A and index of B
				subA = A[0], subB = B[0];			// subop of A and subop of B

			function processIns(X, subX) {
				Array.prototype.push.call( X === A? Ap : Bp, {'ins' : subX.ins} );
				Array.prototype.push.call( X === A? Bp : Ap, {'ret' : subX.ins.length} );
				if(X === A) subA = A[++iA];
				else subB = B[++iB];
			}

			function processSubOp(typeA, typeB) {
				// For how many characters do the two commands overlap?
				var overlapLen = Math.min( subA[typeA], subB[typeB] );

				if( subA[typeA] >= subB[typeB] ) {
					// If subop A spans more chars than subop B, push B ptr forward and reduce the chars in subop A
					if( subA[typeA] !== subB[typeB] ) subA[typeA] = subA[typeA] - subB[typeB];
					else subA = A[++iA];
					subB = B[++iB];
				} else {
					// If subop B spans more chars than subop A, push A ptr forward and reduce the chars in subop B
					subB[typeB] = subB[typeB] - subA[typeA];
					subA = A[++iA];
				}

				if( typeA === 'ret' && typeB === 'ret' ) {
					Ap.push( {'ret': overlapLen} );
					Bp.push( {'ret': overlapLen} );
				} else if( typeA === 'del' && typeB === 'ret' ) {
					Ap.push( {'del': overlapLen} );
				} else if( typeB === 'del' && typeA === 'ret' ) {
					Bp.push( {'del': overlapLen} );
				}
			}

			// Main loop
			while( iA < A.length || iB < B.length ) {
				// Inserts are always preserved
				if( isType(subA, 'ins') ) processIns(A, subA);
				else if( isType(subB, 'ins') )	processIns(B, subB);
				else if( typeof subA === 'undefined' || typeof subB === 'undefined' ) break;
				else processSubOp( getType(subA), getType(subB) );
			}

			if( iA < A.length || iB < B.length ) {
				throw new Error('Operation length mismatch, iA = ' + iA + ' iB = ' + iB + ' A = ' + JSON.stringify(A) + ' B = ' + JSON.stringify(B));
			}
			return [ this.packOp(Ap), this.packOp(Bp) ];
		},

		// Transform an index in the text against the text transform
		xformIdx : function(idx, op) {
			var cur = 0;
			for(var i = 0; i < op.length; i++) {
				if( isType(op[i], 'ret') ) {
					cur += op[i].ret;
				} else if( isType(op[i], 'ins') ) {
					idx += cur <= idx? op[i].ins.length : 0;
					cur += op[i].ins.length;
				} else if( isType(op[i], 'del') ) {
					idx -= cur < idx? Math.min( op[i].del, idx - cur ) : 0;
				}
			}
			return idx;
		}
	};
}();