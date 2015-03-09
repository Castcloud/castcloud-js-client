var Reflux = require('reflux');
var actions = require('../actions/settingsActions.js');
var userActions = require('../actions/userActions.js');

var API = require('../api.js');

var DefaultSettings = require('../settings.js').DefaultSettings;

var settings = DefaultSettings;

var settingsStore = Reflux.createStore({
	init: function() {
		this.listenTo(userActions.loginDone, this.loadLocalData);

		this.listenTo(actions.set, this.set);
		this.listenTo(actions.reset, this.reset);
		this.listenTo(actions.fetchDone, this.fetchDone);
	},

	loadLocalData: function(loggedIn) {
		if (loggedIn) {
			localforage.getItem("settings", function(err, data) {
				if (data) {
					console.log("Settings loaded");
					settings = _.merge({}, DefaultSettings, data);
					this.trigger(settings);

					$(".thumb").width(settings.__client.ThumbWidth.value);
				}
			}.bind(this));
		}
	},

	set: function(name, value, category) {
		settings[category || "General"][name].value = value;
		this.trigger(settings);
	},

	reset: function() {
		settings = DefaultSettings;
		this.trigger(settings);

		_.each(Object.keys(settings), function(category) {
			_.each(settings[category], function(setting, name) {
				API.saveSetting(name, setting.value, category);
			});
		});
	},

	fetchDone: function(fetchedSettings) {
		settings = _.merge({}, DefaultSettings, fetchedSettings);
		settings.Playback.PlaybackRate.value = parseFloat(settings.Playback.PlaybackRate.value);
		this.trigger(settings);
	},

	getState: function() {
		return settings;
	}
});

settingsStore.listen(function(settings) {
	localforage.setItem("settings", settings);
});

module.exports = settingsStore;