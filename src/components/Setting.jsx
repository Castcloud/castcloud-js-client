var settingsActions = require('../actions/settingsActions.js');

var Type = require('../constants.js').SettingType;

var Setting = React.createClass({
	getInitialState: function() {
		return {
			value: this.props.setting.value
		};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({ value: nextProps.setting.value });
	},

	handleChange: function(e) {
		var value;

		if (this.props.setting.type === Type.Bool) {
			value = e.target.checked;
		}
		else {
			value = e.target.value;
		}

		this.setState({ value: value });
		settingsActions.set(this.props.name, value, this.props.category);
	},

	render: function() {
		var input;
		switch (this.props.setting.type) {
			case Type.Text:
				input = <input type="text" className="setting" onChange={this.handleChange} value={this.state.value} />;
				break;

			case Type.Bool:
				input = <input type="checkbox" className="setting" onChange={this.handleChange} checked={this.state.value} />;
				break;

			case Type.Keybind:
				input = <input type="text" className="setting keybind" value={this.state.value} />;
				break;

			default:
				input = <span>{this.state.value}</span>;
				break;
		}

		return <p><label>{this.props.name}</label>{input}</p>;
	}
});

module.exports = Setting;