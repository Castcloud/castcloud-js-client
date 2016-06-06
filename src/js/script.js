var Chromecast = require('./chromecast.js');
var DragDrop = require('./dragdrop.js');
var API = require('./api.js');
var util = require('./util.js');
require('./jquery-plugins.js');

var appActions = require('./actions/appActions.js');
var appStore = require('./stores/appStore.js');

var userActions = require('./actions/userActions.js');

var castActions = require('./actions/castActions.js');
var castStore = require('./stores/castStore.js');

var labelActions = require('./actions/labelActions.js');

var episodeActions = require('./actions/episodeActions.js');
var episodeStore = require('./stores/episodeStore.js');

var mediaActions = require('./actions/mediaActions.js');

var eventActions = require('./actions/eventActions.js');
var eventStore = require('./stores/eventStore.js');

var settingsActions = require('./actions/settingsActions.js');
var settingsStore = require('./stores/settingsStore.js');

var playbarActions = require('./actions/playbarActions.js');

var CastList = require('./components/CastList.jsx');
var EpisodeList = require('./components/EpisodeList.jsx');
var EpisodeInfo = require('./components/EpisodeInfo.jsx');
var EventList = require('./components/EventList.jsx');
var Settings = require('./components/Settings.jsx');
var Playbar = require('./components/Playbar.jsx');
var ContextMenu = require('./components/ContextMenu.jsx');

var Event = require('./event.js').Event;

window.mediaGlue = {
	seek: seek,
	setVolume: volume,
	toggleMute: muteToggle
};

var app = appStore.getState();
appStore.listen(function(newApp) {
	app = newApp;
});

var events = [];
eventStore.listen(function(_events) {
	events = _events;
});

var casts = {};
castStore.listen(function(state) {
	casts = state.casts;
});

var episodes = {};
episodeStore.listen(function(state) {
	episodes = state.episodes;
	if (state.selectedEpisode) {
		selectedEpisodeId = state.selectedEpisode;
	}
});

var settings = settingsStore.getState();
settingsStore.listen(function(_settings) {
	settings = _settings;
	setKeybinds();
});

var popoutClosed = false;
mediaActions.playEpisode.listen(function(id) {
	if (popoutClosed) {
		popoutClosed = false;
	}
	else {
		autoplay = true;
	}
	playEpisode(id);
});

mediaActions.setPlaybackRate.listen(function(rate) {
	el('vid').playbackRate = rate;
});

episodeActions.resetPlayback.listen(resetPlayback);
episodeActions.delete.listen(function(id) {
	eventActions.send(Event.Delete, id);
});

castActions.select.listen(function() {
	router.navigate("p1", { trigger: true });
});
episodeActions.select.listen(function() {
	router.navigate("p2", { trigger: true });
});

eventActions.fire.listen(function(event) {
	if (event.episodeid === currentEpisodeId) {
		var video = el("vid");

		video.currentTime = event.positionts;
		Chromecast.seek(event.positionts);
		if (event.type == Event.Start || event.type == Event.Play) {
			video.play();
		}
		else {
			video.pause();
		}
	}
});

var username;
var loggedIn = false;
var root;
var apiRoot;

//var tempEpisodes = {};

var poppedOut;
var mediaType;
var ctrlDown = false;
var autoplay = false;
var currentTime;
var paused = false;
var ended = false;
var playbackQueue = [];
var currentQueuePosition = 0;

//var episodeFeedScroll;

var currentEpisodeId = null;
window.currentEpisodeDuration = 0;
var selectedEpisodeId = null;
var videoLoading = false;

var router;
var page = 0;
window.small = null;
var prevSmall = false;

React.render(<CastList />, document.getElementById("podcasts"));
React.render(<EpisodeList />, document.getElementById("episode-list"));
React.render(<EpisodeInfo />, document.getElementById("episodeinfo"));
React.render(<EventList />, document.getElementById("events"));
React.render(<Settings />, document.getElementById("tab-settings"));
React.render(<Playbar />, document.getElementById("playbar"));
React.render(<ContextMenu />, document.getElementById("context-menu"));

Chromecast.init("3EC703A8");
Chromecast.session(function() {
	$(".cc img").prop("src", "img/cast_on.png");
	el("vid").pause();
	$("#cast-overlay").show();
	padCastOverlay();
});

