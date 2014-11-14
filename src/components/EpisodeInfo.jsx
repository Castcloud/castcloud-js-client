var Reflux = require('reflux');
var mediaStore = require('../stores/mediaStore.js');
var mediaActions = require('../actions/mediaActions.js');
var episodeStore = require('../stores/episodeStore.js');
var castStore = require('../stores/castStore.js');
var eventActions = require('../actions/eventActions.js');
var IScrollMixin = require('../mixins/IScrollMixin.js');

function buildState(data) {
	var episode = data.episodes[data.selectedEpisode];
	return {
		title: episode ? episode.feed.title : null,
		date: episode ? new Date(episode.feed.pubDate).toLocaleString() : null,
		desc: episode ? episode.feed.description : null,
		imgSrc: episode ? getImage(episode) : null,
		imgHeight: window.innerHeight * 0.35,
		selectedEpisode: episode
	};	
}

function getImage(episode) {
	var cast = castStore.getDefaultData().casts[episode.castid];
	return episode.feed["media:thumbnail"] ? episode.feed["media:thumbnail"].url : null ||
		episode.feed["itunes:image"] ? episode.feed["itunes:image"].href : null ||
		cast && cast.feed["itunes:image"] ? cast.feed["itunes:image"].href : null ||
		cast && cast.feed.image ? cast.feed.image.url : null;
}

var EpisodeInfo = React.createClass({
	mixins: [
		Reflux.listenTo(episodeStore, "onEpisodesChanged"),
		Reflux.listenTo(mediaStore, "onMediaChanged"),
		Reflux.listenTo(castStore, "onCastsChanged"),
		IScrollMixin
	],

	getInitialState: function() {
		var state = buildState(episodeStore.getDefaultData());
		state.media = mediaStore.getDefaultData();
		return state;
	},

	componentDidMount: function() {
		window.addEventListener("resize", this.handleResize);
	},

	componentWillUnmount: function() {
		window.removeEventListener("resize", this.handleResize);
	},

	onEpisodesChanged: function(data) {
		this.setState(buildState(data));
	},

	onMediaChanged: function(media) {
		this.setState({
			media: media
		});
	},

	onCastsChanged: function() {
		this.setState(buildState(episodeStore.getDefaultData()));
	},

	handleClick: function() {
		if (this.state.media.currentEpisode && 
			this.state.media.currentEpisode.id === this.state.selectedEpisode.id) {
			//mediaActions.togglePause();
		}
		else {
			mediaActions.playEpisode(this.state.selectedEpisode.id);
		}
		
	},

	handleResize: function() {
		this.setState({
			imgHeight: window.innerHeight * 0.35
		});
	},

	render: function() {
		var playButtonText = "Play";
		var overlayIcon = "fa-play-circle-o";
		var overlayStyle = {};
		if (this.state.media.currentEpisode && 
			this.state.media.currentEpisode.id === this.state.selectedEpisode.id) {
			if (this.state.media.loading) {
				overlayIcon = "fa-spinner fa-spin";
			}
			else if (!this.state.media.paused) {
				playButtonText = "Pause";
				overlayIcon = "";
				overlayStyle.display = "none";
			}	
		}

		return (
			<div className="scroller">
				<div style={{display: this.state.selectedEpisode ? "block" : "none"}}>
					<figure className="pretty" onClick={this.handleClick}>
						<div className="pretty-overlay" style={overlayStyle}>
							<i className={"fa pretty-button " + overlayIcon}></i>
						</div>
						<img width="100%" style={{maxHeight: this.state.imgHeight + "px"}} src={this.state.imgSrc} />
					</figure>
					<div className="episode-bar">
						<button className="button episode-bar-play" onClick={this.handleClick}>{playButtonText}</button>
						<button className="button episode-bar-events" onClick={eventActions.show}>Events</button>
					</div>
					<div className="episodeinfo-text">
						<h2 className="episode-title">{this.state.title}</h2>
						<p className="episode-date">{this.state.date}</p>
						<p className="episode-desc">{this.state.desc}</p>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = EpisodeInfo;