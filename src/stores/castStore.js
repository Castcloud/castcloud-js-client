var Reflux = require('reflux');
var actions = require('../actions/castActions.js');
var userActions = require('../actions/userActions.js');

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
                    console.log("Casts loaded (reflux)");
                    state.casts = data;
                    this.trigger(state);
                }
            }.bind(this));
        }
    },

    select: function(id) {
        state.selectedCast = id;
        this.trigger(state);
    },

    getDefaultData: function() {
        return state;
    }
});

castStore.listen(function(state) {
    //localforage.setItem("casts", state.casts);
    sessionStorage.selectedcast = state.selectedCast;
});

module.exports = castStore;