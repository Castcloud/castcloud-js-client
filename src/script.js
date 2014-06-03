(function() {
	"use strict";

	var Chromecast = require('./chromecast.js');
	var DragDrop = require('./dragdrop.js');

	var token;
	var username;
	var loggedIn = false;
	var root;
	var apiRoot;

	var db;
	var idbReady = false;
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

	var Setting = {
		Text: 0,
		Bool: 1,
		Keybind: 2
	}

	var DefaultSettings = {
		General: {

		},
		Playback: {
			KeepPlaying: {
				type: Setting.Bool,
				value: true
			},
			PlaybackRate: {
				type: Setting.Text,
				value: 1.0
			}
		},
		Keybinds: {
			PlayPause: {
				type: Setting.Keybind,
				value: 'space'
			},
			Next: {
				type: Setting.Keybind,
				value: 'pageup'
			},
			Previous: {
				type: Setting.Keybind, 
				value: 'pagedown'
			},
			SkipForward: {
				type: Setting.Keybind,
				value: 'right'
			},
			SkipBack: {
				type: Setting.Keybind,
				value: 'left'
			}
		},
		Advanced: {
			SyncInterval: {
				type: Setting.Text,
				value: 10
			}
		},
		__client: {
			ThumbWidth: {
				value: 200,
				clientspecific: true
			}
		}
	};

	var settings = DefaultSettings;

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
		events: [],
		settings: [],
		idb: {}
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

	$(document).ready(function() {
		//DragDrop.init("#podcasts", ".drag");
		//DragDrop.ended(saveLabels);

		var Router = Backbone.Router.extend({
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
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
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
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
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
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
				}
				else {
					$("#tab-settings").show();
					updateStorageUsed();
					$("#vid-container").addClass("thumb");
				}
			},

			foo: function(n) {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
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
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
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

		var router = new Router();

		router.bind("all", function(route, router) {
			positionThumb();
			padCastOverlay();
			$("#overlay-info").hide();
		});

		var path = window.location.pathname;
		root = path.substr(0, path.indexOf("client/") + 7);
		apiRoot = localStorage[uniqueName("apiTarget")] || window.location.protocol + "//" + window.location.host + root.replace("client", "api");
		$("#input-target").val(apiRoot);
		
		if(localStorage.username){
			username = localStorage.username;
			$("#input-username").val(username);
		}

		var page = 0;
		var small = $(".col").css("width") === "100%";
		var prevSmall = false;

		$("#podcast-cols").on("click", ".cast", function() {
			router.navigate("p1", { trigger: true });
		});

		$("#podcast-cols").on("click", ".episode", function() {
			router.navigate("p2", { trigger: true });
		});

		$(window).resize(function() {
			small = window.innerWidth < 600;
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
			}
			else if (prevSmall && !small) {
				$(".col").show();
				$("#podcast-vmenu").show();
				$("#podcast-cols").css("left", "50px");
			}
			$(".pretty-button").css("line-height", $("#pretty img").height() + "px");
			$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
			prevSmall = small;
		});

		$("#navicon").click(function() {
			$("#menu-container").toggle();
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
				$("#playbar").detach().appendTo("#vid-container");
				$("#playbar").show();
			}
			else {
				if (Backbone.history.fragment !== "now-playing") {
					$("#vid-container").addClass("thumb");
				}
				$("#playbar").detach().appendTo("body");
				$("#playbar").show();
				if (timer !== null) {
					clearTimeout(timer);
				}
				$("#overlay-info").stop().hide();
			}
		});

		var timer = null;
		$("#vid-container").mousemove(function() {
			if (!bar) {
				if ($(this).hasClass("fs")) {
					$("#playbar").show();
					$("#overlay-info").fadeIn("fast");
					if (timer !== null) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() { 
						$("#playbar").hide();
						$("#overlay-info").stop().fadeOut("fast");
					}, 1000);
				}
				else if ($(this).css("right") == "0px") {
					$("#overlay-info").fadeIn("fast");
					if (timer !== null) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						$("#overlay-info").stop().fadeOut("fast");
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
					$("#overlay-info").fadeOut("fast");
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
			if ($("#ep-" + currentEpisodeId + " i").length > 0) {
				$("#ep-" + currentEpisodeId + " i").remove();
			}
			$("#vid-container").hide();
			updateEpisodeIndicators();
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
				saveSetting("ThumbWidth", width, "__client");
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
			saveSetting("PlaybackRate", rate, "Playback");
		});

		$("#button-login").click(login);

		$("#input-password").keydown(function(e) {
			if (e.which === 13) {
				login();
			}
		});

		$("#button-logout").click(function() {
			localStorage.removeItem("token");
			$("#vid-container").hide();
			$("#playbar").hide();
			$("#topbar nav").hide();
			$("#userinfo").hide();
			$(".tab").hide();
			$("#tab-login").show();
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
			$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
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
					$.ajax(apiRoot + "library/casts/" + contextItemID, {
						type: "PUT",
						data: {
							name: name
						}
					});
				}
			})
		});

		$("#cast-context-unsub").click(function() {
			$(".cast.selected").each(function() {
				var id = $(this).id();
				$("#cast-" + id).remove();
				$.ajax(apiRoot + "library/casts/" + id, { type: "DELETE" });
			});
			$("#cast-" + contextItemID).remove();
			$.ajax(apiRoot + "library/casts/" + contextItemID, { 
				type: "DELETE",
				success: function(res) {
					loadLabels();
				}
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
					$.ajax(apiRoot + "library/labels/" + contextItemID, {
						type: "PUT",
						data: {
							name: name
						}
					});
				}
			});
		});

		$("#label-context-delete").click(function() {
			$("#label-" + contextItemID + " .cast").detach().appendTo("#podcasts");
			$("#label-" + contextItemID).remove();
			setTimeout(function() {
				castScroll.refresh();
			}, 0);
			$.ajax(apiRoot + "labels/" + contextItemID, {
				type: "DELETE"
			});
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
			$(".pretty-button").css("line-height", $(this).height() + "px");
		});

		$("#episode-bar-events").click(function() {
			$("#events").css("left", "66.666666%");
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
			$("#events").css("left", "100%");
		});

		$("#events").on("click", "div", function() {
			$("#events").css("left", "100%");
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
				$(".cc img").prop("src", "img/cast_on.png");
				Chromecast.start();
				Chromecast.load(episodes[currentEpisodeId].feed.enclosure.url, {
					title: episodes[currentEpisodeId].feed.title,
					description: episodes[currentEpisodeId].feed.description,
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
			var count = $("#cast-" + episodes[id].castid + " .n");
			count.html(parseInt(count.html()) + 1);
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
				$.post(apiRoot + "library/casts.opml", { opml: reader.result });
			};

			reader.readAsText(file);
		});

		$("#settings-panel").on("click", "#opml", function() {
			$.get(apiRoot + "library/casts.opml", function(res) {
				var a = window.document.createElement('a');
				a.href = window.URL.createObjectURL(new Blob([res], {type: 'text/plain'}));
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
				$.post(apiRoot + "library/casts.opml", { opml: reader.result });
			};

			reader.readAsText(file);
		});

		$("#settings-panel").on("click", "#clear-local-data", function() {
			db.clear(function() {
				setTimeout(updateStorageUsed, 1000);
			});
			localStorage.clear();
			sessionStorage.clear();
		});

		$("#settings-panel").on("click", "#reset-settings", resetSettings);

		var settingTimerId;
		$("#tab-settings").on("keyup", ".setting", function() {
			clearTimeout(settingTimerId);
			var id = $(this).prop("id").split("_");
			var val = $(this).val();
			settingTimerId = setTimeout(function() {
				saveSetting(id[1], val, id[0]);
			}, 500);
		});

		$("#tab-settings").on("change", "checkbox.setting", function() {
			var id = $(this).prop("id").split("_");
			var val = $(this).prop("checked");
			saveSetting(id[1], val, id[0]);
		});

		$("#tab-settings").on("keydown", ".keybind", function(e) {
			e.preventDefault();
			e.stopPropagation();
			var s = "";
			if (e.ctrlKey) {
				s += "ctrl+";
			}
			if (e.shiftKey) {
				s += "shift+";
			}
			if (e.altKey) {
				s += "alt+";
			}
			if (e.metaKey) {
				s += "meta+";
			}

			var special = {
				8: 'backspace',
				9: 'tab',
				13: 'enter',
				20: 'capslock',
				27: 'esc',
				32: 'space',
				33: 'pageup',
				34: 'pagedown',
				35: 'end',
				36: 'home',
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
				45: 'ins',
				46: 'del'
			};

			var character = 
		        (e.which > 47 && e.which < 58)   ||
		        (e.which > 64 && e.which < 91)   ||
		        (e.which > 95 && e.which < 112)  ||
		        (e.which > 185 && e.which < 193) ||
		        (e.which > 218 && e.which < 223);

		    if (character) {
		    	var k = String.fromCharCode(e.which).toLowerCase();
		    	s += k;
		    }
		    else if (e.which in special) {
		    	var k = special[e.which];
		    	s += k;
		    }
			
			if (character || e.which in special) {
				$(this).val(s);
			}
			return false;
		});

		var x = false;
		var o = 0;

		$("#vid-thumb-bar .drag").mousedown(function(e) {
			x = true;
			o = e.pageX - $(".thumb").offset().left;
		});

		$("#settings-menu").on("click", "p", function() {
			var id = $(this).id();
			$(".setting-panel").hide();
			$(".setting-button").removeClass("selected");
			$("#setting-"+ id).addClass("selected");
			$("#setting-panel-" + id).show();
		});

		setKeybinds();

		episodeinfoScroll = new IScroll('#episodeinfo', {
			mouseWheel: true,
			scrollbars: 'custom',
			keyBindings: true,
			interactiveScrollbars: true,
			click: true
		});
		
		if (localStorage.token) {
			token = localStorage.token;
			finishLogin();

			$("#playbar").show();
			$("#topbar nav").show();
			$("#userinfo").show();
		}

		Backbone.history.start({ pushState: true, root: root });
	});

	var addingFeed = false;

	function addFeed(feedurl) {
		$.post(apiRoot + "library/casts", { feedurl: feedurl }, function() {
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

		$.post(apiRoot + "library/labels", { name: name }, function() {
			loadLabels();
		});
	}

	function loadEpisodeInfo(id) {
		renderEvents(id);

		var image = getEpisodeImage(id);
		if (image) {
			$("#pretty img").prop("src", image);
			$("#pretty").show();
			$(".pretty-button").css("line-height", $("#pretty img").height() + "px");
			$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
		}
		else {
			$("#pretty").hide();
		}

		selectedEpisodeId = id;

		var episode = id in episodes ? episodes[id] : tempEpisodes[id];

		$("#episode-title, #overlay-info h2").html(episode.feed.title);
		$("#episode-date").html(new Date(episode.feed.pubDate).toLocaleString());
		$("#episode-desc").html(episode.feed.description);
		$("#episode-desc *").removeAttr("style");
		$("#overlay-info h5").html(casts[episode.castid].feed.title);
		$("#episode-bar").show();

		setTimeout(function() { episodeinfoScroll.refresh(); }, 0);

		positionThumb();
	}

	var c = 0;
	var q = [];

	function selectEpisode(id) {
		selectedEpisodeId = id;
		loadEpisodeInfo(id);
		sessionStorage.selectedepisode = id;

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
				db.put("episodes", episodes);
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

				video.playbackRate = settings.Playback.PlaybackRate.value;

				id = episodes[id].castid;

				q = [];
				for (var x in episodes) {
					if (episodes[x].castid == id) {
						if (!(episodes[x].lastevent && episodes[x].lastevent.type == Event.Delete)) {
							q.push(episodes[x]);
							if (x == currentEpisodeId) {
								c = q.length - 1;
							}
						}
					}
				}

				q.sort(function(a, b) {
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
			db.put("episodes", episodes);
		}
	}

	function login() {
		username = $("#input-username").val();
		apiRoot = $("#input-target").val();
		if (apiRoot.indexOf("/", apiRoot.length - 1) === -1) {
			apiRoot += "/";
		}
		
		var _uuid = localStorage.uuid || uuid();

		$.post(apiRoot + "account/login", {
			username: username,
			password: $("#input-password").val(),
			clientname: "Castcloud",
			clientdescription: userAgent(),
			clientversion: "0.1",
			uuid: _uuid
		}, function(res) {
			token = res.token;
			if (token !== undefined) {
				localStorage.token = token;
				localStorage.username = username;
				localStorage.uuid = _uuid;
				localStorage[uniqueName("apiTarget")] = apiRoot;
				
				finishLogin();

				$("#tab-podcasts").fadeIn("fast");
				$("#playbar").slideDown("fast");
				$("#topbar nav").fadeIn("fast");
				$("#userinfo").fadeIn("fast");
			}
		});

		$("#input-password").val("");
	}

	function finishLogin() {
		loggedIn = true;

		$("#userinfo span").html(username);
		$(".tab").hide();
		$("#main-container").css("bottom", "55px");

		if (Backbone.history.fragment !== "now-playing") {
			$("#vid-container").addClass("thumb");
		}

		$.ajaxSetup({
			headers: { Authorization: token }
		});

		initDB();
		sync();
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

		db = new IDBStore({
			storeName: uniqueName("db"),
			keyPath: null
		}, function() {
			idbReady = true;
			console.log("IDB ready");

			db.get("labels", function(data) {
				if (data) {
					console.log("Labels loaded from IDB");
					labels = data;
					render();
				}
			});

			db.get("casts", function(data) {
				if (data) {
					console.log("Casts loaded from IDB");
					casts = data;
					render();
				}
			})

			db.get("episodes", function(data) {
				if (data) {
					console.log("Episodes loaded from IDB");
					episodes = data;

					updateLastEvent();
					render();
				}
			});

			db.get("events", function(data) {
				if (data) {
					console.log("Events loaded from IDB");
					events = data;
					
					if (window.name !== "popout") {
						if (localStorage.beforeunloadevent) {
							var ev = JSON.parse(localStorage.beforeunloadevent);
							console.log("pushing beforeunloadevent");
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("beforeunloadevent");
						}
						if (localStorage.unloadevent) {
							var ev = JSON.parse(localStorage.unloadevent);
							console.log("pushing unloadevent");
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("unloadevent");
						}
					}

					updateLastEvent();
					render();
				}
			});

			db.get("settings", function(data) {
				if (data) {
					console.log("Settings loaded from IDB");
					settings = $.extend(true, {}, DefaultSettings, data);

					$(".thumb").width(settings.__client.ThumbWidth.value);

					setKeybinds();
					renderSettings();
				}
			});

			db.get("buffer_events", function(data) {
				if (data) {
					buffer.events = data;
				}
			});

			db.get("buffer_settings", function(data) {
				if (data) {
					buffer.settings = data;
				}
			});

			for (var key in buffer.idb) {
				db.put(key, buffer.idb[key]);
				console.log("Flushed " + key + " from IDB buffer");
			}
		});
	}

	function sync(onDemand) {
		loadLabels();
		loadEpisodes();
		loadEvents();
		loadSettings();

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

	var lastEventTS = null;
	var currentOrder = 0;

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
		db.put("buffer_events", buffer.events);

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

		db.put("events", events);

		if (id == selectedEpisodeId) {
			renderEvents(id);
		}
	}

	function flushEvents() {
		$.post(apiRoot + "library/events", { json: JSON.stringify(buffer.events) }, function() {
			buffer.events = [];
			db.remove("buffer_events");
		});	
	}

	function loadCasts(tag) {
		var url = apiRoot + (tag === undefined ? "library/casts" : "library/casts/" + tag);
		$.ajax(url, {
			headers: {
				"If-None-Match": localStorage.etag_casts
			},
			type: "GET",
			success: function(res, status, xhr) {
				if (xhr.status === 200) {
					var etag = xhr.getResponseHeader("etag");
					if (etag) {
						localStorage.etag_casts = etag;
					}

					res.forEach(function(cast) {
						casts[cast.id] = cast;
					});

					if (idbReady) {
						db.put("casts", casts);				
					}
					else {
						buffer.idb.casts = casts;
					}

					renderCasts();
				}
			}
		});
	}

	var castsHash;
	var firstCastsRender = true;

	function renderCasts() {
		var hash = "";
		if (!firstCastsRender) {
			hash = md5(JSON.stringify(labels) + JSON.stringify(casts));
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
				$("#cast-" + index + " .n").html(n[index]);
			}

			$(".cast .n").each(function(index, el) {
				if ($(el).html().length < 1) {
					$(el).width(0);
				}
			});

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
					castsHash = md5(JSON.stringify(labels) + JSON.stringify(casts));
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
		if (!localStorage[uniqueName("since")]) {
			localStorage[uniqueName("since")] = 0;
		}
		console.log("fetching episodes since " + localStorage[uniqueName("since")]);
		$.get(apiRoot + "library/newepisodes", { since: localStorage[uniqueName("since")] }, function(res) {
			localStorage[uniqueName("since")] = res.timestamp;
			console.log(res.episodes.length + " episodes fetched");
			if (res.episodes.length > 0) {
				db.get("episodes", function(localEpisodes) {
					localEpisodes = localEpisodes || {};
					res.episodes.forEach(function(episode) {
						localEpisodes[episode.id] = episode;
					});
					db.put("episodes", localEpisodes);
				});

				res.episodes.forEach(function(episode) {
					episodes[episode.id] = episode;
					if (selectedCastId == episode.castid) {
						$("#episodes").prepend('<div id="ep-' + episode.id + '" class="episode">' + episode.feed.title + '<div class="delete">Delete</div></div>');
					}
				});
				if (selectedCastId == res.episodes[0].castid) {
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

	function showAllEpisodes(id) {
		$.get(apiRoot + "library/episodes/" + id, function(res) {
			tempEpisodes = {};
			res.forEach(function(episode) {
				tempEpisodes[episode.id] = episode;
			});

			var template = _.template($("script.episodes").html());
			$("#episodes").empty().append(template({ episodes: res }));

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
				db.put("episodes", episodes);
			}
			pushEvent(Event.Pause, id, 0);
			updateEpisodeIndicators();

			var count = $("#cast-" + episodes[id].castid + " .n");
			count.html(parseInt(count.html()) + 1);
		}
	}

	function loadSettings() {
		var url = apiRoot + "account/settings";
		$.ajax(url, {
			headers: {
				"If-None-Match": localStorage.etag_settings
			},
			type: "GET",
			success: function(res, status, xhr) {
				if (xhr.status === 200) {
					var etag = xhr.getResponseHeader("etag");
					if (etag) {
						localStorage.etag_settings = etag;
					}

					settings = {};
					res.forEach(function(setting) {
						var category = setting.setting.split("/")[0];
						var name = setting.setting.split("/")[1];
						if (name === undefined) {
							name = category;
							category = "General";
						}
						if (settings[category] === undefined) {
							settings[category] = {};
						}
						settings[category][name] = {
							value: setting.value,
							clientspecific: setting.clientspecific
						};
					});

					settings = $.extend(true, {}, DefaultSettings, settings);

					setKeybinds();
					renderSettings();

					if (idbReady) {
						db.put("settings", settings);
					}
					else {
						buffer.idb.settings = settings;
					}
				}
			}
		});
	}

	var settingsHash;
	var firstSettingsRender = true;

	function renderSettings(forceRender) {
		var hash = "";
		if (forceRender === undefined && !firstSettingsRender) {
			hash = md5(JSON.stringify(settings));
		}
		if (forceRender || hash !== settingsHash) {
			settingsHash = hash;

			$("#settings-menu").empty();
			$("#settings-panel").empty();
			for (var c in settings) {
				$("#settings-menu").append('<p class="setting-button" id="setting-' + c + '">' + c + '</p>');
				var panel = $('<div class="setting-panel" id="setting-panel-' + c + '"><h2>' + c + "</h2></div>");

				if (c === "General") {
					panel.append('<h3>OPML</h3><p><button class="button" id="import-opml">Import</button><input type="file" id="hax" style="display:none">' +
						'<button class="button" id="opml">Export</button></p>' +
						'<h3>Local data<span class="used"></span></h3><button class="button" id="clear-local-data">Clear</button>' +
						'<h3>Default settings</h3><button class="button" id="reset-settings">Reset</button>');
					updateStorageUsed();
				}

				for (var s in settings[c]) {
					var id = c + "_" + s;
					var setting = settings[c][s];
					if (setting.type === Setting.Keybind) {
						panel.append("<p><label>" + s + '</label><input type="text" id="' + id + '" class="setting keybind" value="' + setting.value + '"></p>');
					}
					else if (setting.type === Setting.Bool) {
						panel.append("<p><label>" + s + '</label><input type="checkbox" id="' + id + '" class="setting"></p>');
						panel.find("#" + id).prop("checked", String(setting.value) == "true");
					}
					else {
						panel.append("<p><label>" + s + '</label><input type="text" id="' + id + '" class="setting" value="' + setting.value + '"></p>');
					}
				}

				$("#settings-panel").append(panel);
			}
			$("#setting-General").addClass("selected");
			$("#setting-panel-General").show();

			if (firstSettingsRender) {
				firstSettingsRender = false;
				setTimeout(function() {
					settingsHash = md5(JSON.stringify(settings));
				}, 0);
			}
		}
	}

	function saveSetting(key, value, category) {
		category = category || 'General';
		settings[category][key].value = value;
		settingsHash = md5(JSON.stringify(settings));
		buffer.settings.push({
			setting: category + "/" + key,
			value: value,
			clientspecific: settings[category][key].clientspecific
		});
		db.put("buffer_settings", buffer.settings);
		flushSettings();
		db.put("settings", settings);

		if (category === "Keybinds") {
			setKeybinds();		
		}
	}

	function flushSettings() {
		$.post(apiRoot + "account/settings", { json: JSON.stringify(buffer.settings) }, function() {
			buffer.settings = [];
			db.remove("buffer_settings");
		});
	}

	function resetSettings() {
		settings = DefaultSettings;
		for (var c in settings) {
			for (var s in settings[c]) {
				buffer.settings.push({
					setting: c + "/" + s,
					value: settings[c][s].value,
					clientspecific: settings[c][s].clientspecific
				});
			}
		}
		db.put("buffer_settings", buffer.settings);
		flushSettings();
		db.put("settings", settings);

		renderSettings(true);
		setKeybinds();
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
		var url = apiRoot + "library/labels";
		$.ajax(url, {
			type: "GET",
			headers: {
				//"If-None-Match": localStorage.etag_labels
			},
			success: function(res, status, xhr) {
				if (xhr.status === 200) {
					var etag = xhr.getResponseHeader("etag");
					if (etag) {
						localStorage.etag_labels = etag;
					}

					labels = {};
					res.forEach(function(label) {
						if (label.name === "root") {
							rootLabelId = label.id;
						}
						labels[label.name] = [];
						if (label.content) {
							label.content.split(",").forEach(function(item) {
								var split = item.split("/");
								labels[label.name].push({
									type: split[0],
									id: parseInt(split[1])
								});
							});
						}
						labels[label.id] = {
							name: label.name,
							expanded: label.expanded
						};
					});

					var template = _.template($("script.labels").html());
					$("#add-to-label").empty().append(template({ labels: labels }));

					/*labels = [];
					res.forEach(function(label) {
						if (label.name === "root") {
							rootLabelId = label.id;
							label.content.split(",").forEach(function(item) {
								var split = item.split("/");
								labels.push({
									type: split[0],
									id: parseInt(split[1])
								});
							});
						}
					});
					res.forEach(function(label) {
						if (label.name !== "root") {
							labels.forEach(function(item) {
								if (item.id == label.id && item.type == "label") {
									item.name = label.name;
									item.content = [];
									item.expanded = label.expanded;
									if (label.content) {
										label.content.split(",").forEach(function(cast) {
											item.content.push(cast.split("/")[1]);
										});
									}
								}
							});
						}
					});
					console.log(labels);*/

					if (idbReady) {
						db.put("labels", labels);
					}
					else {
						buffer.idb.labels = labels;
					}
					loadCasts();
				}
			},
			error: function() {
				loadCasts();
			}
		});
	}

	function saveLabels() {
		var content = [];
		$("#podcasts > div").each(function(index, el) {
			content.push($(el).prop("id").replace("-", "/"));
		});

		$.ajax(apiRoot + "library/labels/" + rootLabelId, {
			type: "PUT",
			data: {
				content: content.join()
			}
		});

		$("#podcasts .label").each(function(index, el) {
			content = [];
			$(el).find(".cast").each(function(index, el) {
				content.push($(el).prop("id").replace("-", "/"));
			});

			$.ajax(apiRoot + "library/labels/" + $(el).id(), {
				type: "PUT",
				data: {
					content: content.join(),
					expanded: $(el).find(".content").is(":visible")
				}
			});
		});
	}

	function loadEvents() {
		if (!localStorage[uniqueName("since-events")]) {
			localStorage[uniqueName("since-events")] = 0;
		}
		console.log("fetching events since " + localStorage[uniqueName("since-events")]);
		$.get(apiRoot + "library/events", { since: localStorage[uniqueName("since-events")], exclude_self: true }, function(res) {
			localStorage[uniqueName("since-events")] = res.timestamp;
			res.events.forEach(function(event) {
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
				event.name = Event[event.type];

				if (event.episodeid in episodes && (!episodes[event.episodeid].lastevent || event.clientts > episodes[event.episodeid].lastevent.clientts)) {
					episodes[event.episodeid].lastevent = event;
				}

				events.unshift(event);
			});

			if (res.events.length > 0) {
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

				if (idbReady) {
					db.put("events", events);
				}
				else {
					buffer.idb.events = events;
				}

				if (selectedEpisodeId !== null) {
					renderEvents(selectedEpisodeId);
				}
			}
			console.log(res.events.length + " events fetched");
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

	var paused = false;
	var ended = false;

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
		$(".pretty-overlay").hide();
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
		$(".pretty-overlay").show();
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
			c++;
			if (c < q.length) {
				autoplay = true;
				playEpisode(q[c].id);
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
			//$("#seekbar").css("right", ($("#playbar").width() - $("#time").position().left) + "px");
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
		return $("#" + id).get(0);
	}

	function unix() {
		return $.now() / 1000 | 0;
	}

	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}

	function uniqueName(name) {
		return username + "-" + name;
	}

	function userAgent() {
		var ua = new UAParser().getResult();
		var s = ua.browser.name ? ua.browser.name + ", " : "";
		s += ua.os.name ? ua.os.name + " " + ua.os.version + ", " : "";
		s += ua.device.vendor ? ua.device.vendor + " " + ua.device.model : "";
		if (s.indexOf(" ", s.length - 1) !== -1) {
			s = s.substr(0, s.length - 2);
		}
		return s;
	}

	Number.prototype.pad = function() {
		var str = this.toString();
		while (str.length < 2) {
			str = "0" + str;
		}
		return str;
	}

	$.fn.isOverflowing = function() {
	    var el = $(this).get(0);
	    var overflowing = false;
	    if (el.clientHeight < el.scrollHeight) {
	        overflowing = true;
	    }
	    return overflowing;
	}

	$.fn.id = function() {
		return this.prop("id").split("-")[1];
	}
}());