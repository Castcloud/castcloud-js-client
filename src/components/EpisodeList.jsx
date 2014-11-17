var Reflux = require('reflux');
var episodeStore = require('../stores/episodeStore.js');
var episodeActions = require('../actions/episodeActions.js');
var castStore = require('../stores/castStore.js');
var Episode = require('./Episode.jsx');
var IScrollMixin = require('../mixins/IScrollMixin.js');

var EpisodeList = React.createClass({
    mixins: [
        Reflux.connect(episodeStore),
        Reflux.listenTo(castStore, "onCastsChanged"),
        IScrollMixin
    ],

    getInitialState: function() {
        var episodeState = episodeStore.getState();
        return {
            episodes: episodeState.episodes,
            selectedEpisode: episodeState.selectedEpisode,
            selectedCast: castStore.getState().selectedCast
        };
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
                return <Episode key={episode.id} episode={episode} selected={selected} />;
            }
        }.bind(this));

        if (episodes.length > 0) {
            episodes.sort(function(a, b) {
                var d1 = new Date(a.props.episode.feed.pubDate);
                var d2 = new Date(b.props.episode.feed.pubDate);
                if (d1 > d2) {
                    return -1;
                }
                if (d1 < d2) {
                    return 1;
                }
                return 0;
            });
        }

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