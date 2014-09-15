var React = require('react');

var indicatorContainer = React.createClass({
    getInitialState: function() {
        return {
            peerPos: {}
        };
    },

    handleClick: function () {
    	// TODO: Scroll to user
    },

    render: function() {
		var topIndicators = [], bottomIndicators = [];
		var peers = this.props.peers;

		Object.keys(peers).forEach(function (id) {
			var pos = this.state.peerPos[id];
            if (pos) {
            	(pos < 0 ? topIndicators : bottomIndicators).push(
            		<Indicator
            			name={peers[id].name}
            			color={this.props.peerColors[id]} />
				);
            }
        });

        return (
            <div className="indicatorContainer">
            	<ul className="topIndicators">
            		{topIndicators}
            	</ul>
            	<ul className="bottomIndicators">
            		{bottomIndicators}
            	</ul>
            </div>
        );
    }
});

var Indicator = React.createClass({
    handleClick: function () {
    	// TODO: Scroll to user
    },

    render: function() {
        return (
        	<li data-user={this.props.name} data-color={this.props.color}></li>
        );
    }
});

module.exports = indicatorContainer;
