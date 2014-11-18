var Reflux = require('reflux');
var actions = require('../actions/episodeActions.js');
var userActions = require('../actions/userActions.js');
var castActions = require('../actions/castActions.js');
var eventStore = require('./eventStore.js');

var state = {
    episodes: {},
    selectedEpisode: null
};

var episodeStore = Reflux.createStore({
    init: function() {
        this.listenTo(userActions.loginDone, this.loadLocalData);
        this.listenToMany(actions);
        this.listenTo(castActions.remove, this.castRemoved);
        this.listenTo(eventStore, this.eventsChanged);

        state.selectedEpisode = sessionStorage.selectedepisode;
    },

    loadLocalData: function(loggedIn) {
        if (loggedIn) {
            localforage.getItem("episodes", function(err, data) {
                if (data) {
                    console.log("Episodes loaded");
                    state.episodes = data;
                    this.trigger(state);
                }
            }.bind(this));
        }
    },

    delete: function(id) {
        delete state.episodes[id];
        this.trigger(state);
    },

    select: function(id) {
        state.selectedEpisode = id;
        this.trigger(state);
    },

    fetchDone: function(fetchedEpisodes) {
        if (fetchedEpisodes.length > 0) {
            _.each(fetchedEpisodes, function(episode) {
                state.episodes[episode.id] = episode;
            });
            this.trigger(state);
        }
    },

    castRemoved: function(castid) {
        _.each(state.episodes, function(episode, id) {
            if (episode.castid === castid) {
                delete state.episodes[id];
            }
        });
        this.trigger(state);
    },

    eventsChanged: function(events) {
        _.each(events, function(event) {
            var episode = state.episodes[event.episodeid];
            if (event.episodeid in state.episodes) {
                if (!episode.lastevent || 
                    event.clientts > episode.lastevent.clientts ||
                    (event.clientts === episode.lastevent.clientts && 
                    event.concurrentorder > episode.lastevent.concurrentorder)) {
                    episode.lastevent = event;
                }
            }
        });
        this.trigger(state);
    },

    getState: function() {
        return state;
    }
});

episodeStore.listen(function(state) {
    localforage.setItem("episodes", state.episodes);
    sessionStorage.selectedepisode = state.selectedEpisode;
});

module.exports = episodeStore;