Chromecast.receiver(function(n) {
	if (n > 0) {
		$(".cc").show();
	}
	else {
		$(".cc").hide();
	}
});

Chromecast.mediaLoaded(function() {
	Chromecast.seek(el("vid").currentTime);
	if (paused) {
		Chromecast.pause();
	}
});

Chromecast.timeUpdate(function(time) {
	mediaActions.updateTime(time);
	currentTime = time;
});

function Menu(el) {
	this.visible = false;
	this.el = document.getElementById(el);
}

Menu.prototype.show = function() {
	if (!this.visible) {
		Velocity(this.el, "slideDown");
		this.visible = true;
	}
}

Menu.prototype.hide = function() {
	if (this.visible) {
		Velocity(this.el, "slideUp");
		this.visible = false;
	}
}

Menu.prototype.toggle = function() {
	if (this.visible) {
		this.hide();
	}
	else {
		this.show();
	}
}

Velocity.defaults.duration = 200;

$(document).ready(function() {
	//DragDrop.init("#podcasts", ".drag");
	//DragDrop.ended(saveLabels);

	var menu = new Menu("menu-container");

	var Router = createRouter();
	router = new Router();

	router.bind("all", function(route, router) {
		if (small) {
			menu.hide();
		}
		positionThumb();
		padCastOverlay();
	});

	var storedUsername = localStorage.username;
	if(storedUsername) {
		username = storedUsername;
		$("#input-username").val(username);
	}

	root = CLIENT_ROOT;
	apiRoot = localStorage[uniqueName("apiTarget")] || window.location.protocol + "//" + window.location.host + root.replace("client", "api");
	API.setRoot(apiRoot);

	var storedToken = localStorage.token;
	if (storedToken) {
		API.setToken(storedToken);
		userActions.loginDone(true, username, true);
	}
	else {
		Backbone.history.start({ pushState: true, root: root });
		$("#input-target").val(apiRoot);
	}

	window.small = $(".col").css("width") === "100%";

	$(window).resize(function() {
		window.small = window.innerWidth < 665;
		if (!prevSmall && small) {
			$(".col").hide();
			$(".col:eq(" + page + ")").show();
			if (page === 2) {
				$("#podcast-vmenu").hide();
				$("#podcast-cols").css("left", "0px");
			}
			else {
				$("#podcast-vmenu").show();
				$("#podcast-cols").css("left", "50px");
			}
			$("#menu-container").hide();
		}
		else if (prevSmall && !small) {
			$(".col").show();
			$("#podcast-vmenu").show();
			$("#podcast-cols").css("left", "50px");
			$("#menu-container").show();
		}
		prevSmall = small;
	});

	$("#navicon").click(function() {
		menu.toggle();
	});

	$("a").click(function(e) {
		e.preventDefault();
		var url = e.target.pathname.substr(root.length, e.target.pathname.length - root.length + 1);
		router.navigate(url, { trigger: true });
	});

	$("#vid").on("timeupdate", function() {
		var video = el("vid");
		mediaActions.updateTime(video.currentTime);
		updateTime(video.currentTime);
	});

	$("#vid").click(function() {
		playPauseToggle();
	});

	$("#vid").dblclick(function() {
		util.toggleFullscreen();
	});

	$("#vid-thumb-bar .popout").click(function() {
		var video = el("vid");
		if (paused) {
			eventActions.send(Event.Pause, currentEpisodeId);
		}
		else {
			eventActions.send(Event.Play, currentEpisodeId);
		}
		video.setAttribute("src", "#");
		video.load();

		poppedOut = window.open(root + "fullscreen", "popout", 'toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=0,top=0');
		$(poppedOut).on("beforeunload", function() {
			poppedOut = null;
			var id = currentEpisodeId;
			currentEpisodeId = null;

			popoutClosed = true;
			mediaActions.playEpisode(id);
		});

		$(poppedOut).on("timeupdate", function(e) {
			mediaActions.updateTime(e.originalEvent.data.time);
		});

		$(poppedOut).on("unload", function() {
			if (localStorage.beforeunloadevent) {
				var ev = JSON.parse(localStorage.beforeunloadevent);
				eventActions.send(ev.type, ev.id, ev.time);
				localStorage.removeItem("unloadevent");
				localStorage.removeItem("beforeunloadevent");
			}
		});
	});

	$("#vid-thumb-bar .minimize").click(function() {
		$("#vid-container").toggleClass("minimized");
	});

	if (window.name === "popout") {
		$(window).on("message", function(e) {
			var message = JSON.parse(e.originalEvent.data);
			switch (message.action) {
				case "playPause":
					playPauseToggle();
					break;

				case "skipForward":
					skipForward();
					break;

				case "skipBack":
					skipBack();
					break;

				case "seek":
					seek(message.time);
					break;

				case "muteToggle":
					muteToggle();
					break;

				case "volume":
					volume(message.volume);
					break;
			}
		});
	}

	$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
		$("#vid-wrap").toggleClass("fs");
		if ($("#vid-wrap").hasClass("fs")) {
			playbarActions.show(1000);
			$("#vid-container").removeClass("thumb");
		}
		else {
			if (Backbone.history.fragment !== "now-playing") {
				$("#vid-container").addClass("thumb");
			}

			playbarActions.show();
			$('#overlay-info').hide();
		}
	});

	$("#vid-wrap").mousemove(function() {
		playbarActions.show(1000);
	});

	function shoveUnloadEvent() {
		if (currentEpisodeId !== null) {
			if (!paused && !ended) {
				localStorage.unloadevent = JSON.stringify({
					type: Event.Play,
					id: currentEpisodeId,
					time: el("vid").currentTime | 0
				});
			}
		}
	}

	$(window).on("beforeunload", shoveUnloadEvent);
	$(window).on("unload", shoveUnloadEvent);

	$(".button-skipback").click(function() {
		skipBack();
	});

	$(".button-play").click(function() {
		playPauseToggle();
	});

	$(".button-skipforward").click(function() {
		skipForward();
	});

	$("#vid").on("loadstart", function() {
		$("#vid-container").hide();
	});

	$("#vid").on("canplay", function() {
		mediaActions.loadDone();
		var video = el("vid");
		if (video.videoWidth > 0) {
			mediaType = "video";
			$("#vid-container").removeClass("audio");
			$("#vid-container").show();
		}
		else {
			mediaType = "audio";
			$("#vid-container").show();
			$("#vid-container").addClass("audio");
		}
		padCastOverlay();

		window.currentEpisodeDuration = video.duration;

		var lastevent = episodes[currentEpisodeId].lastevent;

		if (lastevent && lastevent.type == Event.EndOfTrack) {
			ended = true;
			paused = true;
			mediaActions.pause();
		}

		if (lastevent !== null && videoLoading && lastevent.type != Event.EndOfTrack) {
			video.currentTime = lastevent.positionts;

			if (lastevent.type == Event.Play) {
				play();
			}
			else {
				pause();
			}
		}
		if (autoplay && videoLoading) {
			autoplay = false;
			if (!(lastevent && lastevent.type == Event.EndOfTrack)) {
				play();
			}
		}
		videoLoading = false;
	});

	$("#vid").on("ended", function() {
		eventActions.send(Event.EndOfTrack, currentEpisodeId);
		$("#vid-container").hide();
		ended = true;
		nextEpisode();
	});

	$(document).mouseup(function() {
		x = false;
	});

	$(document).mousemove(function(e) {
		if (x) {
			var thumb = $(".thumb");
			var width = window.innerWidth - e.pageX - o - (window.innerWidth - (thumb.offset().left + thumb.width()));
			thumb.css("width", width + "px");
			settingsActions.set("ThumbWidth", width, "__client");
		}
	});

	$("#button-login").click(login);

	$("#input-password").keydown(function(e) {
		if (e.which === 13) {
			login();
		}
	});

	$("#button-logout").click(function() {
		localStorage.removeItem("token");
		sessionStorage.clear();
		window.location.reload();
	});

	$("#vmenu-add").click(function() {
		var prev = $(".vmenu-toggle:visible");
		$("#input-vmenu-add").toggle();
		$("#button-vmenu-add").toggle();
		$("#vmenu-add-results").toggle();
		prev.hide();
		$("#input-vmenu-add").focus();
	});

	$("#button-vmenu-add").click(function() {
		addFeed($("#input-vmenu-add").val());
	});

	$("#input-vmenu-add").keydown(function(e) {
		e.stopPropagation();

		var selected = $("#vmenu-add-results p.selected");
		if (e.which === 13) {
			if (selected.length > 0) {
				addFeed(selected.attr("feed-url"), selected.attr("feed-name"));
				selected.parent().empty();
			}
			else {
				addFeed($(this).val());
			}
		}
		else if (e.which === 40) {
			var el = $("#vmenu-add-results p");
			var i = selected.removeClass("selected").index();
			i++;
			if (i > el.length - 1) {
				i = 0;
			}
			$(el.get(i)).addClass("selected");
		}
		else if (e.which === 38) {
			var el = $("#vmenu-add-results p");
			var i = selected.removeClass("selected").index();
			i--;
			if (i < 0) {
				i = el.length - 1;
			}
			$(el.get(i)).addClass("selected");
		}
	});

	var searchTimerId;
	$("#input-vmenu-add").keyup(function(e) {
		if (e.which !== 40 && e.which !== 38) {
			clearTimeout(searchTimerId);
			var term = $(this).val();
			searchTimerId = setTimeout(function() {
				$.ajax({
					url: "//itunes.apple.com/search",
					jsonp: "callback",
					dataType: "jsonp",
					data: {
						media: "podcast",
						term: term,
						limit: 5
					},
					success: function(res) {
						$("#vmenu-add-results").empty();
						res.results.forEach(function(result) {
							$("#vmenu-add-results").append('<p feed-name="' + result.trackName + '" feed-url="' + result.feedUrl + '">' + result.trackName + '</p>');
						});
						$("#vmenu-add-results p:first-child").addClass("selected");
					}
				});
			}, 100);
		}
	});

	$("#vmenu-add-results").on("click", "p", function() {
		addFeed($(this).attr("feed-url"), $(this).attr("feed-name"));
		$(this).parent().empty();
	});

	$("#vmenu-label").click(function() {
		var prev = $(".vmenu-toggle:visible");
		$("#input-vmenu-label").toggle();
		$("#button-vmenu-label").toggle();
		prev.hide();
		$("#input-vmenu-label").focus();
	});

	$("#button-vmenu-label").click(function() {
		addLabel($("#input-vmenu-label").val());
	});

	$("#input-vmenu-label").keydown(function(e) {
		if (e.which === 13) {
			addLabel($(this).val());
		}
	});

	$("#vmenu-sync").click(function() {
		sync(true);
	});

	positionThumb();
	$(window).resize(function() {
		positionThumb();
	});

	/*$("#podcasts").on("mouseover", ".cast", function() {
		castHovered = $(this).id();
	});

	$("#podcasts").on("mouseout", ".cast", function() {
		castHovered = null;
	});

	$("#episodes").on("mouseover", ".episode", function() {
		episodeHovered = $(this).id();
	});

	$("#episodes").on("mouseout", ".episode", function() {
		episodeHovered = null;
	});*/

	var ctrlClearId;

	var shiftDown = false;

	$(document).keydown(function(e) {
		shiftDown = e.shiftKey;
		if (!(e.ctrlKey || e.metaKey)) {
			return;
		}

		clearTimeout(ctrlClearId);
		ctrlClearId = setTimeout(function() {
			ctrlDown = false;
		}, 1000);

		ctrlDown = true;

		if ($(e.target).is("input:visible,textarea:visible")) {
			return;
		}

		if (window.getSelection().toString()) {
			return;
		}

		/*if (castHovered !== null) {
			$("#clip").val(casts[castHovered].url).focus().select();
		}
		else if (episodeHovered !== null) {
			$("#clip").val(episodes[episodeHovered].feed.enclosure.url).focus().select();
		}*/
	});

	$(document).keyup(function(e) {
		ctrlDown = false;
		shiftDown = false;
	});

	$("#input-target").keyup(function(e) {
		var url = $(this).val();
		if (url.indexOf("/", url.length - 1) === -1) {
			url += "/";
		}
		$.ajax(url + "account/ping", {
			type: "GET",
			error: function(res) {
				if (res.responseText === "Bad token") {
					$("#input-target-container i").show();
				}
				else {
					$("#input-target-container i").hide();
				}
			},
			success: function() {
				$("#input-target-container i").hide();
			}
		});
	});

	$(".cc").click(function() {
		if (Chromecast.running()) {
			$(".cc img").prop("src", "img/cast_off.png");
			Chromecast.stop();
			$("#cast-overlay").hide();
			el("vid").currentTime = currentTime;
			play();
		}
		else {
			var desc = "";
            if (_.isString(episodes[currentEpisodeId].feed.description)) {
                desc = episodes[currentEpisodeId].feed.description.replace(/(<([^>]+)>)/ig,"");
            }

			$(".cc img").prop("src", "img/cast_on.png");
			Chromecast.start();
			Chromecast.load(episodes[currentEpisodeId].feed.enclosure.url, {
				title: episodes[currentEpisodeId].feed.title,
				description: desc,
				image: getEpisodeImage(currentEpisodeId)
			});
		}
	});

	/*$("#podcasts").on("click", ".cast", function(e) {
		if (ctrlDown) {
			$(this).toggleClass("selected");
		}
		else if (shiftDown) {
			if ($(this).parent()[0] == $("#cast-" + selectedCastId).parent()[0]) {
				var start = $("#cast-" + selectedCastId).index();
				var end = $(this).index();
				var casts = $(this).parent().find(".cast");

				if (start > end) {
					end--;
				}
				else {
					end++;
				}

				casts.removeClass("selected");

				_.range(start, end, start > end ? -1 : 1).forEach(function(i) {
					$(casts.get(i)).addClass("selected");
				});
			}
		}
		else {
			var id = $(this).id();
			selectCast(id);
		}
	});*/

	$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
		padCastOverlay();
	});

	/*$("#episodes").on("click", ".episode", function() {
		if (ctrlDown) {
			$(this).toggleClass("selected");
			$(this).children(".bar").toggle();
		}
		else if (shiftDown) {
			var start = $("#ep-" + selectedEpisodeId).index();
			var end = $(this).index();
			var episodes = $(".episode");

			if (start > end) {
				end--;
			}
			else {
				end++;
			}

			episodes.removeClass("selected");

			_.range(start, end, start > end ? -1 : 1).forEach(function(i) {
				$(episodes.get(i)).addClass("selected");
			});
		}
		else {
			selectEpisode($(this).id());
		}
	});

	$("#episodes").on("click", ".delete", function(e) {
		e.stopPropagation();
		var id = $(this).parent().id();
		deleteEpisode(id);
	});

	$("#episodes").on("click", ".reset", function(e) {
		e.stopPropagation();
		var id = $(this).parent().id();
		resetPlayback(id);
		$(this).hide();
	});

	$("#episodes").on("mouseover", ".episode", function() {
		$(this).children(".progress").css("color", "#FFF");
		if ($(this).find(".fa-circle").length > 0) {
			var id = $(this).id();
			var episode = id in episodes ? episodes[id] : tempEpisodes[id];
			$(this).children(".delete, .reset").show();
			if (episode.lastevent.type == Event.Delete) {
				// YOLO
				$(this).children(".delete").html("Reset").removeClass("delete").addClass("reset");
			}
			else {
				$(this).children(".reset").html("Delete").removeClass("reset").addClass("delete");
			}
		}
	});

	$("#episodes").on("mouseout", ".episode", function() {
		$(this).children(".progress").css("color", "#666");
		$(this).children(".delete, .reset").hide();
	});*/

	$("body").on("dragover", function(e) {
		e.stopPropagation();
		e.preventDefault();
	});

	$("body").on("drop", function(e) {
		e.stopPropagation();
		e.preventDefault();

		var file = e.originalEvent.dataTransfer.files[0];
		var reader = new FileReader();

		reader.onload = function() {
			API.importOPML(reader.result);
		};

		reader.readAsText(file);
	});

	var x = false;
	var o = 0;

	$("#vid-thumb-bar .drag").mousedown(function(e) {
		x = true;
		o = e.pageX - $(".thumb").offset().left;
	});

	$(document).on("focus", "input", function() {
		$(this).attr("autocomplete", "off")
			.attr("autocorrect", "off")
			.attr("autocapitalize", "off")
			.attr("spellcheck", "false");
	});
});

