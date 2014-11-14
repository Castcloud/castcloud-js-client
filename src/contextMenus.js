var mediaActions = require('./actions/mediaActions.js');
var episodeActions = require('./actions/episodeActions.js');

exports.episode = [{
	content: "Play",
	action: function(id) {
		mediaActions.playEpisode(id);
		episodeActions.select(id);
	}
}, {
	content: "Reset playback",
	action: episodeActions.resetPlayback
}, {
	content: "Delete",
	action: episodeActions.delete
}];