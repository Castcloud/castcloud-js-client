var Reflux = require('reflux');
var actions = require('../actions/contextMenuActions.js');
var episodeActions = require('../actions/episodeActions.js');
var mediaActions = require('../actions/mediaActions.js');
var menus = require('../contextMenus.js');

var state = {
	menu: [],
	targetId: null,
	x: 0,
	y: 0
};

var contextMenuStore = Reflux.createStore({
	init: function() {
		this.listenToMany(actions);

		document.addEventListener("click", actions.hide);
		document.addEventListener("contextmenu", actions.hide);
	},

	show: function(name, targetId, x, y) {
		state.menu = menus[name];
		state.targetId = targetId;
		state.x = x;
		state.y = y;
		this.trigger(state);
	},

	hide: function() {
		state.menu = [];
		this.trigger(state);
	},

	getDefaultData: function() {
		return state;
	}
});

module.exports = contextMenuStore;