function createRouter() {
	return Backbone.Router.extend({
		routes: {
			"": "podcasts",
			"podcasts": "podcasts",
			"episodes": "episodes",
			"settings": "settings",
			"now-playing": "nowPlaying",
			"fullscreen":  "fullscreen",
			"p:n": "foo",
			"*any": "podcasts"
		},

		podcasts: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-podcasts").show();
				if (small) {
					page = 0;
					$(".col").hide();
					$("#playbar").show();
					$(".col:eq(0)").show();
				}
				$("#vid-container").addClass("thumb");
			}
		},

		episodes: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-episodes").show();
				$("#vid-container").addClass("thumb");
			}
		},

		settings: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-settings").show();
				$("#vid-container").addClass("thumb");
			}
		},

		foo: function(n) {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-podcasts").show();
				page = n;
				if (small) {
					$(".col").hide();
					$("#playbar").show();
					$(".col:eq(" + n + ")").show();
					if (page == 2) {
						$("#podcast-vmenu").hide();
						$("#podcast-cols").css("left", "0px");
					}
					else {
						$("#podcast-vmenu").show();
						$("#podcast-cols").css("left", "50px");
					}
				}
				$("#vid-container").addClass("thumb");
			}
		},

		nowPlaying: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#vid-container").removeClass("thumb");
				$("#vid-container").css("right", 0);
				$("#tab-now-playing").show();
			}
		},

		fullscreen: function() {
			$("#topbar").hide();
			$("#vid-container").removeClass("thumb");
			$("#vid-wrap").addClass("fs");
			$("#vid-container").addClass("fs");
			playbarActions.show(1000);
		}
	});
}

