var Reflux = require('reflux');
var actions = require('../actions/settingsActions.js');
var userActions = require('../actions/userActions.js');

var API = require('../api.js');

var DefaultSettings = require('../constants.js').DefaultSettings;

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
			var self = this;

			localforage.getItem("settings", function(err, data) {
				if (data) {
					console.log("Settings loaded");
					settings = $.extend(true, {}, DefaultSettings, data);
					self.trigger(settings);

					$(".thumb").width(settings.__client.ThumbWidth.value);
				}
			});
		}
	},

	set: function(name, value, category) {
		settings[category || "General"][name].value = value;
		this.trigger(settings);
	},

	reset: function() {
		settings = DefaultSettings;
		this.trigger(settings);

		for (var category in settings) {
			for (var name in settings[category]) {
				var setting = settings[category][name];
				API.saveSetting(name, setting.value, category);
			}
		}
	},

	fetchDone: function(fetchedSettings) {
		settings = $.extend(true, {}, DefaultSettings, fetchedSettings);
		this.trigger(settings);
	},

	getDefaultData: function() {
		return settings;
	}
});

settingsStore.listen(function(settings) {
	localforage.setItem("settings", settings);
});

module.exports = settingsStore;