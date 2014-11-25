var Reflux = require('reflux');

var castActions = require('../actions/castActions.js');
var contextMenuActions = require('../actions/contextMenuActions.js');

var Cast = React.createClass({
	mixins: [
		Reflux.listenTo(castActions.beginRename, "beginRename")
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
		if (id === this.props.cast.id) {
			this.setState({ editing: true });
		}
	},

	handleClick: function() {
		castActions.select(this.props.cast.id);
	},

	handleContextMenu: function(e) {
		contextMenuActions.show("cast", this.props.cast.id, e.pageX, e.pageY);
		return false;
	},

	handleKey: function(e) {
		if (e.which === 13) {
			this.setState({ doneEditing: true });
			
			var name = this.refs.nameInput.getDOMNode().value;
			castActions.rename(this.props.cast.id, name);
		}
	},

	render: function() {
		var className = "cast drag";
		className += this.props.selected ? " selected" : "";

		return (
			<div className={className}
            	onClick={this.handleClick}
            	onContextMenu={this.handleContextMenu}>
					<span className="name">{
						this.state.editing ?
						<input type="text"  ref="nameInput"
							onKeyDown={this.handleKey}
							defaultValue={this.props.name} /> :
						this.props.name
					}</span>
				<div className="n">{this.props.count}</div>
			</div>
		);
	}
});

module.exports = Cast;