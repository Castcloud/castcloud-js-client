var Reflux = require('reflux');
var mediaStore = require('../stores/mediaStore.js');
var mediaActions = require('../actions/mediaActions.js');

var VolumeControl = React.createClass({
	mixins: [
		Reflux.connect(mediaStore, "media")
	],

	getInitialState: function() {
		return {
			media: mediaStore.getState(),
			mouseDown: false,
			mouseOver: false
		}
	},

	componentDidMount: function() {
		document.addEventListener("mouseup", this.handleMouseUp);
		document.addEventListener("mousemove", this.handleMouseMove);
	},

	handleMouseEnter: function() {
		this.setState({ mouseOver: true });
	},

	handleMouseLeave: function() {
		this.setState({ mouseOver: false });
	},

	handleIconClick: function() {
		mediaGlue.toggleMute();
	},

	handleMouseDown: function(e) {
		var left = this.refs.innerBar.getDOMNode().getBoundingClientRect().left;
		mediaGlue.setVolume(1 / 60 * (e.pageX - left));
		this.setState({ mouseDown: true });
	},

	handleMouseUp: function() {
		if (this.state.mouseDown) {
			this.setState({ mouseDown: false });
		}
	},

	handleMouseMove: function(e) {
		if (this.state.mouseDown) {
			var left = this.refs.innerBar.getDOMNode().getBoundingClientRect().left;
			mediaGlue.setVolume(1 / 60 * (e.pageX - left));
		}
	},

	render: function() {
		var barStyle = {
			display: this.state.mouseDown || this.state.mouseOver ? "block" : "none"
		};
		var innerBarStyle = { width:  60 * this.state.media.volume + "px" };
		var iconClass = "fa fa-volume-up";

		if (this.state.media.volume === 0 || this.state.media.muted) {
			innerBarStyle.width = "0px";
			iconClass = "fa fa-volume-off";
		}

		return (
			<div className="volume"
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}>
				<i className={iconClass}
					onClick={this.handleIconClick}></i>
				<div className="bar"
					style={barStyle}
					onMouseDown={this.handleMouseDown}>
					<div className="inner"
						ref="innerBar"
						style={innerBarStyle}></div>
				</div>
			</div>
		);
	}
});

module.exports = VolumeControl;