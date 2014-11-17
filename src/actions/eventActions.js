var Reflux = require('reflux');
var API = require('../api.js');

var eventActions = Reflux.createActions([
	"send",
	"show",
	"hide",
	"fetch",
	"fetchDone"
]);

eventActions.send.preEmit = function(event) {
	API.sendEvent(event);
};

eventActions.fetch.preEmit = function() {
	API.getEvents(eventActions.fetchDone);
};

module.exports = eventActions;