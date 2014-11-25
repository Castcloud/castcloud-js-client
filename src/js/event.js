var util = require('./util.js');

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

var lastEventTS = null;
var currentOrder = 0;

function buildEvent(type, id, time) {
	var eventTS = util.unix();
	if (lastEventTS === eventTS) {
		currentOrder++;
	}
	else {
		currentOrder = 0;
	}
	lastEventTS = eventTS;

	var event = {
		clientdescription: util.userAgent(),
		clientname: "Castcloud",
		clientts: eventTS,
		episodeid: id,
		name: Event[type],
		positionts: time === undefined ? document.getElementById("vid").currentTime | 0 : time,
		type: type,
		concurrentorder: currentOrder
	};

	var position = new Date(event.positionts * 1000);
	position.setHours(position.getHours() - 1);
	event.position = "";
	if (position.getHours() > 0) {
		event.position += position.getHours() + "h ";
	}
	event.position += position.getMinutes() + "m " + position.getSeconds() + "s";
	var date = new Date(event.clientts * 1000);
	date.setHours(date.getHours() - 1);
	event.date = date.toLocaleString();

	return event;
}

//_.assign(buildEvent, Event);

module.exports = {
	buildEvent: buildEvent,
	Event: Event
};