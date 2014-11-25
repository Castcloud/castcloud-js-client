var Reflux = require('reflux');
var actions = require('../actions/appActions.js');

var app = {
	syncing: false,
	autoSync: true
};

var appStore = Reflux.createStore({
	init: function() {
		this.listenTo(actions.sync, this.sync);
		this.listenTo(actions.syncDone, this.syncDone);
		this.listenTo(actions.clearLocalData, this.clearLocalData);
	},

	sync: function(onDemand) {
		if (onDemand) {
			app.autoSync = true;
		}
		app.syncing = true;
		this.trigger(app);
	},

	syncDone: function() {
		app.syncing = false;
		this.trigger(app);
	},

	clearLocalData: function() {
		localforage.clear();
		app.autoSync = false;
		this.trigger(app);
	},

	getState: function() {
		return app;
	}
});

module.exports = appStore;