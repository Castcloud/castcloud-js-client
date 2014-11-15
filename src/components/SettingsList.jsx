var settingsActions = require('../actions/settingsActions.js');

var SettingsList = React.createClass({
	render: function() {
		var categories = _.map(this.props.settings, function(settings, category) {
			if (category === "__client") {
				//return null;
			}
			var classes = this.props.selectedCategory === category ? "selected " : "";
			var selectCategory = settingsActions.selectCategory.bind(null, category);

			return <p className={classes + "setting-button"} onClick={selectCategory}>{category}</p>
		}.bind(this));
		return <div className="settings-menu">{categories}</div>;
	}
});

module.exports = SettingsList;