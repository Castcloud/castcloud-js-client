var Chromecast = require('./chromecast.js');
var DragDrop = require('./dragdrop.js');
var API = require('./api.js');
require('./jquery-plugins.js');

var userActions = require('./actions/userActions.js');

var Settings = require('./components/Settings.jsx');
var settingsActions = require('./actions/settingsActions.js');
var settingsStore = require('./stores/settingsStore.js');

var DefaultSettings = require('./constants.js').DefaultSettings;

var settings = DefaultSettings;
settingsStore.listen(function(newSettings) {
	settings = newSettings;
	setKeybinds();
});

React.render(<Settings />, document.getElementById("tab-settings"));

var username;
var loggedIn = false;
var root;
var apiRoot;

var episodes = {};
var tempEpisodes = {};
var casts = {};
var labels;
var events = [];
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
var episodeScroll;
var episodeinfoScroll;
var episodeFeedScroll;

var currentEpisodeId = null;
var currentEpisodeDuration;
var selectedEpisodeId = null;
var selectedCastId = null;
var videoLoading = false;
var castHovered = null;
var episodeHovered = null;

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

var buffer = {
	events: []
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
	var router = new Router();

	router.bind("all", function(route, router) {
		if (small) {
			menu.hide();
		}
		positionThumb();
		padCastOverlay();
		$("#overlay-info").hide();
	});

	var path = window.location.pathname;
	root = path.substr(0, path.indexOf("client/") + 7);
	apiRoot = localStorage[uniqueName("apiTarget")] || window.location.protocol + "//" + window.location.host + root.replace("client", "api");
	API.setRoot(apiRoot);
	$("#input-target").val(apiRoot);
	
	if(localStorage.username) {
		username = localStorage.username;
		$("#input-username").val(username);
	}

	$("#podcasts").on("click", ".cast", function() {
		router.navigate("p1", { trigger: true });
	});

	$("#episodes").on("click", ".episode", function() {
		router.navigate("p2", { trigger: true });
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
		$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
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

			playEpisode(id);
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
		$("#vid-container").toggleClass("fs");
		if ($("#vid-container").hasClass("fs")) {
			$("#vid-container").removeClass("thumb");
			$("#playbar").detach().appendTo("#vid-container").show();
		}
		else {
			if (Backbone.history.fragment !== "now-playing") {
				$("#vid-container").addClass("thumb");
			}
			$("#playbar").detach().appendTo("body").show();
			if (timer !== null) {
				clearTimeout(timer);
			}
			$("#overlay-info").velocity("stop").hide();
		}
	});

	var timer = null;
	$("#vid-container").mousemove(function() {
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
			else if ($(this).css("right") == "0px") {
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
		/*if ($("#ep-" + currentEpisodeId + " i").length > 0) {
			$("#ep-" + currentEpisodeId + " i").remove();
		}*/
		$("#vid-container").hide();
		updateEpisodeIndicators();
		updatePrettyOverlay();
	});

	$("#vid").on("canplay", function() {
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

		updateEpisodeIndicators();
		updatePrettyOverlay();
	});

	$("#vid").on("ended", function() {
		pushEvent(Event.EndOfTrack);
		$("#vid-container").hide();
		ended = true;
		updateEpisodeIndicators();
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
		/*$("#vid-container").hide();
		$("#playbar").hide();
		$("#topbar nav").hide();
		$("#userinfo").hide();
		$(".tab").hide();
		$("#main-container").css("bottom", "0px");*/

		sessionStorage.clear();
		window.location.reload();

		//$("#tab-login").show();
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

	$(document).click(function() {
		$(".context-menu").hide();
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
		e.stopPropagation();
		showContextMenu("#cast-context-menu", this, e);
	});

	$("#podcasts").on("contextmenu", ".label", function(e) {
		showContextMenu("#label-context-menu", this, e);
	});

	$("#episodes").on("contextmenu", ".episode", function(e) {
		showContextMenu("#episode-context-menu", this, e);
	});

	$("#podcasts").on("mouseover", ".cast", function() {
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
	});

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

	$("#cast-context-show-all").click(function() {
		showAllEpisodes(contextItemID);
	});

	$("#cast-context-rename").click(function() {
		var name = $("#cast-" + contextItemID + " .name").html();
		$("#cast-" + contextItemID + " .name").html('<input type="text">');
		$(".cast input").focus();
		$(".cast input").val(name);
		$(".cast input").keydown(function(e) {
			if (e.which === 13) {
				var name = $(this).val();
				$(this).parent().html(name);
				API.renameCast(contextItemID, name);
			}
		});
	});

	$("#cast-context-unsub").click(function() {
		$(".cast.selected").each(function() {
			var id = $(this).id();
			$("#cast-" + id).remove();
			API.removeCast(id);
		});
		$("#cast-" + contextItemID).remove();
		API.removeCast(contextItemID, function() {
			loadLabels();
		});
	});

	var prevScrollY;

	$("#cast-context-label").click(function() {
		$("#add-to-label").show();
		prevScrollY = castScroll.y;
		castScroll.scrollTo(0, 0);
	});

	$("#add-to-label").on("click", "p", function() {
		$("#add-to-label").hide();
		var id = $(this).id();
		castScroll.scrollTo(0, prevScrollY);
	});

	$("#label-context-rename").click(function() {
		var name = $("#label-" + contextItemID + " .name span").html();
		$("#label-" + contextItemID + " .name span").html('<input type="text">');
		$(".label input").focus();
		$(".label input").val(name);
		$(".label input").keydown(function(e) {
			if (e.which === 13) {
				var name = $(this).val();
				$(this).parent().html(name);
				API.renameLabel(contextItemID, name);
			}
		});
	});

	$("#label-context-delete").click(function() {
		$("#label-" + contextItemID + " .cast").detach().appendTo("#podcasts");
		$("#label-" + contextItemID).remove();
		setTimeout(function() {
			castScroll.refresh();
		}, 0);
		API.removeLabel(contextItemID);
	});

	$("#episode-context-play").click(function() {
		autoplay = true;
		selectEpisode(contextItemID);
		playEpisode(contextItemID);
	});

	$("#episode-context-reset").click(function() {
		resetPlayback(contextItemID);
	});

	$("#episode-context-delete").click(function() {
		if (!$("#" + contextItemID).hasClass("selected")) {
			deleteEpisode(contextItemID);
		}
		$(".episode.selected").each(function() {
			deleteEpisode($(this).id());
		});
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

	$("#pretty").click(function() {
		if (selectedEpisodeId !== currentEpisodeId) {
			autoplay = true;
			playEpisode(selectedEpisodeId);
		}
		else {
			playPauseToggle();
		}
	});

	$("#pretty img").load(function() {			
		$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
	});

	$("#episode-bar-events").click(function() {
		if (small) {
			$("#events").velocity({ left: "0%" });
		}
		else {
			$("#events").velocity({ left: "66.666666%" });
		}
	});

	$("#episode-bar-play").click(function() {
		if (selectedEpisodeId !== currentEpisodeId) {
			autoplay = true;
			playEpisode(selectedEpisodeId);
		}
		else {
			playPauseToggle();
		}
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

	$("#episodes").on("click", ".episode", function() {
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

	$("#episodes").on("dblclick", ".episode", function() {
		var id = $(this).id();
		autoplay = true;
		playEpisode(id);
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
	});

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

	/*$("#settings-panel").on("click", "#opml", function() {
		API.exportOPML(function(opml) {
			var a = window.document.createElement('a');
			a.href = window.URL.createObjectURL(new Blob([opml], {type: 'text/plain'}));
			a.download = 'casts.opml';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		});	
	});

	$("#settings-panel").on("click", "#import-opml", function() {
		$("#hax").click();
	});

	$("#settings-panel").on("change", "#hax", function(e) {
		var file = e.target.files[0];
		var reader = new FileReader();

		reader.onload = function() {
			API.importOPML(reader.result);
		};

		reader.readAsText(file);
	});*/

	var x = false;
	var o = 0;

	$("#vid-thumb-bar .drag").mousedown(function(e) {
		x = true;
		o = e.pageX - $(".thumb").offset().left;
	});

	episodeinfoScroll = new IScroll('#episodeinfo', {
		mouseWheel: true,
		scrollbars: 'custom',
		keyBindings: true,
		interactiveScrollbars: true,
		click: true
	});

	$(document).on("focus", "input", function() {
		$(this).attr("autocomplete", "off")
			.attr("autocorrect", "off")
			.attr("autocapitalize", "off")
			.attr("spellcheck", "false");
	});
	
	if (localStorage.token) {
		API.setToken(localStorage.token);
		$.ajaxSetup({
			headers: { Authorization: localStorage.token }
		});
		userActions.loginDone(true);
		finishLogin();

		$("#playbar").show();
		$("#topbar nav").show();
		$("#userinfo").show();
	}

	Backbone.history.start({ pushState: true, root: root });
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
						episodeScroll.refresh(); 
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
				if (episodeScroll) {
					setTimeout(function() { episodeFeedScroll.refresh(); }, 0);
				}
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
				//updateStorageUsed();
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
						episodeScroll.refresh(); 
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
			$("#vid-container").addClass("fs");
		}
	});
}

var addingFeed = false;

function addFeed(feedurl) {
	API.addCast(feedurl, function() {
		addingFeed = true;
		loadEpisodes();
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
	renderEvents(id);

	var image = getEpisodeImage(id);
	if (image) {
		$("#pretty img").prop("src", image);
		$("#pretty").show();
		$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
	}
	else {
		$("#pretty").hide();
	}

	selectedEpisodeId = id;

	var episode = id in episodes ? episodes[id] : tempEpisodes[id];

	$("#episode-title, #overlay-info h2").html(episode.feed.title);
	$("#episode-date").html(new Date(episode.feed.pubDate).toLocaleString());
	$("#episode-desc").html(episode.feed.description || " ");
	$("#episode-desc *").removeAttr("style");
	$("#overlay-info h5").html(casts[episode.castid].feed.title);
	$("#episode-bar").show();

	setTimeout(function() { episodeinfoScroll.refresh(); }, 0);

	positionThumb();
}

function selectEpisode(id) {
	selectedEpisodeId = id;
	loadEpisodeInfo(id);
	sessionStorage.selectedepisode = id;
	updatePrettyOverlay();

	if (currentEpisodeId === id) {
		if (paused) {
			$("#episode-bar-play").html("Play");
		}
		else {
			$("#episode-bar-play").html("Pause");
		}
	}
	else {
		$("#episode-bar-play").html("Play");
	}

	$(".episode").removeClass("selected");
	$("#ep-" + id).addClass("selected");
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

			loadEpisodeInfo(id);

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

function deleteEpisode(id) {
	if (id in episodes) {
		$("#ep-" + id).remove();
		pushEvent(Event.Delete, id);

		var count = $("#cast-" + episodes[id].castid + " .n");
		count.html(count.html() - 1);

		delete episodes[contextItemID];
		localforage.setItem("episodes", episodes);
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
	userActions.loginDone.listen(function(loggedIn) {
		if (loggedIn) {
			finishLogin();

			$("#tab-podcasts").velocity("fadeIn");
			$("#playbar").velocity("slideDown");
			$("#topbar nav").velocity("fadeIn");
			$("#userinfo").velocity("fadeIn");
		}
	});

	password.val("");
}

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

function initDB() {
	var render = _.after(4, function() {
		renderCasts();

		var template = _.template($("script.labels").html());
		$("#add-to-label").empty().append(template({ labels: labels }));
		//renderEpisodeFeed();
	});

	var updateLastEvent =_.after(2, function() {
		events.forEach(function(event) {
			if (event.episodeid in episodes && (!episodes[event.episodeid].lastevent || event.clientts > episodes[event.episodeid].lastevent.clientts)) {
				episodes[event.episodeid].lastevent = event;
			}
		});
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
			render();
		}
	});

	localforage.getItem("episodes", function(err, data) {
		if (data) {
			console.log("Episodes loaded");
			episodes = data;

			updateLastEvent();
			render();
		}
	});

	localforage.getItem("events", function(err, data) {
		if (data) {
			console.log("Events loaded");
			events = data;
			
			if (window.name !== "popout") {
				if (localStorage.beforeunloadevent) {
					var ev = JSON.parse(localStorage.beforeunloadevent);
					pushEvent(ev.type, ev.id, ev.time);
					localStorage.removeItem("beforeunloadevent");
				}
				if (localStorage.unloadevent) {
					var ev = JSON.parse(localStorage.unloadevent);
					pushEvent(ev.type, ev.id, ev.time);
					localStorage.removeItem("unloadevent");
				}
			}

			updateLastEvent();
			render();
		}
	});

	localforage.getItem("buffer_events", function(err, data) {
		if (data) {
			buffer.events = data;
		}
	});

	localforage.getItem("buffer_settings", function(err, data) {
		if (data) {
			buffer.settings = data;
		}
	});
}

function sync(onDemand) {
	loadLabels();
	loadEpisodes();
	loadEvents();
	settingsActions.fetch();

	if (buffer.events.length > 0) {
		flushEvents();
	}
	if (_.size(buffer.settings) > 0) {
		flushSettings();
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

	buffer.events.push({
		type: type,
		episodeid: id,
		positionts: time === undefined ? el("vid").currentTime | 0 : time,
		concurrentorder: currentOrder,
		clientts: eventTS				
	});
	localforage.setItem("buffer_events", buffer.events);

	flushEvents();

	if (id in episodes) {
		episodes[id].lastevent = {
			type: type,
			positionts: time === undefined ? el("vid").currentTime | 0 : time,
			clientts: eventTS,
			clientname: null,
			clientdescription: null
		}
	}

	var event = {
		clientdescription: "Best",
		clientname: "Castcloud",
		clientts: eventTS,
		episodeid: id,
		name: Event[type],
		positionts: time === undefined ? el("vid").currentTime | 0 : time,
		type: type
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

	events.unshift(event);

	localforage.setItem("events", events);

	if (id == selectedEpisodeId) {
		renderEvents(id);
	}
}

function flushEvents() {
	API.sendEvents(buffer.events, function() {
		buffer.events = [];
		localforage.removeItem("buffer_events");
	});
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
			if (selectedCastId === null) {
				renderEpisodes(sessionStorage.selectedcast);
			}
			selectedCastId = sessionStorage.selectedcast;
			$("#cast-" + sessionStorage.selectedcast).addClass("selected");
		}
		else if (sessionStorage.lastepisode) {
			var lastepisode = JSON.parse(sessionStorage.lastepisode);
			renderEpisodes(lastepisode.castid);
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
	selectedCastId = id;
	renderEpisodes(id);
	$(".cast").removeClass("selected");
	$("#cast-" + id).addClass("selected");
	sessionStorage.selectedcast = id;
}

function loadEpisodes() {
	API.getNewEpisodes(function(newEpisodes) {
		if (newEpisodes.length > 0) {
			localforage.getItem("episodes", function(err, localEpisodes) {
				localEpisodes = localEpisodes || {};
				newEpisodes.forEach(function(episode) {
					localEpisodes[episode.id] = episode;
				});
				localforage.setItem("episodes", localEpisodes);
			});

			newEpisodes.forEach(function(episode) {
				episodes[episode.id] = episode;
				if (selectedCastId == episode.castid) {
					if ($(".episode").length < 1) {
						$("#episodes").empty();
					}
					$("#episodes").prepend('<div id="ep-' + episode.id + '" class="episode"><span class="name">' + episode.feed.title + '</span><div class="delete">Delete</div></div>');
				}
			});

			updateEpisodeCount();

			if (selectedCastId == newEpisodes[0].castid) {
				setTimeout(function() { episodeScroll.refresh(); }, 0);
			}

			if (addingFeed) {
				loadLabels();
			}
		}
	});
}

function renderEpisodes(id) {
	var e = [];
	for (var x in episodes) {
		if (episodes[x].castid == id) {
			if (!(episodes[x].lastevent && episodes[x].lastevent.type == Event.Delete)) {
				e.push(episodes[x]);
			}
		}
	}

	if (e.length > 0) {
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

		var template = _.template($("script.episodes").html());
		$("#episodes").empty().append(template({ episodes: e }));
		
		updateEpisodeIndicators();

		if (sessionStorage.lastepisode) {
			var lastepisode = JSON.parse(sessionStorage.lastepisode);
			if (lastepisode.id in episodes) {
				playEpisode(lastepisode.id);
			}
			$("#ep-" + lastepisode.id).addClass("selected");
		}
		else if (sessionStorage.selectedepisode) {
			loadEpisodeInfo(sessionStorage.selectedepisode);
			$("#ep-" + sessionStorage.selectedepisode).addClass("selected");
		}
	}
	else {
		$("#episodes").empty().append('<div class="episodes-empty"><h2>There are no episodes left</h2><button id="show-all-episodes" class="button">Show me everything!</button></div>');
	}

	if (episodeScroll) {
		setTimeout(function() { episodeScroll.refresh(); }, 0);
	}
	else {
		episodeScroll = new IScroll('#foo2', {
			mouseWheel: true,
			scrollbars: 'custom',
			keyBindings: true,
			interactiveScrollbars: true,
			click: true
		});
	}
}

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
		tempEpisodes = {};
		episodes.forEach(function(episode) {
			tempEpisodes[episode.id] = episode;
		});

		var template = _.template($("script.episodes").html());
		$("#episodes").empty().append(template({ episodes: episodes }));

		if (episodeScroll) {
			setTimeout(function() { episodeScroll.refresh(); }, 0);
		}
		else {
			episodeScroll = new IScroll('#foo2', {
				mouseWheel: true,
				scrollbars: 'custom',
				keyBindings: true,
				interactiveScrollbars: true,
				click: true
			});
		}
		
		updateEpisodeIndicators();
	});
}

function resetPlayback(id) {
	if (id === currentEpisodeId) {
		seek(0);
	}
	else {
		if (!(id in episodes) && id in tempEpisodes) {
			episodes[id] = tempEpisodes[id]
			delete tempEpisodes[id];
			localforage.setItem("episodes", episodes);
		}
		pushEvent(Event.Pause, id, 0);
		updateEpisodeIndicators();
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

function loadEvents() {
	API.getEvents(function(res) {
		res.forEach(function(event) {
			event.name = Event[event.type];

			if (event.episodeid in episodes && (!episodes[event.episodeid].lastevent || event.clientts > episodes[event.episodeid].lastevent.clientts)) {
				episodes[event.episodeid].lastevent = event;
			}

			events.unshift(event);
		});

		if (res.length > 0) {
			events.sort(function(a, b) {
				if (a.clientts > b.clientts) {
					return -1;
				}
				if (a.clientts < b.clientts) {
					return 1;
				}

				if (a.concurrentorder > b.concurrentorder) {
					return -1;
				}
				if (a.concurrentorder < b.concurrentorder) {
					return 1;
				}
				return 0;
			});

			localforage.setItem("events", events);

			if (selectedEpisodeId !== null) {
				renderEvents(selectedEpisodeId);
			}
		}
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
	pushEvent(Event.Play);
	$(".button-play i").addClass("fa-pause");
	$(".button-play i").removeClass("fa-play");
	updateEpisodeIndicators();
	$("#episode-bar-play").html("Pause");
	updatePrettyOverlay();
}

function pause() {
	if (Chromecast.running()) {
		Chromecast.pause();
	}
	else {
		el("vid").pause();
	}
	paused = true;
	pushEvent(Event.Pause);
	$(".button-play i").addClass("fa-play");
	$(".button-play i").removeClass("fa-pause");
	updateEpisodeIndicators();
	$("#episode-bar-play").html("Play");
	updatePrettyOverlay();
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
			playEpisode(playbackQueue[currentQueuePosition].id);
		}
	}
}

function previousEpisode() {
	console.log("previousEpisode called");
}

function toggleFullscreen() {
	var video = el("vid-container");
	if ($("#vid-container").hasClass("fs")) {
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
	var cast = casts[episode.castid];

	return episode.feed["media:thumbnail"] ? episode.feed["media:thumbnail"].url : null ||
		episode.feed["itunes:image"] ? episode.feed["itunes:image"].href : null ||
		cast.feed["itunes:image"] ? cast.feed["itunes:image"].href : null ||
		cast.feed.image ? cast.feed.image.url : null;
}

function positionThumb() {
	if ($("#episodeinfo").isOverflowing()) {
		$("#vid-container.thumb").css("right", "15px");
	}
	else {
		$("#vid-container.thumb").css("right", "1px");
	}
}

function updateEpisodeIndicators() {
	$(".episode i").remove();
	$(".episode").each(function(index, el) {
		var id = $(el).id();
		var episode = id in episodes ? episodes[id] : tempEpisodes[id];
		if (id === currentEpisodeId && !ended) {
			if (videoLoading) {
				$("#ep-" + id).append('<i class="fa fa-spinner fa-spin"></i>');
			}
			else if (paused) {
				$("#ep-" + id).append('<i class="fa fa-pause"></i>');
			}
			else {
				$("#ep-" + id).append('<i class="fa fa-play"></i>');
			}
		}
		else if (episode.lastevent !== null) {				
			if (episode.lastevent.type >= Event.EndOfTrack) {
				$("#ep-" + id).append('<i class="fa fa-circle progress"></i>');
			}
			else if (episode.lastevent.positionts > 0) {
				$("#ep-" + id).append('<i class="fa fa-circle-o progress"></i>');
			}
		}
	});
}

function updatePrettyOverlay() {
	if (selectedEpisodeId === currentEpisodeId) {
		if (paused) {
			$(".pretty-overlay").show();
			if (videoLoading) {
				$(".pretty-button").removeClass("fa-play-circle-o");
				$(".pretty-button").addClass("fa-spinner fa-spin");
			}
			else {
				$(".pretty-button").removeClass("fa-spinner fa-spin");
				$(".pretty-button").addClass("fa-play-circle-o");
			}
		}
		else {
			$(".pretty-overlay").hide();
		}
	}
	else {
		$(".pretty-overlay").show();
		$(".pretty-button").removeClass("fa-spinner fa-spin");
		$(".pretty-button").addClass("fa-play-circle-o");
	}
}

function popoutMessage(obj) {
	poppedOut.postMessage(JSON.stringify(obj), "*");
}

function padCastOverlay() {
	$("#cast-overlay").css("line-height", $("#cast-overlay").height() + "px");
}

function showContextMenu(id, target, e) {
	contextItemID = $(target).id();

	$(id).css("left", e.pageX + "px");
	$(id).css("top", e.pageY + "px");
	$(".context-menu").hide();
	$(id).show();
	e.preventDefault();
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