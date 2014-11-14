var Reflux = require('reflux');
var episodeStore = require('../stores/episodeStore.js');
var episodeActions = require('../actions/episodeActions.js');
var castStore = require('../stores/castStore.js');
var Episode = require('./Episode.jsx');
var IScrollMixin = require('../mixins/IScrollMixin.js');

var EpisodeList = React.createClass({
    mixins: [
        Reflux.listenTo(episodeStore, "onEpisodesChanged"),
        Reflux.listenTo(castStore, "onCastsChanged", "onCastsChanged"),
        IScrollMixin
    ],

    getInitialState: function() {
        return {
            episodes: {},
            selectedEpisode: null,
            selectedCast: null
        };
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
            var selected = episode.id === this.state.selectedEpisode;
            if (episode.castid === this.state.selectedCast) {
                return <Episode key={episode.id} episode={episode} selected={selected} />
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
