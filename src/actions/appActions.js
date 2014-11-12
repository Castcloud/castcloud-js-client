var Reflux = require('reflux');
var castActions = require('./castActions.js');
var labelActions = require('./labelActions.js');
var episodeActions = require('./episodeActions.js');
var eventActions = require('./eventActions.js');
var settingsActions = require('./settingsActions.js');

var API = require('../api.js');

var appActions = Reflux.createActions([
	"sync",
	"syncDone",
	"clearLocalData",
	"importOPML",
	"exportOPML"
]);

appActions.sync.preEmit = function() {
	//castActions.fetch();
	//labelActions.fetch();
	episodeActions.fetch();
	eventActions.fetch();
	settingsActions.fetch();
};

Reflux.all(
	episodeActions.fetchDone,
	eventActions.fetchDone,
	settingsActions.fetchDone
).listen(appActions.syncDone);

var fileInput = window.document.createElement("input");
fileInput.setAttribute("type", "file");

fileInput.addEventListener("change", function(e) {
	var file = e.target.files[0];
	var reader = new FileReader();

	reader.onload = function() {
		API.importOPML(reader.result);
	};

	reader.readAsText(file);
});

appActions.importOPML.listen(function() {
	fileInput.click();
});

var a = window.document.createElement("a");
a.download = "casts.opml";

appActions.exportOPML.listen(function() {
	API.exportOPML(function(opml) {
		a.href = window.URL.createObjectURL(new Blob([opml], {type: "text/plain"}));
		a.click();
	});
});

module.exports = appActions;
