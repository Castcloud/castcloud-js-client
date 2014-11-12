var Reflux = require('reflux');
var episodeStore = require('../stores/episodeStore.js');
var episodeActions = require('../actions/episodeActions.js');
var castStore = require('../stores/castStore.js');

var Episode = require('./Episode.jsx');

var EpisodeList = React.createClass({
    mixins: [
        Reflux.listenTo(episodeStore, "onEpisodesChanged"),
        Reflux.listenTo(castStore, "onCastsChanged", "onCastsChanged")
    ],

    getInitialState: function() {
        return {
            episodes: {},
            selectedEpisode: null,
            selectedCast: null
        }
    },

    componentDidMount: function() {
        this.scroller = new IScroll(this.getDOMNode(), {
            mouseWheel: true,
            scrollbars: 'custom',
            keyBindings: true,
            interactiveScrollbars: true,
            click: true
        });
    },

    componentDidUpdate: function() {
        if (this.scroller) {
            this.scroller.refresh();
        }
    },

    onEpisodesChanged: function(state) {
        this.setState(state);
    },

    onCastsChanged: function(state) {
        this.setState({
            selectedCast: state.selectedCast
        });
    },

    render: function() {
        var episodes = _.map(this.state.episodes, function(episode) {
            if (episode.castid === this.state.selectedCast) {
                return <Episode key={episode.id} episode={episode} selected={episode.id === this.state.selectedEpisode} />
            }
        }.bind(this));

        return (
            <div className="scroller">
                <div className="episodes">
                    {episodes}
                </div>
            </div>
        );
    }
});

module.exports = EpisodeList;