function addFeed(feedurl, name) {
	castActions.add(feedurl, name);

	$("#input-vmenu-add").val("");
	$("#input-vmenu-add").toggle();
	$("#button-vmenu-add").toggle();
	$("#vmenu-add-results").toggle();
}

function addLabel(name) {
	labelActions.add(name);

	$("#input-vmenu-label").val("");
	$("#input-vmenu-label").toggle();
	$("#button-vmenu-label").toggle();
}

function playEpisode(id) {
	if (currentEpisodeId !== id) {
		if (currentEpisodeId !== null) {
			if (!el("vid").paused) {
				eventActions.send(Event.Play, currentEpisodeId);
			}
		}

		if (!(id in episodes) && id in tempEpisodes) {
			episodes[id] = tempEpisodes[id];
			delete tempEpisodes[id];
			localforage.setItem("episodes", episodes);
		}

		if (id in episodes) {
			sessionStorage.lastepisode = JSON.stringify({ id: id, castid: episodes[id].castid });

			$("#overlay-info h2").html(episodes[id].feed.title);
			$("#overlay-info h5").html(casts[episodes[id].castid].feed.title);

			currentEpisodeId = id;

			if (episodes[id].lastevent === null) {
				eventActions.send(Event.Start, id, 0);
			}

            var desc = "";
            if (_.isString(episodes[id].feed.description)) {
                desc = episodes[id].feed.description.replace(/(<([^>]+)>)/ig,"");
            }

			Chromecast.load(episodes[id].feed.enclosure.url, {
				title: episodes[id].feed.title,
				description: desc,
				image: null //getEpisodeImage(id)
			});

			var video = el("vid");
			video.setAttribute("src", episodes[id].feed.enclosure.url);
			video.load();
			videoLoading = true;
			ended = false;
			paused = true;
			mediaActions.pause();

			video.playbackRate = settings.Playback.PlaybackRate.value;

			id = episodes[id].castid;

			playbackQueue = [];
			for (var i in episodes) {
				if (episodes[i].castid == id) {
					if (!(episodes[i].lastevent && episodes[i].lastevent.type == Event.Delete)) {
						playbackQueue.push(episodes[i]);
						if (i == currentEpisodeId) {
							currentQueuePosition = playbackQueue.length - 1;
						}
					}
				}
			}

			playbackQueue.sort(function(a, b) {
				var d1 = new Date(a.feed.pubDate);
				var d2 = new Date(b.feed.pubDate);
				if (d1 > d2) {
					return -1;
				}
				if (d1 < d2) {
					return 1;
				}
				return 0;
			});

			$("#vid-container").removeClass("minimized");
		}
	}
}

