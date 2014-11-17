var Reflux = require('reflux');
var episodeStore = require('./episodeStore');

var count = {};

function updateCount(episodes) {
	count = {};
	for (var id in episodes) {
		var castid = episodes[id].castid;
		count[castid] = castid in count ? count[castid] + 1 : 1;
	}
}

var episodeCountStore = Reflux.createStore({
	init: function() {
		this.listenTo(episodeStore, this.episodesChanged);
	},

	episodesChanged: function(state) {
		updateCount(state.episodes);
		this.trigger(count);
	},

	getState: function() {
		return count;
	}
});

module.exports = episodeCountStore;