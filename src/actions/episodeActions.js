var Reflux = require('reflux');
var API = require('../api.js');

var episodeActions = Reflux.createActions([
    "select",
    "fetch",
    "fetchDone"
]);

episodeActions.fetch.preEmit = function() {
    API.getNewEpisodes(episodeActions.fetchDone);
};

module.exports = episodeActions;
