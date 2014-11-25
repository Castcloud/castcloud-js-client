var Reflux = require('reflux');
var labelActions = require('../actions/labelActions.js');
var contextMenuActions = require('../actions/contextMenuActions.js');

var Label = React.createClass({
	mixins: [
		Reflux.listenTo(labelActions.beginRename, "beginRename")
	],

	getInitialState: function() {
		return {
			editing: false,
			doneEditing: false
		};
	},

	componentDidUpdate: function() {
		if (this.state.editing) {
			var input = this.refs.nameInput.getDOMNode();
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length);
		}
	},

	componentWillReceiveProps: function() {
		if (this.state.doneEditing) {
			this.setState({ editing: false, doneEditing: false });
		}
	},

	beginRename: function(id) {
		if (id === this.props.id) {
			this.setState({ editing: true });
		}
	},

	handleClick: function() {
		labelActions.toggle(this.props.id);
	},

	handleContextMenu: function(e) {
		contextMenuActions.show("label", this.props.id, e.pageX, e.pageY);
		return false;
	},

	handleKey: function(e) {
		if (e.which === 13) {
			this.setState({ doneEditing: true });
			
			var name = this.refs.nameInput.getDOMNode().value;
			labelActions.rename(this.props.id, name);
		}
	},

	render: function() {
		var icon = "fa " + (this.props.expanded ? "fa-angle-down" : "fa-angle-right");
		return (
			<div className="label"
				onClick={this.handleClick}
				onContextMenu={this.handleContextMenu}>
				<div className="name">
					<span>{
						this.state.editing ?
						<input type="text"  ref="nameInput"
							onKeyDown={this.handleKey}
							defaultValue={this.props.name} /> :
						this.props.name
					}</span>
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