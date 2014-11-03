var Reflux = require('reflux');
var settingsActions = require('./settingsActions.js');

var appActions = Reflux.createActions([
	"sync",
	"syncDone",
	"clearLocalData",
	"importOPML",
	"exportOPML"
]);

appActions.sync.preEmit = function() {
	settingsActions.fetch();
};

Reflux.all(settingsActions.fetchDone).listen(appActions.syncDone);

module.exports = appActions;