var Reflux = require('reflux');
var API = require('../api.js');

var userActions = Reflux.createActions([
	"login",
	"loginDone"
]);

userActions.login.preEmit = function(username, password) {
	API.login(username, password, userActions.loginDone);
};

userActions.loginDone.preEmit = function(loggedIn, username) {
	if (loggedIn) {
		localforage.config({
			name: "Castcloud",
			storeName: username
		});
	}
};

module.exports = userActions;