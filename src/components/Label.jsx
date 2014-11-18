var labelActions = require('../actions/labelActions.js');
var contextMenuActions = require('../actions/contextMenuActions.js');

var Label = React.createClass({
	handleClick: function() {
		labelActions.toggle(this.props.id);
	},

	handleContextMenu: function(e) {
		contextMenuActions.show("label", this.props.id, e.pageX, e.pageY);
		return false;
	},

	render: function() {
		var icon = "fa " + (this.props.expanded ? "fa-angle-down" : "fa-angle-right");
		return (
			<div className="label"
				onClick={this.handleClick}
				onContextMenu={this.handleContextMenu}>
				<div className="name">
					<span>{this.props.name}</span>
					<i className={icon}></i>
				</div>
				<div className="content">
					{this.props.children}
				</div>
			</div>
		);
	}
});

module.exports = Label;