var Reflux = require('reflux');
var actions = require('../actions/mediaActions.js');

var settingsStore = require('./settingsStore.js');

var media = {
	paused: true,
	ended: false,
	currentTime: 0,
	currentEpisode: null,
	volume: 1.0,
	playbackRate: 1.0
};

var episodes = {};

var mediaStore = Reflux.createStore({
	init: function() {
		this.listenToMany(actions);
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

	settingsChanged: function(settings) {
		media.playbackRate = settings.Playback.PlaybackRate.value;
		this.trigger(media);
	}
});

module.exports = mediaStore;