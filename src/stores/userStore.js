var Reflux = require('reflux');
var actions = require('../actions/userActions.js');

var user = {
	loggedIn: false,
	username: ""
};

var userStore = Reflux.createStore({
	init: function() {
		this.listenTo(actions.loginDone, this.loginDone);
	},

	loginDone: function(loggedIn, username) {
		user.loggedIn = loggedIn;
		user.username = username;
		this.trigger(user);
	},

	getDefaultData: function() {
		return user;
	}
});

module.exports = userStore;