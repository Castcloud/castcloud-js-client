var Reflux = require('reflux');
var API = require('../api.js');

var castActions = Reflux.createActions([
    "add",
    "addDone",
    "rename",
    "remove",
    "select",
    "fetch",
    "fetchDone"
]);

castActions.add.preEmit = function(feedurl) {
    API.addCast(feedurl, castActions.addDone);
};

castActions.rename.preEmit = function(id, name) {
    API.renameCast(id, name);
};

castActions.remove.preEmit = function(id) {
    API.removeCast(id);
};

castActions.fetch.preEmit = function() {
    API.getCasts(castActions.fetchDone);
};

module.exports = castActions;
