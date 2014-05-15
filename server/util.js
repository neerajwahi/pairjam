
module.exports = function() {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz';

	return {
	 	generateSessionId : function(length) {
		    var result = '';
		    for (var i = 0; i < length; i++) result += chars[ Math.round(Math.random() * (chars.length - 1)) ];
		    return result;
		},

		//TODO: speed this up (can't let it take too much time on large repos)
		buildTree : function(flat) {

			var filterFn = function (obj) {
				return obj.name === splitPath[j];
			};

			var node = {},
				temp = node;

			for(var i = 0; i < flat.length; i++) {
				var flatNode = flat[i];
				var splitPath = flatNode.path.split('/');
				var sha = flatNode.sha;
				temp = node;

				for(var j = 0 ; j < splitPath.length; j++) {
					if(!temp.children) {
						temp.children = [ { 'name' : splitPath[j], 'sha' : sha } ];
						temp = temp.children[0];
					} else {
						var subNode = temp.children.filter(filterFn)[0];

						if(subNode) temp = subNode;
						else {
							var obj = { 'name' : splitPath[j], 'sha' : sha };
							temp.children.push( obj );
							temp = obj;
						}
					}
				}

				temp.path = flatNode.path;
			}

			return node;
		},

		setKeyOnTreePath: function(tree, path, key, value) {
			if(tree.path === path) tree[key] = value;
			if(tree.children) {
				tree.children.map( (function(node) {
					this.setKeyOnTreePath(node, path, key, value);
				}).bind(this) );
			}
		},

		clearKeyOnTree: function(tree, key) {
			if(tree[key]) delete tree[key];
			if(tree.children) {
				tree.children.map( (function(node) {
					this.clearKeyOnTree(node, key);
				}).bind(this) );
			}
		}
	};
}();
