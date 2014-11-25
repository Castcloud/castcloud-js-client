var Reflux = require('reflux');
var actions = require('../actions/eventActions.js');
var userActions = require('../actions/userActions.js');
var buildEvent = require('../event.js').buildEvent;
var Event = require('../event.js').Event;

var events = [];

var eventStore = Reflux.createStore({
	init: function() {
		this.listenTo(userActions.loginDone, this.loadLocalData);
		this.listenToMany(actions);
	},

	loadLocalData: function(loggedIn) {
		if (loggedIn) {
			localforage.getItem("events", function(err, data) {
				if (data) {
					console.log("Events loaded");
					events = data;

					var unloadevent = localStorage.unloadevent;
					if (unloadevent) {
						var ev = JSON.parse(unloadevent);
						events.unshift(buildEvent(ev.type, ev.id, ev.time));
						localStorage.removeItem("unloadevent");
					}
					this.trigger(events);
				}
			}.bind(this));
		}
	},

	send: function(event) {
		events.unshift(event);
		this.trigger(events);
	},

	fetchDone: function(fetchedEvents) {
		if (fetchedEvents.length > 0) {
			_.each(fetchedEvents, function(event) {
				event.name = Event[event.type];
				events.push(event);
			});
		
			events.sort(function(a, b) {
				if (a.clientts > b.clientts) {
					return -1;
				}
				else if (a.clientts < b.clientts) {
					return 1;
				}

				if (a.concurrentorder > b.concurrentorder) {
					return -1;
				}
				else if (a.concurrentorder < b.concurrentorder) {
					return 1;
				}
				return 0;
			});

			this.trigger(events);
		}
	},

	getState: function() {
		return events;
	}
});

eventStore.listen(function(events) {
	localforage.setItem("events", events);
});

module.exports = eventStore;