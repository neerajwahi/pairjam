var React = require('react');

var indicatorContainer = React.createClass({
    getInitialState: function() {
        return {
            peerPos: {}
        };
    },

    handleClick: function (cursor) {
    	// TODO: Scroll to user
        this.props.scrollToCursor(cursor);
    },

    render: function() {
		var topIndicators = [], bottomIndicators = [];
        var peers = this.props.peers;
        var peerColors = this.props.peerColors;
        var peerPos = this.state.peerPos;
        var peerCursors = this.props.peerCursors;

		Object.keys(peers).forEach((function(id) {
			var pos = peerPos[id];
            if (pos) {
            	(pos < 0 ? topIndicators : bottomIndicators).push(
            		<Indicator
            			name={peers[id].name}
            			color={peerColors[id]}
                        handleClick={this.handleClick.bind(null, peerCursors[id])} />
				);
            }
        }).bind(this));

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
    render: function() {
        return (
        	<li data-user={this.props.name}
                data-color={this.props.color}
                onClick={this.props.handleClick} ></li>
        );
    }
});

module.exports = indicatorContainer;
