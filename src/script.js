var Chromecast = require('./chromecast.js');
var DragDrop = require('./dragdrop.js');
var API = require('./api.js');
var util = require('./util.js');
require('./jquery-plugins.js');

var appActions = require('./actions/appActions.js');
var appStore = require('./stores/appStore.js');

var app = appStore.getDefaultData();
appStore.listen(function(newApp) {
	app = newApp;
});

var userActions = require('./actions/userActions.js');
var castActions = require('./actions/castActions.js');

var mediaActions = require('./actions/mediaActions.js');
var mediaStore = require('./stores/mediaStore.js');

var eventActions = require('./actions/eventActions.js');
var eventStore = require('./stores/eventStore.js');

var Settings = require('./components/Settings.jsx');
var settingsActions = require('./actions/settingsActions.js');
var settingsStore = require('./stores/settingsStore.js');

var DefaultSettings = require('./settings.js').DefaultSettings;

var EpisodeList = require('./components/EpisodeList.jsx');
var EpisodeInfo = require('./components/EpisodeInfo.jsx');
var episodeActions = require('./actions/episodeActions.js');
var episodeStore = require('./stores/episodeStore.js');

var events = [];
eventStore.listen(function(_events) {
	events = _events;
	if (selectedEpisodeId !== null) {
		renderEvents(selectedEpisodeId);
	}
});

var episodes = {};
episodeStore.listen(function(state) {
	episodes = state.episodes;
	if (state.selectedEpisode) {
		selectEpisode(state.selectedEpisode);
		renderEvents(state.selectedEpisode);
	}
	updateEpisodeCount();
});

var settings = DefaultSettings;
settingsStore.listen(function(newSettings) {
	settings = newSettings;
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

var ContextMenu = require('./components/ContextMenu.jsx');
var contextMenuActions = require('./actions/contextMenuActions.js');
var contextMenus = require('./contextMenus.js');

contextMenus.cast = [{
	content: "Show all episode",
	action: showAllEpisodes
}, {
	content: "Rename",
	action: function(id) {
		var cast = $("#cast-" + id + " .name");
		var name = cast.html();
		cast.html('<input type="text">');
		$(".cast input").focus();
		$(".cast input").val(name);
		$(".cast input").keydown(function(e) {
			if (e.which === 13) {
				var name = $(this).val();
				cast.html(name);
				API.renameCast(id, name);
			}
		});
	}
}, {
	content: "Unsubscribe",
	action: function(id) {
		$(".cast.selected").each(function() {
			var id = $(this).id();
			$("#cast-" + id).remove();
			castActions.remove(id);
		});
		$("#cast-" + id).remove();
		castActions.remove(id);
	}
}, {
	content: "Add to label",
	action: function() {
		$("#add-to-label").show()
	}
}];

contextMenus.label = [{
	content: "Rename",
	action: function(id) {
		var label = $("#label-" + id + " .name span");
		var name = label.html();
		label.html('<input type="text">');
		$(".label input").focus();
		$(".label input").val(name);
		$(".label input").keydown(function(e) {
			if (e.which === 13) {
				var name = $(this).val();
				label.html(name);
				API.renameLabel(id, name);
			}
		});
	}
}, {
	content: "Delete",
	action: function(id) {
		$("#label-" + id + " .cast").detach().appendTo("#podcasts");
		$("#label-" + id).remove();
		setTimeout(function() {
			castScroll.refresh();
		}, 0);
		API.removeLabel(id);
	}
}];

episodeActions.resetPlayback.listen(resetPlayback);
episodeActions.delete.listen(function(id) {
	pushEvent(Event.Delete, id);
});
episodeActions.select.listen(function() {
	router.navigate("p2", { trigger: true });
});

eventActions.show.listen(function() {
	if (small) {
		$("#events").velocity({ left: "0%" });
	}
	else {
		$("#events").velocity({ left: "66.666666%" });
	}
});

React.render(<EpisodeList />, document.getElementById("episode-list"));
React.render(<EpisodeInfo />, document.getElementById("episodeinfo"));
React.render(<Settings />, document.getElementById("tab-settings"));
React.render(<ContextMenu />, document.getElementById("context-menu"));

var username;
var loggedIn = false;
var root;
var apiRoot;

var tempEpisodes = {};
var casts = {};
var labels;
var rootLabelId;

var poppedOut;
var mediaType;
var ctrlDown = false;
var autoplay = false;
var currentTime;
var contextItemID;
var paused = false;
var ended = false;
var lastEventTS = null;
var currentOrder = 0;
var playbackQueue = [];
var currentQueuePosition = 0;

var castScroll;
var episodeinfoScroll;
var episodeFeedScroll;

var currentEpisodeId = null;
var currentEpisodeDuration;
var selectedEpisodeId = null;
var selectedCastId = null;
var videoLoading = false;
var castHovered = null;
var episodeHovered = null;

var router;
var page = 0;
var small;
var prevSmall = false;

var Event = {
	Start: 10,
	Pause: 20,
	Play: 30,
	SleepStart: 40,
	SleepEnd: 50,
	EndOfTrack: 60,
	Delete: 70,
	10: "Start",
	20: "Pause",
	30: "Play",
	40: "Sleep Started",
	50: "Sleep Ended",
	60: "End Of Track",
	70: "Delete"
};

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
	updateTime(time);
	currentTime = time;
});