function login() {
	apiRoot = $("#input-target").val();
	if (apiRoot.indexOf("/", apiRoot.length - 1) === -1) {
		apiRoot += "/";
	}
	API.setRoot(apiRoot);

	username = $("#input-username").val();
	var password = $("#input-password");
	userActions.login(username, password.val());
	password.val("");
}

userActions.loginDone.listen(function(loggedIn, username, local) {
	if (loggedIn) {
		sync();
		finishLogin();
		if (local) {
			Backbone.history.start({ pushState: true, root: root });
			$("#playbar").show();
			$("#topbar nav").show();
			$("#userinfo").show();
		}
		else {
			$("#tab-podcasts").velocity("fadeIn");
			$("#playbar").velocity("slideDown");
			$("#topbar nav").velocity("fadeIn");
			$("#userinfo").velocity("fadeIn");
		}
	}
});

function finishLogin() {
	loggedIn = true;

	$("#userinfo span").html(username);
	$(".tab").hide();
	$("#main-container").css("bottom", "55px");

	if (Backbone.history.fragment !== "now-playing") {
		$("#vid-container").addClass("thumb");
	}
}

function sync(onDemand) {
	if (onDemand || app.autoSync) {
		appActions.sync();
	}
	if (!onDemand) {
		setTimeout(sync, settings.Advanced.SyncInterval.value * 1000);
	}
}

