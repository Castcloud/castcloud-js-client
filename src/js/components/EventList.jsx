var Reflux = require('reflux');
var eventStore = require('../stores/eventStore.js');
var eventActions = require('../actions/eventActions.js');
var episodeStore = require('../stores/episodeStore.js');
var Event = require('./Event.jsx');

var EventList = React.createClass({
	mixins: [
		Reflux.connect(eventStore, "events"),
		Reflux.listenTo(eventActions.show, "show"),
		Reflux.listenTo(eventActions.hide, "hide"),
		Reflux.listenTo(episodeStore, "onEpisodesChanged")
	],

	getInitialState: function() {
		return {
			events: eventStore.getState(),
			selectedEpisode: episodeStore.getState().selectedEpisode
		};
	},

	show: function() {
		if (small) {
			Velocity(this.getDOMNode(), { left: "0%" });
		}
		else {
			Velocity(this.getDOMNode(), { left: "66.666666%" });
		}
	},

	hide: function() {
		Velocity(this.getDOMNode(), { left: "100%" });
	},

	onEpisodesChanged: function(state) {
		this.setState({
			selectedEpisode: state.selectedEpisode
		});
	},

	render: function() {
		var events = _.filter(this.state.events, { 
			episodeid: this.state.selectedEpisode 
		});

		events = _.map(_.first(events, 10), function(event) {
			return <Event key={event.id} event={event} />
		});

		return (
			<div className="events">
				<h1>Events</h1>
				<button className="button" onClick={eventActions.hide}>Close</button>
				{events}
			</div>
		);
	}
});

module.exports = EventList;