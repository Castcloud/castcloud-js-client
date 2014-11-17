var Reflux = require('reflux');
var contextMenuStore = require('../stores/contextMenuStore.js');
var contextMenuActions = require('../actions/contextMenuActions.js');

var ContextMenu = React.createClass({
	mixins: [
		Reflux.connect(contextMenuStore)
	],

	getInitialState: function() {
		return contextMenuStore.getState();
	},

	handleClick: function(action) {
		action(this.state.targetId);
		contextMenuActions.hide();
	},

	render: function() {
		var menuItems = this.state.menu.map(function(item) {
			return <div onClick={this.handleClick.bind(null, item.action)}>{item.content}</div>
		}.bind(this));

		var style = {
			left: this.state.x,
			top: this.state.y,
			display: this.state.menu.length > 0 ? "block" : "none"
		};

		return (
			<div style={style} className="context-menu">
				{menuItems}
			</div>
		);
	}
});

module.exports = ContextMenu;