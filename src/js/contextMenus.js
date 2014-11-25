var mediaActions = require('./actions/mediaActions.js');
var castActions = require('./actions/castActions.js');
var labelActions = require('./actions/labelActions.js');
var episodeActions = require('./actions/episodeActions.js');

exports.cast = [{
	content: "Show all episodes",
	action: function() {} //showAllEpisodes
}, {
	content: "Rename",
	action: castActions.beginRename
}, {
	content: "Unsubscribe",
	action: castActions.remove
}, {
	content: "Add to label",
	action: function() {
		//$("#add-to-label").show()
	}
}];

exports.label = [{
	content: "Rename",
	action: function(id) {
		labelActions.beginRename(id);
		/*var label = $("#label-" + id + " .name span");
		var name = label.html();
		label.html('<input type="text">');
		$(".label input").focus();
		$(".label input").val(name);
		$(".label input").keydown(function(e) {
			if (e.which === 13) {
				var name = $(this).val();
				label.html(name);
				API.renameLabel(id, name);
			}
		});*/
	}
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