
module.exports = {

	'buildTree' : function(flat) {
		/*
		flat.sort( function(a, b) {
			if(a['type'] === 'tree' && b['type'] !== 'tree') return 1;
			else if(a['type'] !== 'tree' && b['type'] === 'tree') return 1;
			else return !a.path.localeCompare(b);
		} );
		*/

		var node = { name: 'master', sha: 0 }, temp = node;
		console.log(temp);

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
					var subNode = temp.children.filter(function (obj) {
		    			return obj.name === splitPath[j];
					})[0];

					if(subNode) temp = subNode;
					else temp = temp.children.push( { 'name' : splitPath[j], 'sha' : sha } );
				}
			}
		}

		return node;
	}

};