/*	else {
		$("#episodes").empty().append('<div class="episodes-empty"><h2>There are no episodes left</h2><button id="show-all-episodes" class="button">Show me everything!</button></div>');
	}*/

/*function renderEpisodeFeed() {
	var e = [];
	for (var id in episodes) {
		if (!(episodes[id].lastevent && episodes[id].lastevent.type == Event.Delete) && episodes[id].feed) {
			e.push(episodes[id]);
		}
	}

	e.sort(function(a, b) {
		var d1 = new Date(a.feed.pubDate);
		var d2 = new Date(b.feed.pubDate);
		if (d1 > d2) {
			return -1;
		}
		if (d1 < d2) {
			return 1;
		}
		return 0;
	});

	$("#tab-episodes .list").empty();
	e.forEach(function(episode) {
		var url = getEpisodeImage(episode.id);
		$("#tab-episodes .list").append("<div><h2>" + casts[episode.castid].feed.title + '</h2><img src="' + url + '"><h1>' + episode.feed.title + '</h1></div>');
	});

	if (episodeFeedScroll) {
		setTimeout(function() { episodeFeedScroll.refresh(); }, 0);
	}
	else {
		episodeFeedScroll = new IScroll('#tab-episodes', {
			mouseWheel: true,
			scrollbars: 'custom',
			keyBindings: true,
			interactiveScrollbars: true,
			click: true
		});
	}
}*/

