var Reflux = require('reflux');

var mediaActions = Reflux.createActions([
	"play",
	"pause",
	"togglePause",
	"ended",
	"updateTime",
	"playEpisode",
	"loadDone",
	"seek",
	"setVolume",
	"toggleMute",
	"setPlaybackRate"
]);

module.exports = mediaActions;