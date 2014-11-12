var Reflux = require('reflux');
var episodeActions = require('../actions/episodeActions.js');
var mediaStore = require('../stores/mediaStore.js');
var mediaActions = require('../actions/mediaActions.js');

var Event = {
	Start: 10,
	Pause: 20,
	Play: 30,
	SleepStart: 40,
	SleepEnd: 50,
	EndOfTrack: 60,
	Delete: 70,
	10: "Start",
	20: "Pause",
	30: "Play",
	40: "Sleep Started",
	50: "Sleep Ended",
	60: "End Of Track",
	70: "Delete"
};

var Episode = React.createClass({
	mixins: [
		Reflux.listenTo(mediaStore, "onMediaChanged", "onMediaChanged")
	],

	getInitialState: function() {
		return {
			indicator: null
		}
	},

	onMediaChanged: function(media) {
		var episode = this.props.episode;
		if (media.currentEpisode && media.currentEpisode.id === episode.id && !media.ended) {
			var indicator = "fa-play";
			if (media.loading) {
				indicator = "fa-spinner fa-spin";
			}
			else if (media.paused) {
				indicator = "fa-pause";
			}
			this.setState({ indicator: "fa " + indicator });
		}
		else if (episode.lastevent !== null) {
			if (episode.lastevent.type >= Event.EndOfTrack) {
				indicator = "fa-circle progress";
			}
			else if (episode.lastevent.positionts > 0) {
				indicator = "fa-circle-o progress";
			}
			this.setState({ indicator: "fa " + indicator });
		}
		else {
			this.setState({ indicator: null });
		}
	},

	handleClick: function() {
		episodeActions.select(this.props.episode.id);
	},

	handleDoubleClick: function() {
		mediaActions.playEpisode(this.props.episode.id);
	},

	render: function() {
		var className = "episode";
		className += this.props.selected ? " selected" : "";

		return (
            <div className={className} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick}>
                <span className="name">{this.props.episode.feed.title}</span>
                <div className="delete">Delete</div>
                <i className={this.state.indicator}></i>
            </div>
        );
	}
});

module.exports = Episode;