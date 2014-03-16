/** @jsx React.DOM */

var React = require('react');

// TODO: refactor this code
var Video = React.createClass({

    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <div id='mainVideo' className='notInSession'>
                <img src='img/video-camera.svg' />
            </div>
        );
    }

});

module.exports = Video;
