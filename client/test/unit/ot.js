/**
	Test suite for the OT library
	Checks:
		- Applying operations
		- Composing operations
		- Transforming operations

	Any errors in these functions would render collaborative editing unstable
*/

var assert = require('assert');
var ot = require('../../../lib/ot/ot.js');

// Test 'applyOp'
describe('OT: applying operations to document', function() {

    it('Insertion: "abcd" -> "abxscd" ', function() {
    	var input = 'abcd';
    	var expected = 'abxscd';
    	var op = [ 2, 'xs', 2 ];

    	assert( expected === ot.applyOp(input, op) );
    });

    it('Deletion: "abcd" -> "" ', function() {
    	var input = 'abcd';
    	var expected = '';
    	var op = [ -4 ];
    	assert( expected === ot.applyOp(input, op) );
    });

	it('Disjoint deletion: "abxcd" -> "axd" ', function() {
    	var input = 'abxcd';
    	var expected = 'axd';
    	var op = [ 1, -1, 1, -1, 1 ];
    	assert( expected === ot.applyOp(input, op) );
    });

    it('Error on invalid operation (operation does not span document) ', function() {
    	var input = 'abxcd';
    	var expected = 'axd';
    	var op = [ 2, 'xs', 1 ];
    	var fn = function() { ot.applyOp(input, op); };
    	assert.throws( fn, Error );
    });

});

// Test 'packOp'
describe('OT: pack operations', function() {

	it('Consecutive operations', function() {
    	var input = [ 2, 3, 'xs', 'y', 1, 2 ];
	    var expected = [ 5, 'xsy', 3 ];
    	assert( JSON.stringify(expected) === JSON.stringify(ot.packOp(input)) );
    });


	it('Subops with ret = 0 should be removed', function() {
    	var input = [ 2, 1, 0, 'xs', 'y', 0, 2 ];
	    var expected = [ 3, 'xsy', 2 ];
    	assert( JSON.stringify(expected) === JSON.stringify(ot.packOp(input)) );
    });

});