function Menu(el) {
	this.visible = false;
	this.el = $(el);
}

Menu.prototype.show = function() {
	if (!this.visible) {
		this.el.velocity("slideDown");
		this.visible = true;
	}
}

Menu.prototype.hide = function() {
	if (this.visible) {
		this.el.velocity("slideUp");
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

$.Velocity.defaults.duration = 200;

$(document).ready(function() {
	//DragDrop.init("#podcasts", ".drag");
	//DragDrop.ended(saveLabels);

	var menu = new Menu("#menu-container");

	var Router = createRouter();
	router = new Router();

	router.bind("all", function(route, router) {
		if (small) {
			menu.hide();
		}
		positionThumb();
		padCastOverlay();
		$("#overlay-info").hide();
	});

	var storedUsername = localStorage.username;
	if(storedUsername) {
		username = storedUsername;
		$("#input-username").val(username);
	}

	root = CLIENT_ROOT;
	apiRoot = localStorage[uniqueName("apiTarget")] || window.location.protocol + "//" + window.location.host + root.replace("client", "api");
	
	var storedToken = localStorage.token;
	if (storedToken) {
		API.setRoot(apiRoot);
		API.setToken(storedToken);
		userActions.loginDone(true, username, true);
	}
	else {
		Backbone.history.start({ pushState: true, root: root });
		$("#input-target").val(apiRoot);
	}

	$("#podcasts").on("click", ".cast", function() {
		router.navigate("p1", { trigger: true });
	});

	small = $(".col").css("width") === "100%";

	$(window).resize(function() {
		small = window.innerWidth < 665;
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
		updateTime(video.currentTime);
	});

	$("#vid").click(function() {
		playPauseToggle();
	});

	$("#vid").dblclick(function() {
		toggleFullscreen();
	});

	$("#vid-thumb-bar .popout").click(function() {
		var video = el("vid");
		if (paused) {
			pushEvent(Event.Pause);
		}
		else {
			pushEvent(Event.Play);
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
			updateTime(e.originalEvent.data.time);
		});

		$(poppedOut).on("unload", function() {
			if (localStorage.beforeunloadevent) {
				var ev = JSON.parse(localStorage.beforeunloadevent);
				pushEvent(ev.type, ev.id, ev.time);
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
			$("#vid-container").removeClass("thumb");
		}
		else {
			if (Backbone.history.fragment !== "now-playing") {
				$("#vid-container").addClass("thumb");
			}
			if (timer !== null) {
				clearTimeout(timer);
			}
			$("#overlay-info").velocity("stop").hide();
		}
	});

	var timer = null;
	$("#vid-wrap").mousemove(function() {
		if (!bar) {
			var overlay = $("#overlay-info");
			if ($(this).hasClass("fs")) {
				$("#playbar").show();
				if (overlay.css("display") === "none") {
					overlay.velocity("fadeIn");
				}
				if (timer !== null) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					$("#playbar").hide();
					overlay.velocity("fadeOut");
				}, 1000);
			}
			else if ($("#vid-container").css("right") == "0px") {
				if (overlay.css("display") === "none") {
					overlay.velocity("fadeIn");
				}
				if (timer !== null) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					overlay.velocity("fadeOut");
				}, 1000);
			}
		}
	});

	var bar = false;

	$("#playbar").mouseover(function() {
		bar = true;
		if ($(this).parent().hasClass("fs")) {
			if (timer !== null) {
				clearTimeout(timer);
			}
		}
		$("#badeball").css("height", "20px").css("width", "20px").css("top", "-5px").css("margin-left", "0px");
		$("#seekbar").css("height", "10px");
	});

	$("#playbar").mouseout(function() {
		bar = false;
		if ($(this).parent().hasClass("fs")) {
			timer = setTimeout(function() {
				$("#playbar").hide();
				$("#overlay-info").velocity("fadeOut");
			}, 1000);
		}
		if (!seeking) {
			$("#seekbar").css("height", "5px");
			$("#badeball").css("height", "0px").css("width", "0px").css("top", "2.5px").css("margin-left", "10px");
		}
	});

	$(window).on("beforeunload", function() {
		if (currentEpisodeId !== null) {
			if (!paused && !ended) {
				localStorage.beforeunloadevent = JSON.stringify({
					type: Event.Play,
					id: currentEpisodeId,
					time: el("vid").currentTime | 0
				});
			}
		}
	});

	$(window).on("unload", function() {
		if (currentEpisodeId !== null) {
			if (!paused && !ended) {
				localStorage.unloadevent = JSON.stringify({
					type: Event.Play,
					id: currentEpisodeId,
					time: el("vid").currentTime | 0
				});
			}
		}
	});

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
			$("#vid-art").prop("src", getEpisodeImage(currentEpisodeId));
			mediaType = "audio";
			$("#vid-container").show();
			$("#vid-container").addClass("audio");
		}
		padCastOverlay();

		currentEpisodeDuration = video.duration;

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
		pushEvent(Event.EndOfTrack);
		$("#vid-container").hide();
		ended = true;
		nextEpisode();
	});

	var seeking = false;
	$("#seekbar").mousedown(function(e) {
		pushEvent(Event.Pause);
		seek(1 / $("#seekbar").width() * (e.pageX - $("#seekbar").position().left) * currentEpisodeDuration);
		seeking = true;
	});

	$("#badeball").mousedown(function(e) {
		pushEvent(Event.Pause);
		seek(1 / $("#seekbar").width() * (e.pageX - $("#seekbar").position().left) * currentEpisodeDuration);
		seeking = true;
	});

	$("#seekbar").mouseover(function() {
		//$("#seektime").show();
	});

	$("#seekbar").mouseout(function() {
		if (!seeking) {
			$("#seektime").hide();
		}
	});

	function updateSeektime(x) {
		var currentTime = 1 / $("#seekbar").width() * (x - $("#seekbar").position().left) * currentEpisodeDuration;

		var date = new Date(currentTime * 1000);

		date.setHours(date.getHours() - 1);

		var time = "";
		if (date.getHours() > 0) {
			time += date.getHours().pad() + ":";
		}
		time += date.getMinutes().pad() + ":" + date.getSeconds().pad();

		$("#seektime").css("left", (x - $("#seektime").outerWidth() / 2) + "px");
		$("#seektime").html(time);
	}

	$("#seekbar").mousemove(function(e) {
		updateSeektime(e.pageX);
	});

	$(document).mouseup(function() {
		x = false;
		if (seeking) {
			$("#seektime").hide();
			$("#seekbar").css("height", "5px");
			$("#badeball").css("height", "0px").css("width", "0px").css("top", "5px");
			seeking = false;
			pushEvent(Event.Play);
			if (el("vid").paused) {
				pushEvent(Event.Pause);
			}
		}
		if (volumizing) {
			volumizing = false;
			if (!volumeMousedOver) {
				$("#volume .bar").hide();
			}
		}
	});

	$(document).mousemove(function(e) {
		if (x) {
			var thumb = $(".thumb");
			var width = window.innerWidth - e.pageX - o - (window.innerWidth - (thumb.offset().left + thumb.width()));
			thumb.css("width", width + "px");
			settingsActions.set("ThumbWidth", width, "__client");
		}
		if (seeking) {
			seek(1 / $("#seekbar").width() * (e.pageX - $("#seekbar").position().left) * currentEpisodeDuration);
			updateSeektime(e.pageX);
		}
		if (volumizing) {
			volume(1 / 60 * (e.pageX - $("#volume .bar .inner").position().left));
		}
	});

	$("#playbar-gear").click(function() {
		$("#playbar-gear-menu").toggle();
	});

	$("#playbar-fullscreen").click(toggleFullscreen);

	$(".playback-rate").click(function() {
		var rate = $(this).attr("rate");
		$(".playback-rate").removeClass("selected");
		$(this).addClass("selected");
		el("vid").playbackRate = rate;
		settingsActions.set("PlaybackRate", rate, "Playback");
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
		if ($("#input-vmenu-add:visible").length > 0) {
			castScroll.scrollTo(0, 0);
		}
	});

	$("#button-vmenu-add").click(function() {
		addFeed($("#input-vmenu-add").val());
	});

	$("#input-vmenu-add").keydown(function(e) {
		e.stopPropagation();

		var selected = $("#vmenu-add-results p.selected");
		if (e.which === 13) {
			if (selected.length > 0) {
				addFeed(selected.attr("feed-url"));
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
					url: "http://itunes.apple.com/search",
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
							$("#vmenu-add-results").append('<p feed-url="' + result.feedUrl + '">' + result.trackName + '</p>');
						});
						$("#vmenu-add-results p:first-child").addClass("selected");
					}
				});
			}, 100);
		}
	});

	$("#vmenu-add-results").on("click", "p", function() {
		addFeed($(this).attr("feed-url"));
		$(this).parent().empty();
	});

	$("#vmenu-label").click(function() {
		var prev = $(".vmenu-toggle:visible");
		$("#input-vmenu-label").toggle();
		$("#button-vmenu-label").toggle();
		prev.hide();
		$("#input-vmenu-label").focus();
		if ($("#input-vmenu-label:visible").length > 0) {
			castScroll.scrollTo(0, 0);
		}
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

	$("#volume i").click(function() {
		muteToggle();
	});

	var volumeMousedOver = false;
	$("#volume").mouseover(function() {
		$("#volume .bar").show();
		volumeMousedOver = true;
	});

	$("#volume").mouseout(function() {
		if (!volumizing) {
			$("#volume .bar").hide();
		}
		volumeMousedOver = false;
	});

	var volumizing = false;
	$("#volume .bar").mousedown(function(e) {
		volume(1 / 60 * (e.pageX - $("#volume .bar .inner").position().left));
		volumizing = true;
	});

	$("#podcasts").on("contextmenu", ".cast", function(e) {
		contextMenuActions.show("cast", $(this).id(), e.pageX, e.pageY);
		return false;
	});

	$("#podcasts").on("contextmenu", ".label", function(e) {
		contextMenuActions.show("label", $(this).id(), e.pageX, e.pageY);
		return false;
	});

	$("#podcasts").on("mouseover", ".cast", function() {
		castHovered = $(this).id();
	});

	$("#podcasts").on("mouseout", ".cast", function() {
		castHovered = null;
	});

	/*$("#episodes").on("mouseover", ".episode", function() {
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

		if (castHovered !== null) {
			$("#clip").val(casts[castHovered].url).focus().select();
		}
		else if (episodeHovered !== null) {
			$("#clip").val(episodes[episodeHovered].feed.enclosure.url).focus().select();
		}
	});

	$(document).keyup(function(e) {
		ctrlDown = false;
		shiftDown = false;
	});

	$("#add-to-label").on("click", "p", function() {
		$("#add-to-label").hide();
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

	$("#events").on("click", "#events-close", function() {
		$("#events").velocity({ left: "100%" });
	});

	$("#events").on("click", "div", function() {
		$("#events").velocity({ left: "100%" });

		var type = $(this).attr("event-type");
		var video = el("vid");

		video.currentTime = $(this).attr("event-position");
		Chromecast.seek($(this).attr("event-position"));
		if (type == Event.Start || type == Event.Play) {
			video.play();
		}
		else {
			video.pause();
		}
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

	$("#podcasts").on("click", ".label .name", function() {
		$(this).parent().find(".content").toggle();
		if ($(this).find("i").hasClass("fa-angle-down")) {
			$(this).find("i").removeClass("fa-angle-down");
			$(this).find("i").addClass("fa-angle-up");
		}
		else {
			$(this).find("i").removeClass("fa-angle-up");
			$(this).find("i").addClass("fa-angle-down");
		}
		setTimeout(function() { castScroll.refresh(); }, 0);
		saveLabels();
	});


	$("#podcasts").on("click", ".cast", function(e) {
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
	});

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
	});

	$("#episodes").on("click", "#show-all-episodes", function() {
		showAllEpisodes(selectedCastId);
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
				if (castScroll) {
					setTimeout(function() {
						castScroll.refresh();
					}, 0);
				}
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
				if (castScroll) {
					setTimeout(function() {
						castScroll.refresh();
					}, 0);
				}
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
		}
	});
}

var addingFeed = false;

function addFeed(feedurl) {
	API.addCast(feedurl, function() {
		sync(true);
		addingFeed = true;
	});

	$("#input-vmenu-add").val("");
	$("#input-vmenu-add").toggle();
	$("#button-vmenu-add").toggle();
	$("#vmenu-add-results").toggle();
}

function addLabel(name) {
	$("#input-vmenu-label").val("");
	$("#input-vmenu-label").toggle();
	$("#button-vmenu-label").toggle();

	//$("#add-to-label").append('<p>' + name + '</p>');

	API.addLabel(name);
}

function loadEpisodeInfo(id) {
	var episode = id in episodes ? episodes[id] : tempEpisodes[id];
	if (episode) {
		$("#overlay-info h2").html(episode.feed.title);
		$("#overlay-info h5").html(casts[episode.castid].feed.title);
	}
	positionThumb();
}

function selectEpisode(id) {
	selectedEpisodeId = id;
	renderEvents(id);
}

function playEpisode(id) {
	if (currentEpisodeId !== id) {
		if (currentEpisodeId !== null) {
			if (!el("vid").paused) {
				pushEvent(Event.Play);
			}
		}

		if (!(id in episodes) && id in tempEpisodes) {
			episodes[id] = tempEpisodes[id];
			delete tempEpisodes[id];
			localforage.setItem("episodes", episodes);
		}

		if (id in episodes) {
			sessionStorage.lastepisode = JSON.stringify({ id: id, castid: episodes[id].castid });

			currentEpisodeId = id;

			if (episodes[id].lastevent === null) {
				pushEvent(Event.Start, id, 0);
			}

            var desc = "";
            if (_.isString(episodes[id].feed.description)) {
                desc = episodes[id].feed.description.replace(/(<([^>]+)>)/ig,"");
            }

			Chromecast.load(episodes[id].feed.enclosure.url, {
				title: episodes[id].feed.title,
				description: desc,
				image: getEpisodeImage(id)
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

	initDB();
	sync();

	$("#userinfo span").html(username);
	$(".tab").hide();
	$("#main-container").css("bottom", "55px");

	if (Backbone.history.fragment !== "now-playing") {
		$("#vid-container").addClass("thumb");
	}
}

var castsLoaded = false;

function initDB() {
	var render = _.after(2, function() {
		renderCasts();

		var template = _.template($("script.labels").html());
		$("#add-to-label").empty().append(template({ labels: labels }));
	});

	localforage.getItem("labels", function(err, data) {
		if (data) {
			console.log("Labels loaded");
			labels = data;
			render();
		}
	});

	localforage.getItem("casts", function(err, data) {
		if (data) {
			console.log("Casts loaded");
			casts = data;
			castsLoaded = true;
			render();
		}
	});
}

function sync(onDemand) {
	if (onDemand || app.autoSync) {
		loadLabels();
		appActions.sync(onDemand);
	}

	if (!onDemand) {
		setTimeout(sync, settings.Advanced.SyncInterval.value * 1000);
	}
}

function pushEvent(type, id, time) {
	if (poppedOut) {
		return;
	}

	var eventTS = unix();
	if (lastEventTS === eventTS) {
		currentOrder++;
	}
	else {
		currentOrder = 0;
	}
	lastEventTS = eventTS;

	id = id || currentEpisodeId;

	var event = {
		clientdescription: util.userAgent(),
		clientname: "Castcloud",
		clientts: eventTS,
		episodeid: id,
		name: Event[type],
		positionts: time === undefined ? el("vid").currentTime | 0 : time,
		type: type,
		concurrentorder: currentOrder
	};

	var position = new Date(event.positionts * 1000);
	position.setHours(position.getHours() - 1);
	event.position = "";
	if (position.getHours() > 0) {
		event.position += position.getHours() + "h ";
	}
	event.position += position.getMinutes() + "m " + position.getSeconds() + "s";
	var date = new Date(event.clientts * 1000);
	date.setHours(date.getHours() - 1);
	event.date = date.toLocaleString();

	eventActions.send(event);
}

function loadCasts() {
	API.getCasts(function(res) {
		casts = res;

		localforage.setItem("casts", casts);

		renderCasts();
	});
}

var castsHash;
var firstCastsRender = true;

function renderCasts() {
	var hash = "";
	if (!firstCastsRender) {
		hash = CryptoJS.MD5(JSON.stringify(labels) + JSON.stringify(casts));
	}
	if (hash !== castsHash) {
		castsHash = hash;

		var template = _.template($("script.podcasts").html());
		$("#podcasts").empty().append(template({ labels: labels, casts: casts }));
		positionThumb();

		labels.root.forEach(function(label) {
			if (label.type === "label") {
				if (labels[label.id].expanded) {
					$("#label-" + label.id + " .content").show();
				}
			}
		});

		if (castScroll) {
			setTimeout(function() { castScroll.refresh(); }, 0);
		}
		else {
			castScroll = new IScroll('#foo', {
				mouseWheel: true,
				scrollbars: 'custom',
				keyBindings: true,
				interactiveScrollbars: true,
				click: true
			});
		}

		if (sessionStorage.selectedcast) {
			selectedCastId = sessionStorage.selectedcast;
			$("#cast-" + selectedCastId).addClass("selected");
		}
		else if (sessionStorage.lastepisode) {
			var lastepisode = JSON.parse(sessionStorage.lastepisode);
		}

		updateEpisodeCount();

		if (addingFeed) {
			addingFeed = false;
			selectCast($("#podcasts > .cast:last-child").id());
			setTimeout(function() {
				castScroll.scrollTo(0, castScroll.maxScrollY, 0);
			}, 0);
		}

		if (firstCastsRender) {
			firstCastsRender = false;
			setTimeout(function() {
				castsHash = CryptoJS.MD5(JSON.stringify(labels) + JSON.stringify(casts));
			}, 0);
		}
	}
}

function selectCast(id) {
	castActions.select(id);
	selectedCastId = id;
	$(".cast").removeClass("selected");
	$("#cast-" + id).addClass("selected");
}

/*
		if (sessionStorage.lastepisode) {
			var lastepisode = JSON.parse(sessionStorage.lastepisode);
			if (lastepisode.id in episodes) {
				playEpisode(lastepisode.id);
			}
			$("#ep-" + lastepisode.id).addClass("selected");
		}
	}
	else {
		$("#episodes").empty().append('<div class="episodes-empty"><h2>There are no episodes left</h2><button id="show-all-episodes" class="button">Show me everything!</button></div>');
	}*/

function updateEpisodeCount() {
	var n = {};
	for (var i in episodes) {
		var episode = episodes[i];
		if (episode.castid in n) {
			n[episode.castid]++;
		}
		else {
			n[episode.castid] = 1;
		}
	}

	for (var index in n) {
		var episodeCounter = $("#cast-" + index + " .n");
		if (n[index] > 0) {
			episodeCounter.html(n[index]);
		}
		else {
			episodeCounter.width(0);
		}
	}
}

function renderEpisodeFeed() {
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
}

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
		pushEvent(Event.Pause, id, 0);
		updateEpisodeCount();
	}
}

