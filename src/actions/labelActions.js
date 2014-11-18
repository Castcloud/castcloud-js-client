var Reflux = require('reflux');
var API = require('../api.js');

var labelActions = Reflux.createActions([
    "add",
    "addDone",
    "addFailed",
    "update",
    "beginRename",
    "rename",
    "remove",
    "toggle",
    "fetch",
    "fetchDone"
]);

labelActions.add.preEmit = function(name) {
    API.addLabel(name, labelActions.addDone, labelActions.addFailed);
};

labelActions.update.preEmit = function(id, data) {
    API.updateLabel(id, data);
};

labelActions.rename.preEmit = function(id, name) {
    API.renameLabel(id, name);
};

labelActions.remove.preEmit = function(id) {
    API.removeLabel(id);
};

labelActions.fetch.preEmit = function() {
    API.getLabels(labelActions.fetchDone);
};

module.exports = labelActions;