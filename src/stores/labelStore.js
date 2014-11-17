var Reflux = require('reflux');
var actions = require('../actions/labelActions.js');
var userActions = require('../actions/userActions.js');

var labels = [];

var labelStore = Reflux.createStore({
	init: function() {
		this.listenTo(userActions.loginDone, this.loadLocalData);
		this.listenToMany(actions);
	},

	loadLocalData: function(loggedIn) {
        if (loggedIn) {
            localforage.getItem("labels", function(err, data) {
                if (data) {
                    console.log("Labels loaded");
                    labels = data;
                    this.trigger(labels);
                }
            }.bind(this));
        }
    },

    fetchDone: function(fetchedLabels) {
    	labels = fetchedLabels;
    	this.trigger(labels);
    },

    getState: function() {
    	return labels;
    }
});

labelStore.listen(function(labels) {
	localforage.setItem("labels", labels);
});

module.exports = labelStore;