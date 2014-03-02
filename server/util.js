
module.exports = function() {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz';

	return {
	 	'generateSessionId' : function(length) {
		    var result = '';
		    for (var i = 0; i < length; i++) result += chars[ Math.round(Math.random() * (chars.length - 1)) ];
		    return result;
		}
	};
}();