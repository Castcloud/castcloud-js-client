var Reflux = require('reflux');
var actions = require('../actions/mediaActions.js');
var episodeStore = require('./episodeStore.js');
var settingsStore = require('./settingsStore.js');

var media = {
	paused: true,
	ended: false,
	loading: false,
	currentTime: 0,
	currentEpisode: null,
	volume: 1.0,
	playbackRate: 1.0
};

var episodes = {};
var lastEpisodePlayed = false;

var mediaStore = Reflux.createStore({
	init: function() {
		this.listenToMany(actions);
		this.listenTo(episodeStore, this.episodesChanged);
		this.listenTo(settingsStore, this.settingsChanged);
	},

	play: function() {
		media.paused = false;
		this.trigger(media);
	},

	pause: function() {
		media.paused = true;
		this.trigger(media);
	},

	togglePause: function() {
		media.paused = !media.paused;
		this.trigger(media);
	},

	ended: function() {
		media.paused = true;
		media.ended = true;
		this.trigger(media);
	},

	updateTime: function(currentTime) {
		media.currentTime = currentTime;
		this.trigger(media);
	},

	playEpisode: function(id) {
		media.currentEpisode = episodes[id];
		media.loading = true;
		this.trigger(media);
	},

	loadDone: function() {
		media.loading = false;
		this.trigger(media);
	},

	setVolume: function(volume) {
		if (volume < 0) {
			volume = 0;
		}
		else if (volume > 1) {
			volume = 1;
		}
		if (volume > 0) {
			media.muted = false;
		}
		media.volume = volume;
		this.trigger(media);
	},

	toggleMute: function() {
		media.muted = !media.muted;
		this.trigger(media);
	},

	setPlaybackRate: function(playbackRate) {
		media.playbackRate = playbackRate;
		this.trigger(media);
	},

	episodesChanged: function(state) {
		episodes = state.episodes;
		if (!lastEpisodePlayed && sessionStorage.lastepisode) {
			var lastEpisode = JSON.parse(sessionStorage.lastepisode);
			if (lastEpisode.id in episodes) {
				lastEpisodePlayed = true;
				actions.playEpisode(lastEpisode.id);
			}
		}
		if (media.currentEpisode && !(media.currentEpisode.id in episodes)) {
			media.currentEpisode = null;
			this.trigger(media);
		}
	},

	settingsChanged: function(settings) {
		media.playbackRate = settings.Playback.PlaybackRate.value;
		this.trigger(media);
	},

	getState: function() {
		return media;
	}
});

module.exports = mediaStore;