// Test 'xform'
describe('OT: operational transforms', function() {

	/**
		Utility function
		Basically, we require that S( A, B' ) = S( A, X(B, A) ) = S( B, X(A, B) ) = S( B, A' )
		where S( A, B ) = document after applying A and then B
		and X( A, B ) = transform operation A -past- operation B (resulting in A')
	*/
 	function checkTransform(input, expected, opA, opB) {
    	var prime = ot.xform(opA, opB);
    	//console.log(prime);
    	var result1 = ot.applyOp( ot.applyOp( input, opB ), prime[0] );
    	var result2 = ot.applyOp( ot.applyOp( input, opA ), prime[1] );
    	assert( expected === result1 );
    	assert( expected === result2 );
	}

    it('2 no-ops, A: "abcd" -> "abcd" past B: "abcd" -> "abcd"', function() {
    	var input = 'abcd';
    	var expected = 'abcd';
    	var opA = [ 4 ];
       	var opB = [ 4 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('2 insertions at diff spots, A: "abcd" -> "xabcd" past B: "abcd" -> "abcdx"', function() {
    	var input = 'abcd';
    	var expected = 'xabcdx';
    	var opA = [ 'x', 4 ];
       	var opB = [ 4, 'x' ];
    	checkTransform(input, expected, opA, opB);
    });

    it('2 deletions at diff spots, A: "abcd" -> "acd" past B: "abcd" -> "abd"', function() {
    	var input = 'abcd';
    	var expected = 'ad';
    	var opA = [ 1, -1, 2 ];
       	var opB = [ 2, -1, 1 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('2 insertions at same spot, A: "abcd" -> "abxcd" past B: "abcd" -> "abyzcd"', function() {
    	var input = 'abcd';
    	var expected = 'abxyzcd';
    	var opA = [ 2, 'x', 2 ];
       	var opB = [ 2, 'yz', 2 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('2 deletions at same spot, A: "abcdef" -> "abef" past B: "abcdef" -> "abf"', function() {
    	var input = 'abcdef';
    	var expected = 'abf';
    	var opA = [ 2, -2, 2 ];
       	var opB = [ 2, -3, 1 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('Non-overlapping ins and del, A: "abcdef" -> "abxyzcdef" past B: "abcdef" -> "abc"', function() {
    	var input = 'abcdef';
    	var expected = 'abxyzc';
    	var opA = [ 2, 'xyz', 4 ];
       	var opB = [ 3, -3 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('Overlapping ins and del, A: "abcdef" -> "abcxyzdef" past B: "abcdef" -> "af"', function() {
    	var input = 'abcdef';
    	var expected = 'axyzf';
    	var opA = [ 3, 'xyz', 3 ];
       	var opB = [ 1, -4, 1 ];
    	checkTransform(input, expected, opA, opB);
    });

    it('No-ops, A: "abcd" -> "abcdx" past B: "abcd" -> "avbcd"', function() {
        var input = 'abcd';
        var expected = 'avbcdx';
        var opA = [ 0, 4, 0, 'x', 0 ];
        var opB = [ 0, 1, 'v', 3, 0 ];
        //checkTransform(input, expected, opA, opB);
    });
});

// Test 'compose'
describe('OT: operational compositions', function() {

	/**
		Utility function
		Basically, we require that S( A, B' ) = S( A, X(B, A) ) = S( B, X(A, B) ) = S( B, A' )
		where S( A, B ) = document after applying A and then B
		and X( A, B ) = transform operation A -past- operation B (resulting in A')
	*/
 	function checkComposition(input, opA, opB) {
    	var C = ot.compose(opA, opB);
    	//console.log(C);
    	var result1 = ot.applyOp( ot.applyOp( input, opA ), opB );
    	var result2 = ot.applyOp( input, C );
    	assert( result1 === result2 );
	}

    it('2 no-ops, A: "abcd" -> "abcd" and B: "abcd" -> "abcd"', function() {
    	var input = 'abcd';
    	var opA = [ 4 ];
       	var opB = [ 4 ];
    	checkComposition(input, opA, opB);
    });

    it('2 insertions at diff spots, A: "abcd" -> "xabcd" and B: "xabcd" -> "xabcdx"', function() {
    	var input = 'abcd';
    	var opA = [ 'x', 4 ];
       	var opB = [ 5, 'x' ];
    	checkComposition(input, opA, opB);
    });

    it('2 deletions at diff spots, A: "abcd" -> "acd" and B: "acd" -> "ad"', function() {
    	var input = 'abcd';
    	var opA = [ 1, -1, 2 ];
       	var opB = [ 1, -1, 1 ];
    	checkComposition(input, opA, opB);
    });

    it('2 insertions at same spot, A: "abcd" -> "abxcd" and B: "abxcd" -> "abxyzcd"', function() {
    	var input = 'abcd';
    	var opA = [ 2, 'x', 2 ];
       	var opB = [ 3, 'yz', 2 ];
    	checkComposition(input, opA, opB);
    });

    it('2 deletions at same spot, A: "abcdef" -> "abef" and B: "abef" -> "ab"', function() {
    	var input = 'abcdef';
    	var opA = [ 2, -2, 2 ];
       	var opB = [ 2, -2 ];
    	checkComposition(input, opA, opB);
    });

    it('Non-overlapping ins and del, A: "abcdef" -> "abxyzcdef" and B: "abxyzcdef" -> "abxyzcf"', function() {
    	var input = 'abcdef';
    	var opA = [ 2, 'xyz', 4 ];
       	var opB = [ 6, -2, 1 ];
    	checkComposition(input, opA, opB);
    });

    it('Overlapping ins and del, A: "abcdef" -> "abcxyzdef" and B: "abcxyzdef" -> "aef"', function() {
    	var input = 'abcdef';
    	var opA = [ 2, 'xyz', 4 ];
       	var opB = [ 1, -6, 2 ];
    	checkComposition(input, opA, opB);
    });
});