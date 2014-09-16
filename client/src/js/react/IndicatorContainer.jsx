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
        var peerColors = this.props.peerColors;
        var peerPos = this.state.peerPos;

		Object.keys(peers).forEach(function(id) {
			var pos = peerPos[id];
            if (pos) {
            	(pos < 0 ? topIndicators : bottomIndicators).push(
            		<Indicator
            			name={peers[id].name}
            			color={peerColors[id]} />
				);
            }
        });

        var topLength = topIndicators.length;
        var bottomLength = bottomIndicators.length;

        return (
            <div className="indicatorContainer">
                {topLength ?
                    <ul className={'topIndicators' + (topLength !== 1 ? ' multi' : '')}>
                        {topIndicators}
                    </ul> : ''
                }
                {bottomLength ?
                    <ul className={'bottomIndicators' + (bottomLength !== 1 ? ' multi' : '')}>
                        {bottomIndicators}
                    </ul> : ''
                }
            </div>
        );
    }
});

var Indicator = React.createClass({
    handleClick: function() {
    	// TODO: Scroll to user
    },

    render: function() {
        return (
        	<li data-user={this.props.name} data-color={this.props.color}></li>
        );
    }
});

module.exports = indicatorContainer;
