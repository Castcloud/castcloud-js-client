var Setting = require('./Setting.jsx');
var settingsActions = require('../actions/settingsActions.js');

var SettingsPanel = React.createClass({
	render: function() {
		var generalButtons = (
			<div>
				<h3>OPML</h3>
				<p>
					<button className="button">Import</button>
					<input type="file" style={{display: "none"}} />
					<button className="button">Export</button>
				</p>
				<h3>Local data</h3>
				<button className="button">Clear</button>
				<h3>Default settings</h3>
				<button className="button" onClick={settingsActions.reset}>Reset</button>
			</div>
		);

		var category = this.props.selectedCategory;

		var settings = _.map(this.props.settings[category], function(setting, name) {
			return <Setting key={category + name} name={name} setting={setting} category={category} />;
		});

		return (
			<div className="settings-panel">
				<h2>{category}</h2>
				{category === "General" ? generalButtons : null}
				{settings}
			</div>
		);
	}
});

module.exports = SettingsPanel;