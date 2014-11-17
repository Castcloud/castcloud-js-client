var Reflux = require('reflux');
var actions = require('../actions/castActions.js');
var userActions = require('../actions/userActions.js');
var appActions = require('../actions/appActions.js');

var state = {
    casts: {},
    selectedCast: null
};

var castStore = Reflux.createStore({
    init: function() {
        this.listenTo(userActions.loginDone, this.loadLocalData);
        this.listenToMany(actions);

        state.selectedCast = sessionStorage.selectedcast;
    },

    loadLocalData: function(loggedIn) {
        if (loggedIn) {
            localforage.getItem("casts", function(err, data) {
                if (data) {
                    console.log("Casts loaded");
                    state.casts = data;
                    this.trigger(state);
                }
            }.bind(this));
        }
    },

    addDone: appActions.sync,

    rename: function(id, name) {
        state.casts[id].name = name;
        this.trigger(state);
    },

    remove: function(id) {
        delete state.casts[id];
        this.trigger(state);
    },

    select: function(id) {
        state.selectedCast = id;
        this.trigger(state);
    },

    fetchDone: function(fetchedCasts) {
        state.casts = fetchedCasts;
        this.trigger(state);
    },

    getState: function() {
        return state;
    }
});

castStore.listen(function(state) {
    localforage.setItem("casts", state.casts);
    sessionStorage.selectedcast = state.selectedCast;
});

module.exports = castStore;