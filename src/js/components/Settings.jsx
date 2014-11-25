var SettingsList = require('./SettingsList.jsx');
var SettingsPanel = require('./SettingsPanel.jsx');
var Reflux = require('reflux');
var settingsStore = require('../stores/settingsStore.js');
var settingsActions = require('../actions/settingsActions.js');

var Settings = React.createClass({
	mixins: [
		Reflux.connect(settingsStore, "settings"),
		Reflux.connect(settingsActions.selectCategory, "selectedCategory")
	],

	getInitialState: function() {
		return {
			settings: settingsStore.getState(),
			selectedCategory: "General"
		};
	},

	render: function() {
		return (
			<div className="settings-container">
				<SettingsList settings={this.state.settings} selectedCategory={this.state.selectedCategory} />
				<SettingsPanel settings={this.state.settings} selectedCategory={this.state.selectedCategory} />
			</div>
		);
	}
});

module.exports = Settings;