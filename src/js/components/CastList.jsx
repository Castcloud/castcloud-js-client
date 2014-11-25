var Reflux = require('reflux');
var castStore = require('../stores/castStore.js');
var castActions = require('../actions/castActions.js');
var labelStore = require('../stores/labelStore.js');
var episodeCountStore = require('../stores/episodeCountStore.js');
var Cast = require('./Cast.jsx');
var Label = require('./Label.jsx');
var IScrollMixin = require('../mixins/IScrollMixin.js');

var CastList = React.createClass({
	mixins: [
		Reflux.connect(castStore),
		Reflux.connect(labelStore, "labels"),
		Reflux.connect(episodeCountStore, "count"),
		IScrollMixin
	],

	getInitialState: function() {
		var castState = castStore.getState();
		return {
			casts: castState.casts,
			selectedCast: castState.selectedCast,
			labels: labelStore.getState(),
			count: episodeCountStore.getState()
		};
	},

	renderCast: function(id) {
		var cast = this.state.casts[id];
		if (cast) {
			var selected = cast.id === this.state.selectedCast;
			return <Cast key={"cast" + id}
				cast={cast}
				name={cast.name}
				count={this.state.count[cast.id]}
				selected={selected} />;
		}
		return null;
	},

	render: function() {
		var items = _.map(this.state.labels, function(item) {
			if (item.type === "label") {
				return (
					<Label key={"label" + item.id} id={item.id} name={item.name} expanded={item.expanded}>
						{_.map(item.casts, this.renderCast)}
					</Label>
				);
			}
			else {
				return this.renderCast(item.id);
			}
		}.bind(this));
		
		return (
			<div className="scroller">
				<div>
					{items}
				</div>
			</div>
		);
	}
});

module.exports = CastList;