function showAllEpisodes(castid) {
	API.getEpisodes(castid, function(episodes) {
		/*tempEpisodes = {};
		episodes.forEach(function(episode) {
			tempEpisodes[episode.id] = episode;
		});

		var template = _.template($("script.episodes").html());
		$("#episodes").empty().append(template({ episodes: episodes }));*/
	});
}

function resetPlayback(id) {
	if (id === currentEpisodeId) {
		seek(0);
	}
	else {
		/*if (!(id in episodes) && id in tempEpisodes) {
			episodes[id] = tempEpisodes[id]
			delete tempEpisodes[id];
		}*/
		eventActions.send(Event.Pause, id, 0);
	}
}

function setKeybinds() {
	Mousetrap.reset();
	Mousetrap.bind(settings.Keybinds.PlayPause.value, playPauseToggle);
	Mousetrap.bind(settings.Keybinds.Next.value, nextEpisode);
	Mousetrap.bind(settings.Keybinds.Previous.value, previousEpisode);
	Mousetrap.bind(settings.Keybinds.SkipForward.value, skipForward);
	Mousetrap.bind(settings.Keybinds.SkipBack.value, skipBack);
}

function playPauseToggle() {
	if (paused) {
		play();
	}
	else {
		pause();
	}
	if (poppedOut) {
		popoutMessage({
			action: "playPause"
		});
	}
}

