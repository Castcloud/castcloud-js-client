var Reflux = require('reflux');
var actions = require('../actions/castActions.js');

var state = {
    selectedCast: null
};

var castStore = Reflux.createStore({
    init: function() {
        this.listenTo(actions.select, this.select);

        state.selectedCast = sessionStorage.selectedcast;
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
    sessionStorage.selectedcast = state.selectedCast;
});

module.exports = castStore;
