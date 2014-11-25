var Reflux = require('reflux');
var actions = require('../actions/labelActions.js');
var userActions = require('../actions/userActions.js');
var castActions = require('../actions/castActions.js');
var API = require('../api.js');

var labels = [];

var labelStore = Reflux.createStore({
	init: function() {
		this.listenTo(userActions.loginDone, this.loadLocalData);
		this.listenToMany(actions);
		this.listenTo(castActions.add, this.addCast);
		this.listenTo(castActions.addDone, this.castAdded);
		this.listenTo(castActions.addFailed, this.addCastFailed);
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

    add: function(name) {
    	labels.push({
    		type: "label",
    		name: name,
    		expanded: true,
    		casts: []
    	});
    	this.trigger(labels);
    },

    addDone: function(addedLabel) {
    	var label = _.find(labels, { id: undefined, name: addedLabel.name });
    	label.id = addedLabel.id;
    	this.trigger(labels);
	},

	addFailed: function(name) {
		_.remove(labels, { id: undefined, name: name });
		this.trigger(labels);
	},

    update: function(id, data) {
    	var label = _.find(labels, { id: id, type: "label" });
    	_.assign(label, data);
    	this.trigger(labels);
    },

    rename: function(id, name) {
    	var label = _.find(labels, { id: id, type: "label" });
    	label.name = name;
    	this.trigger(labels);
    },

    remove: function(id) {
    	_.remove(labels, { id: id, type: "label" });
    	this.trigger(labels);
    },

    toggle: function(id) {
    	var label = _.find(labels, { id: id, type: "label" });
    	label.expanded = !label.expanded;
    	this.trigger(labels);

    	API.updateLabel(id, { expanded: label.expanded });
    },

    fetchDone: function(fetchedLabels) {
    	labels = fetchedLabels;
    	this.trigger(labels);
    },

    addCast: function(url) {
    	labels.push({
    		id: url,
    		type: "cast"
    	});
    	this.trigger(labels);
    },

    castAdded: function(cast) {
    	var label = _.find(labels, { id: cast.url });
    	label.id = cast.id;
    	this.trigger(labels);
    },

    addCastFailed: function(url) {
    	_.remove(labels, { id: url });
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