function play() {
	if (Chromecast.running()) {
		Chromecast.play();
	}
	else {
		el("vid").play();
	}
	ended = false;
	paused = false;
	mediaActions.play();
	eventActions.send(Event.Play, currentEpisodeId);
	$(".button-play i").addClass("fa-pause");
	$(".button-play i").removeClass("fa-play");
}

function pause() {
	if (Chromecast.running()) {
		Chromecast.pause();
	}
	else {
		el("vid").pause();
	}
	paused = true;
	mediaActions.pause();
	eventActions.send(Event.Pause, currentEpisodeId);
	$(".button-play i").addClass("fa-play");
	$(".button-play i").removeClass("fa-pause");
}

function seek(time) {
	if (poppedOut) {
		popoutMessage({
			action: "seek",
			time: time
		});
	}
	else {
		if (Chromecast.running()) {
			Chromecast.seek(time);
		}
		else {
			el("vid").currentTime = time;
		}
	}
}

function skipBack() {
	if (poppedOut) {
		popoutMessage({
			action: "skipBack"
		});
	}
	else {
		if (Chromecast.running()) {
			currentTime -= 15;
			Chromecast.seek(currentTime);
		}
		var video = el("vid");
		eventActions.send(Event.Pause, currentEpisodeId);
		video.currentTime = video.currentTime - 15;
		eventActions.send(Event.Play, currentEpisodeId);
		if (video.paused) {
			eventActions.send(Event.Pause, currentEpisodeId);
		}
	}
}

function skipForward() {
	if (poppedOut) {
		popoutMessage({
			action: "skipForward"
		});
	}
	else {
		if (Chromecast.running()) {
			currentTime += 15;
			Chromecast.seek(currentTime);
		}
		var video = el("vid");
		eventActions.send(Event.Pause, currentEpisodeId);
		video.currentTime = video.currentTime + 15;
		eventActions.send(Event.Play, currentEpisodeId);
		if (video.paused) {
			eventActions.send(Event.Pause, currentEpisodeId);
		}
	}
}

function muteToggle() {
	mediaActions.toggleMute();
	if (poppedOut) {
		popoutMessage({
			action: "muteToggle"
		});
	}
	var video = el("vid");
	video.muted = !video.muted;
	Chromecast.mute(video.muted);
}

function volume(vol) {
	mediaActions.setVolume(vol);
	if (vol < 0) {
		vol = 0;
	}
	else if (vol > 1) {
		vol = 1;
	}
	if (poppedOut) {
		popoutMessage({
			action: "volume",
			volume: vol
		});
	}
	Chromecast.volume(vol);
	var video = el("vid");
	video.volume = vol;
}

function nextEpisode() {
	if (String(settings.Playback.KeepPlaying.value) == "true") {
		currentQueuePosition++;
		if (currentQueuePosition < playbackQueue.length) {
			autoplay = true;
			mediaActions.playEpisode(playbackQueue[currentQueuePosition].id);
		}
	}
}

function previousEpisode() {
	console.log("previousEpisode called");
}

function updateTime(currentTime) {
	if (window.name === "popout" && currentTime > 0) {
		var ev = new window.Event('timeupdate');
		ev.data = { time: currentTime };
		window.dispatchEvent(ev);
	}
}

function positionThumb() {
	if ($("#episodeinfo").isOverflowing()) {
		$("#vid-container.thumb").css("right", "15px");
	}
	else {
		$("#vid-container.thumb").css("right", "1px");
	}
}

function popoutMessage(obj) {
	poppedOut.postMessage(JSON.stringify(obj), "*");
}

function padCastOverlay() {
	$("#cast-overlay").css("line-height", $("#cast-overlay").height() + "px");
}

function el(id) {
	return document.getElementById(id);
}

function uniqueName(name) {
	return username + "-" + name;
}

if (window.location.host === "castcloud.khlieng.com") {
	$("#demo").show().click(demo);
}

function demo() {
	username = "demo";
	userActions.login("demo", "pass");
}
