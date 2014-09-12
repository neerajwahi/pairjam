module.exports = {
	setKeyOnTreePath: function(tree, path, key, value) {
		if (tree.path === path) tree[key] = value;
		if (tree.children) {
			tree.children.map((function(node) {
				this.setKeyOnTreePath(node, path, key, value);
			}).bind(this));
		}
	},

	clearKeyOnTree: function(tree, key) {
		if (tree[key]) delete tree[key];
		if (tree.children) {
			tree.children.map((function(node) {
				this.clearKeyOnTree(node, key);
			}).bind(this));
		}
	}
};
