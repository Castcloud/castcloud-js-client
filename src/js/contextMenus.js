var mediaActions = require('./actions/mediaActions.js');
var castActions = require('./actions/castActions.js');
var labelActions = require('./actions/labelActions.js');
var episodeActions = require('./actions/episodeActions.js');

exports.cast = [{
	content: "Show all episodes",
	action: function() {}
}, {
	content: "Rename",
	action: castActions.beginRename
}, {
	content: "Unsubscribe",
	action: castActions.remove
}, {
	content: "Add to label",
	action: function() {}
}];

exports.label = [{
	content: "Rename",
	action: labelActions.beginRename
}, {
	content: "Delete",
	action: labelActions.remove
}];

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