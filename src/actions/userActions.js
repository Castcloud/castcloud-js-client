var Reflux = require('reflux');
var API = require('../api.js');

var userActions = Reflux.createActions([
	"login",
	"loginDone"
]);

var attemptedUsername;

userActions.login.preEmit = function(username, password) {
	attemptedUsername = username;
	API.login(username, password, userActions.loginDone);
};

userActions.loginDone.preEmit = function(loggedIn) {
	if (loggedIn) {
		localforage.config({
			name: "Castcloud",
			storeName: attemptedUsername + "-db"
		});
	}
};

module.exports = userActions;