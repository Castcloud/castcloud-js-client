var settingsActions = require('../actions/settingsActions.js');

var SettingsList = React.createClass({
	handleClick: function(category) {
		settingsActions.selectCategory(category);
	},

	render: function() {
		var self = this;
		var categories = _.map(this.props.settings, function(settings, category) {
			if (category === "__client") {
				//return null;
			}

			var classes = self.props.selectedCategory === category ? "selected " : "";

			return <p className={classes + "setting-button"} onClick={self.handleClick.bind(null, category)}>{category}</p>
		});
		return <div className="settings-menu">{categories}</div>;
	}
});

module.exports = SettingsList;