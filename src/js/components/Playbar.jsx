var Reflux = require('reflux');
var util = require('../util.js');
var mediaStore = require('../stores/mediaStore.js');
var mediaActions = require('../actions/mediaActions.js');
var eventActions = require('../actions/eventActions.js');
var settingsActions = require('../actions/settingsActions.js');
var playbarActions = require('../actions/playbarActions.js');
var VolumeControl = require('./VolumeControl.jsx');
var Event = require('../event.js').Event;

var Playbar = React.createClass({
	mixins: [
		Reflux.listenTo(mediaStore, 'onMediaChanged'),
		Reflux.listenTo(playbarActions.show, 'show')
	],

	getInitialState: function() {
		return {
			media: mediaStore.getState(),
			mouseOver: false,
			mouseDown: false,
			seeking: false,
			seekTime: 0,
			showGearMenu: false,
			show: true
		}
	},

	componentDidMount: function() {
		document.addEventListener('mouseup', this.handleDocumentMouseUp);
		document.addEventListener('mousemove', this.handleDocumentMouseMove);
	},

	onMediaChanged: function(media) {
		this.setState({
			media: media,
			seeking: this.state.mouseDown
		});
	},

	handleMouseEnter: function() {
		this.setState({ mouseOver: true });
		Velocity(this.refs.bb.getDOMNode(), {
			height: '20px',
			width: '20px',
			top: '-5px',
			marginLeft: '0px'
		});
		Velocity(this.refs.seekbar.getDOMNode(), { height: '10px' });
	},

	handleMouseLeave: function() {
		this.setState({ mouseOver: false });
		if (!this.state.mouseDown) {
			Velocity(this.refs.bb.getDOMNode(), {
				height: '0px',
				width: '0px',
				top: '2.5px',
				marginLeft: '10px'
			});
			Velocity(this.refs.seekbar.getDOMNode(), { height: '5px' });
		}
	},

	handleSeekMouseDown: function(e) {
		if (this.state.media.currentEpisode) {
			eventActions.send(Event.Pause, this.state.media.currentEpisode.id);
			var seekTime = 1 / window.innerWidth * e.pageX * currentEpisodeDuration;
			mediaGlue.seek(seekTime);
			this.setState({ 
				mouseDown: true,
				seeking: true,
				seekTime: seekTime 
			});
		}
	},

	handleDocumentMouseUp: function() {
		if (this.state.mouseDown) {
			this.handleMouseLeave();
			eventActions.send(Event.Play, this.state.media.currentEpisode.id);
			if (this.state.media.paused) {
				eventActions.send(Event.Pause, this.state.media.currentEpisode.id);
			}
			this.setState({ mouseDown: false });
		}
	},

	handleDocumentMouseMove: function(e) {
		if (this.state.mouseDown) {
			var seekTime = 1 / window.innerWidth * e.pageX * currentEpisodeDuration;
			mediaGlue.seek(seekTime);
			this.setState({ seekTime: seekTime });
		}
	},

	handleGearClick: function() {
		this.setState({ showGearMenu: !this.state.showGearMenu });
	},

	handlePlaybackRateClick: function(rate) {
		mediaActions.setPlaybackRate(rate);
		settingsActions.set('PlaybackRate', rate, 'Playback');
	},

	show: function(time) {
		this.setState({ show: true });
		this.timer && clearTimeout(this.timer);

		if ($('#vid-wrap').hasClass('fs')) {
			$('#overlay-info').show();

			if (time && !this.state.mouseOver) {
				var self = this;

				this.timer = setTimeout(function() {
					self.setState({ show: false });
					$('#overlay-info').hide();
				}, time);
			}
		}	
	},

	render: function() {
		var self = this;
		var currentTime = util.formatSeconds(this.state.media.currentTime);
		var duration = util.formatSeconds(currentEpisodeDuration);
		var progress = 1 / currentEpisodeDuration * this.state.media.currentTime;

		if (this.state.mouseDown || this.state.seeking) {
			progress = 1 / currentEpisodeDuration * this.state.seekTime;
		}

		var style = {
			display: this.state.show ? 'block' : 'none'
		};

		var seekbarInnerStyle = {
			width: progress * 100 + '%'
		};

		var badeballStyle = {
			left: (window.innerWidth * progress - 10) + 'px'
		};

		var gearMenuStyle = {
			display: this.state.showGearMenu ? 'block' : 'none'
		};

		var playbackRateButtons = [0.5, 1.0, 1.5].map(function(rate) {
			var playbackRateClass = 'button playback-rate';

			if (rate === self.state.media.playbackRate) {
				playbackRateClass += ' selected';
			}

			return (
				<button className={playbackRateClass}
					onClick={self.handlePlaybackRateClick.bind(self, rate)}>{rate.toFixed(1)}x</button>
			);
		});

		return (
			<div className="playbar" 
				style={style}
				onMouseEnter={this.handleMouseEnter} 
				onMouseLeave={this.handleMouseLeave}>
				<div className="playbar-controls">
					<button className="button button-skipback">
						<i className="fa fa-step-backward"></i>
					</button>
					<button className="button button-play">
						<i className="fa fa-play"></i>
					</button>
					<button className="button button-skipforward">
						<i className="fa fa-step-forward"></i>
					</button>
					<VolumeControl />
					<div className="badeball" 
						ref="bb" 
						style={badeballStyle}
						onMouseDown={this.handleSeekMouseDown}><div></div></div>
					<div className="seekbar"
						ref="seekbar" 
						onMouseDown={this.handleSeekMouseDown}>
						<div style={seekbarInnerStyle}></div>
					</div>
					<div className="seektime"></div>
					<div className="cc">
						<img src="img/cast_off.png" />
					</div>
					<i className="fa fa-expand fa-lg playbar-fullscreen"
						onClick={util.toggleFullscreen}></i>
					<i className="fa fa-gear fa-lg playbar-gear"
						onClick={this.handleGearClick}></i>
					<h3 className="time">{currentTime}/{duration}</h3>
				</div>
				<div className="playbar-gear-menu"
					style={gearMenuStyle}>
					<p>Playback rate</p>
					{playbackRateButtons}
				</div>
			</div>
		);
	}
});

module.exports = Playbar;