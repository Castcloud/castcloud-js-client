var Reflux = require('reflux');
var API = require('../api.js');
var buildEvent = require('../event.js').buildEvent;

var eventActions = Reflux.createActions([
	"send",
	"fire",
	"show",
	"hide",
	"fetch",
	"fetchDone"
]);

eventActions.send.sync = true;
eventActions.send.preEmit = function(type, id, time) {
	var event = buildEvent(type, id, time);
	API.sendEvent(event);
	return event;
};

eventActions.fetch.preEmit = function() {
	API.getEvents(eventActions.fetchDone);
};

module.exports = eventActions;