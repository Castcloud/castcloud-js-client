var eventActions = require('../actions/eventActions.js');

var Event = React.createClass({
	handleClick: function() {
		eventActions.fire(this.props.event);
		eventActions.hide();
	},

	render: function() {
		var event = this.props.event;
		return (
			<div onClick={this.handleClick}>
				<p>
					<span className="what">{event.name}</span>
					<span className="when">{event.position}</span>
				</p>
				<p className="secondline">
					<span className="who">{event.clientname} ({event.clientdescription})</span>
					<span className="when">{event.date}</span>
				</p>
			</div>
		);
	}
});

module.exports = Event;