function updateStorageUsed() {
	if (navigator.webkitTemporaryStorage) {
		navigator.webkitTemporaryStorage.queryUsageAndQuota(
			function(used) {
				$(".used").html((used / 1024 / 1024).toFixed(2) + " MB");
			}
		);
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

function loadLabels() {
	API.getLabels(function(res) {
		labels = res;

		var template = _.template($("script.labels").html());
		$("#add-to-label").empty().append(template({ labels: labels }));

		localforage.setItem("labels", labels);
		loadCasts();
	});
}

function saveLabels() {
	var content = [];
	$("#podcasts > div").each(function(index, el) {
		content.push($(el).prop("id").replace("-", "/"));
	});

	API.updateLabel(rootLabelId, {
		content: content.join()
	});

	$("#podcasts .label").each(function(index, el) {
		content = [];
		$(el).find(".cast").each(function(index, el) {
			content.push($(el).prop("id").replace("-", "/"));
		});

		API.updateLabel($(el).id(), {
			content: content.join(),
			expanded: $(el).find(".content").is(":visible")
		});
	});
}

function renderEvents(id) {
	var e = [];
	for (var i = 0; i < events.length; i++) {
		if (events[i].episodeid == id) {
			e.push(events[i]);
			if (e.length === 10) {
				break;
			}
		}
	}
	var template = _.template($("script.events").html());
	$("#events").empty().append(template({ events: e }));
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
	pushEvent(Event.Play);
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
	pushEvent(Event.Pause);
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
	var progress = 1 / currentEpisodeDuration * time;
	$("#seekbar div").css("width", $("#seekbar").width() * progress + "px");
	$("#badeball").css("left", $("#seekbar").width() * progress - 10 + "px");
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
		pushEvent(Event.Pause);
		video.currentTime = video.currentTime - 15;
		pushEvent(Event.Play);
		if (video.paused) {
			pushEvent(Event.Pause);
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
		pushEvent(Event.Pause);
		video.currentTime = video.currentTime + 15;
		pushEvent(Event.Play);
		if (video.paused) {
			pushEvent(Event.Pause);
		}
	}
}

function muteToggle() {
	if (poppedOut) {
		popoutMessage({
			action: "muteToggle"
		});
	}
	var video = el("vid");
	video.muted = !video.muted;
	Chromecast.mute(video.muted);
	if (video.muted) {
		$("#volume i").removeClass("fa-volume-up");
		$("#volume i").addClass("fa-volume-off");
		$("#volume .bar .inner").css("width", 0);
	}
	else {
		$("#volume i").removeClass("fa-volume-off");
		$("#volume i").addClass("fa-volume-up");
		$("#volume .bar .inner").css("width", (60 * video.volume) + "px");
	}
}

function volume(vol) {
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
	$("#volume .bar .inner").css("width", (60 * video.volume) + "px");

	if (vol === 0) {
		$("#volume i").removeClass("fa-volume-up");
		$("#volume i").addClass("fa-volume-off");
	}
	else {
		video.muted = false;
		$("#volume i").removeClass("fa-volume-off");
		$("#volume i").addClass("fa-volume-up");
	}
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

function toggleFullscreen() {
	var video = el("vid-wrap");
	if ($("#vid-wrap").hasClass("fs")) {
		document.webkitExitFullscreen();
		$("#playbar-fullscreen").removeClass("fa-compress").addClass("fa-expand");
	}
	else {
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.msRequestFullscreen){
			video.msRequestFullscreen();
		} else if (video.mozRequestFullScreen){
			video.mozRequestFullScreen();
		} else if (video.webkitRequestFullscreen){
			video.webkitRequestFullscreen();
		}
		$("#playbar-fullscreen").removeClass("fa-expand").addClass("fa-compress");
	}
}

function updateTime(currentTime) {
	var date = new Date(currentTime * 1000);
	var dateTotal = new Date(currentEpisodeDuration * 1000);
	var progress = 1 / currentEpisodeDuration * currentTime;

	date.setHours(date.getHours() - 1);
	dateTotal.setHours(dateTotal.getHours() - 1);

	var time = "";
	if (date.getHours() > 0) {
		time += date.getHours().pad() + ":";
	}
	time += date.getMinutes().pad() + ":" + date.getSeconds().pad() + "/";
	if (dateTotal.getHours() > 0) {
		time += dateTotal.getHours().pad() + ":";
	}
	time += dateTotal.getMinutes().pad() + ":" + dateTotal.getSeconds().pad();

	if (window.name === "popout" && currentTime > 0) {
		var ev = new window.Event('timeupdate');
		ev.data = { time: currentTime };
		window.dispatchEvent(ev);
	}

	$("#time").html(time);
	if ($("#seekbar").is(":visible")) {
		$("#seekbar div").css("width", $("#seekbar").width() * progress + "px");
		$("#badeball").css("left", $("#seekbar").width() * progress - 10 + "px");
	}
}

function getEpisodeImage(id) {
	var episode = id in episodes ? episodes[id] : tempEpisodes[id];
	if (episode) {
		var cast = casts[episode.castid];

		return episode.feed["media:thumbnail"] ? episode.feed["media:thumbnail"].url : null ||
			episode.feed["itunes:image"] ? episode.feed["itunes:image"].href : null ||
			cast.feed["itunes:image"] ? cast.feed["itunes:image"].href : null ||
			cast.feed.image ? cast.feed.image.url : null;
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
	return $("#" + id)[0];
}

function unix() {
	return $.now() / 1000 | 0;
}

function uniqueName(name) {
	return username + "-" + name;
}

Number.prototype.pad = function() {
	var str = this.toString();
	while (str.length < 2) {
		str = "0" + str;
	}
	return str;
}

if (window.location.host === "castcloud.khlieng.com") {
	$("#demo").show().click(demo);
}

function demo() {
	username = "demo";
	userActions.login("demo", "pass");
}