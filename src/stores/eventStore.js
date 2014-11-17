var Reflux = require('reflux');
var actions = require('../actions/eventActions.js');
var userActions = require('../actions/userActions.js');

var Event = {
	Start: 10,
	Pause: 20,
	Play: 30,
	SleepStart: 40,
	SleepEnd: 50,
	EndOfTrack: 60,
	Delete: 70,
	10: "Start",
	20: "Pause",
	30: "Play",
	40: "Sleep Started",
	50: "Sleep Ended",
	60: "End Of Track",
	70: "Delete"
};

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
					this.trigger(events);

					/*if (window.name !== "popout") {
						if (localStorage.beforeunloadevent) {
							var ev = JSON.parse(localStorage.beforeunloadevent);
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("beforeunloadevent");
						}
						if (localStorage.unloadevent) {
							var ev = JSON.parse(localStorage.unloadevent);
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("unloadevent");
						}
					}*/
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
			fetchedEvents.forEach(function(event) {
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