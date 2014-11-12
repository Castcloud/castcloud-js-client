var Reflux = require('reflux');
var API = require('../api.js');

var actions = Reflux.createActions([
	"set",
	"reset",
	"selectCategory",
	"fetch",
	"fetchDone"
]);

var setTimers = {};

actions.set.preEmit = function(name, value, category) {
	var id = category + name;
	if (setTimers[id]) {
		clearTimeout(setTimers[id]);
	}
	setTimers[id] = setTimeout(function() {
		API.saveSetting(name, value, category);
	}, 1000);
};

actions.fetch.preEmit = function() {
	API.getSettings(actions.fetchDone);
};

module.exports = actions;
