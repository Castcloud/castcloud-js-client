var Reflux = require('reflux');

var mediaActions = Reflux.createActions([
	"play",
	"pause",
	"togglePause",
	"ended",
	"updateTime",
	"playEpisode",
	"loadDone",
	"setVolume",
	"mute",
	"setPlaybackRate"
]);

module.exports = mediaActions;