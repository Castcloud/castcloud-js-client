var Reflux = require('reflux');
var API = require('../api.js');

var eventActions = Reflux.createActions([
	"send",
	"fetch",
	"fetchDone"
]);

eventActions.send.preEmit = function(event) {
	API.sendEvent(event);
	/*API.sendEvent({
		type: type,
		episodeid: id,
		positionts: time === undefined ? el("vid").currentTime | 0 : time,
		concurrentorder: currentOrder,
		clientts: eventTS
	});*/
};

eventActions.fetch.preEmit = function() {
	API.getEvents(eventActions.fetchDone);
};

module.exports = eventActions;