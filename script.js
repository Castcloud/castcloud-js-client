//
// chromecast.js
//
var Chromecast = (function() {
	"use strict";

	var appID,
		available = false,
		session = null,
		currentMedia = null,
		loadedCallbacks = [],
		sessionCallbacks = [],
		receiverCallbacks = [],
		timeUpdateCallbacks = [],
		loadThis = null;

	function initCastApi() {
		//chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
		var sessionRequest = new chrome.cast.SessionRequest(appID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
		chrome.cast.initialize(apiConfig, onInitSuccess, onError);
	}

	function onInitSuccess() {
		console.log("Google Cast init success");
	}

	function onError() {
		console.log("Google Cast init error");
	}

	function receiverListener(e) {
		if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
			console.log("Receiver available");
			receiverCallbacks.forEach(function(cb) { cb(1); });
		}
		else {
			console.log("No receivers available");
			receiverCallbacks.forEach(function(cb) { cb(0); });
		}
	}

	function sessionListener(e) {
		console.log("Session found");
		session = e;
		sessionCallbacks.forEach(function(cb) { cb() });

		if (session.media.length !== 0) {
			onMediaDiscovered("onRequestSessionSuccess", session.media[0]);
		}
	}

	function onMediaError(e) {
		console.log("onMediaError" + JSON.stringify(e));
	}

	function onMediaDiscovered(how, media) {
		console.log("onMediaDiscovered");
		currentMedia = media;

		updateTime();
	
		if (how !== "onRequestSessionSuccess") {
			loadedCallbacks.forEach(function(cb) { cb() });			
		}
	}

	function onLaunchError(e) {
		console.log("onLaunchError called: " + JSON.stringify(e));
	}

	function onRequestSessionSuccess(e) {
		console.log("session request success");
		session = e;
		sessionCallbacks.forEach(function(cb) { cb() });

		if (loadThis) {
			load(loadThis.url, loadThis.data);
		}
	}

	function onStopSuccess(e) {
		console.log("Session stop success");
	}

	function onStopError(e) {
		console.log("Session stop error");
	}

	function load(url, data) {
		var mediaInfo = new chrome.cast.media.MediaInfo(url);
		mediaInfo.contentType = "video/mp4";
		mediaInfo.metadata = data;

		var request = new chrome.cast.media.LoadRequest(mediaInfo);
		session.loadMedia(request, onMediaDiscovered.bind(this, "loadMedia"), onMediaError);
	}
		
	window["__onGCastApiAvailable"] = function(loaded, errorInfo) {
		if (loaded) {
			available = true;
			console.log("Google Cast loaded");
			if (appID) {
				initCastApi();
			}
		}
		else {
			console.log(errorInfo);
		}
	}

	var id;

	function updateTime() {
		timeUpdateCallbacks.forEach(function(cb) {
			if (currentMedia) {
				cb(currentMedia.getEstimatedTime());
			}
		});

		id = setTimeout(function() { 
			updateTime();
		}, 100);
	}

	return {
		init: function(_appID) {
			appID = _appID;
			if (available) {
				initCastApi();
			}
		},

		start: function() {
			chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
		},

		stop: function() {
			if (session) {
				clearTimeout(id);
				session.stop(onStopSuccess, onStopError);
				session = null;
			}
		},

		session: function(callback) {
			sessionCallbacks.push(callback);
		},

		receiver: function(callback) {
			receiverCallbacks.push(callback);
		},

		running: function() {
			return session !== null;
		},

		load: function(url, data) {
			if (session) {
				load(url, data);
			}
			else {
				loadThis = {
					url: url,
					data: data
				}
				console.log("Loading media after session is available if needed");
			}
		},

		mediaLoaded: function(callback) {
			loadedCallbacks.push(callback);
		},

		play: function() {
			if (currentMedia) {
				currentMedia.play(new chrome.cast.media.PlayRequest(), null, null);
			}
		},

		pause: function() {
			if (currentMedia) {
				currentMedia.pause(new chrome.cast.media.PauseRequest(), null, null);
			}
		},

		seek: function(timestamp) {
			var seek = new chrome.cast.media.SeekRequest();
			seek.currentTime = timestamp;
			currentMedia.seek(seek, null, null);
		},

		timeUpdate: function(callback) {
			timeUpdateCallbacks.push(callback);
		},

		receiverName: function() {
			return session.receiver.friendlyName;
		}
	}
}());

var DragDropMonster = (function() {
	var parent, children;
	var offsetX = 0, offsetY = 0;
	var el, prevY, y;
	var before;
	var placeholder;
	var dragging;

	$(document).on("mousemove", function(e) {
		$(".dragging").css("left", e.pageX - offsetX);
		$(".dragging").css("top", e.pageY - offsetY);

		placeholder(e);

		console.log(el.prop("id"));			
	});

	function placeholder(e) {
		before = true;
		if (e.pageY - offsetY - 1 < $(parent + " " + children).first().offset().top) {
			el = $(parent + " " + children).first();
			y = el.offset().top;
		}
		else if (e.pageY - offsetY > $(parent + " " + children).last().offset().top + $(parent + " " + children).last().height()) {
			el = $(parent + " " + children).last();
			before = false;
			y = el.offset().top + el.height();
		}
		else {
			el = $(document.elementFromPoint(70, e.pageY - offsetY - 1));
			y = el.offset().top;
			if (e.pageY - offsetY > el.offset().top + el.height() / 2) {
				before = false;
				y += el.height();
			}
		}

		if (dragging && y !== prevY) {
			$(".dragging-placeholder").remove();
			if (before) {
				$('<div class="dragging-placeholder"></div>').insertBefore(el);
			}
			else {
				$('<div class="dragging-placeholder"></div>').insertAfter(el);
			}
		}
		prevY = y;
	}

	$(document).on("mouseup", ".dragging", function() {
		$(".dragging").css("left", "auto");
		$(".dragging").css("top", "auto");
		$(this).removeClass("dragging");
		dragging = false;

		$(".dragging-placeholder").remove();
		if (before) {
			$(this).insertBefore(el);
		}
		else {
			$(this).insertAfter(el);
		}
		console.log("DRAG_END");
	});

	return function(_parent, _children) {
		parent = _parent;
		children = _children;

		$(parent).on("mousedown", children, function(e) {
			var w = $(this).width();
			$(this).addClass("dragging").css("width", w + "px");
			$(this).css("left", $(this).offset().left);
			$(this).css("top", $(this).offset().top);
			$(this).detach().appendTo("body");

			offsetX = e.pageX - $(this).offset().left;
			offsetY = e.pageY - $(this).offset().top;
			dragging = true;

			placeholder(e);
		});
	}
}());

//
// script.js
//
(function() {
	"use strict";

	var token,
		username,
		episodes = {},
		casts = {},
		root,
		apiRoot,
		loggedIn = false,
		contextItemId,
		currentEpisodeId = null,
		selectedEpisodeId = null,
		videoLoading = false,
		castHovered = null,
		ctrlDown = false,
		autoplay = false,
		switchingTabs = false;

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
	}
	
	var custom = true;
	var styledReceiver = "17DC56DD";
	var customReceiver = "3EC703A8";

	Chromecast.init(custom ? customReceiver : styledReceiver);
	Chromecast.session(function() {
		$(".cc img").prop("src", "cast_on.png");
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

	$(document).ready(function() {
		//DragDropMonster("#podcasts", ".cast");

		var Router = Backbone.Router.extend({
			routes: {
				"": "podcasts",
				"podcasts": "podcasts",
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

			settings: function() {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
				}
				else {
					$("#vid-container").addClass("thumb");
					$("#tab-settings").show();
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
				$("#vid-container").removeClass("thumb");
				$("#vid-container").addClass("fs");
			}
		});

		var path = window.location.pathname;
		root = path.substr(0, path.indexOf("client/") + 7);
		apiRoot = root.replace("client", "api");

		$("#input-target").val(apiRoot);

		var router = new Router();

		router.bind("all", function(route, router) {
			positionThumb();
			padCastOverlay();
		});

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

		function updateTime(currentTime) {
			var video = el("vid");
			var date = new Date(currentTime * 1000);
			var dateTotal = new Date(video.duration * 1000);
			var progress = 1 / video.duration * currentTime;

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

			$("#time").html(time);
			$("#seekbar div").css("width", $("#seekbar").width() * progress + "px");
		}

		$("#vid").on("timeupdate", function() {
			var video = el("vid");
			updateTime(video.currentTime);
		});

		var currentTime;
		Chromecast.timeUpdate(function(time) {
			updateTime(time);
			currentTime = time;
			//el("vid").currentTime = time;
		});

		$("#vid").click(function() {
			playPauseToggle();
		});

		$("#vid").dblclick(function() {
			var video = el("vid-container");
			if ($("#vid-container").hasClass("fs")) {
				document.webkitExitFullscreen();
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
			}
		});

		$("#vid-thumb-bar .popout").click(function() {
			var video = el("vid");
			if (paused) {
				pushEvent(Event.Play);
			}
			video.setAttribute("src", "#");
			video.load();

			var poppedOut = window.open(root + "fullscreen");
			$(poppedOut).on("beforeunload", function() {
				currentEpisodeId = null;

				// Possibly store lastevent in sessionstorage instead of this hack
				setTimeout(function() { loadEpisodes(JSON.parse(sessionStorage.lastepisode).castid); }, 500);
			});
		});

		$("#vid-thumb-bar .minimize").click(function() {
			$("#vid-container").toggleClass("minimized");
		});

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
		$("#vid").mousemove(function() {
			if ($(this).parent().hasClass("fs")) {
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
		});

		$("#playbar").mouseover(function() {
			if ($(this).parent().hasClass("fs")) {
				if (timer !== null) {
					clearTimeout(timer);
				}
			}
		});

		$("#playbar").mouseout(function() {
			if ($(this).parent().hasClass("fs")) {
				timer = setTimeout(function() {
					$("#playbar").hide();
					$("#overlay-info").fadeOut("fast");
				}, 1000);
			}
		});

		$(window).on("beforeunload", function() {
			if (currentEpisodeId !== null) {
				if (!paused) {
					pushEvent(Event.Play);
				}
			}
		});

		$(window).on("unload", function() {
			if (currentEpisodeId !== null) {
				if (!paused) {
					pushEvent(Event.Play);
				}
			}
		});

		$(".button-skipback").click(function() {
			var video = el("vid");
			pushEvent(Event.Pause);
			video.currentTime = video.currentTime - 15;
			pushEvent(Event.Play);
			if (video.paused) {
				pushEvent(Event.Pause);
			}
		});

		$(".button-play").click(function() {
			playPauseToggle();
		});

		$(".button-skipforward").click(function() {
			var video = el("vid");
			pushEvent(Event.Pause);
			video.currentTime = video.currentTime + 15;
			pushEvent(Event.Play);
			if (video.paused) {
				pushEvent(Event.Pause);
			}
		});

		$("#vid").on("loadstart", function() {
			$("#ep-" + currentEpisodeId).append('<i class="fa fa-spinner fa-spin"></i>');
		});

		$("#vid").on("canplay", function() {
			var lastevent = episodes[currentEpisodeId].lastevent;
			if (lastevent !== null && videoLoading) {
				el("vid").currentTime = lastevent.positionts;

				if (lastevent.type == Event.Play) {
					play();
				}
				else {
					pause();
				}
			}
			if (autoplay && videoLoading) {
				autoplay = false;
				play();
			}
			videoLoading = false;

			$("#ep-" + currentEpisodeId + " i").remove();
			if (paused) {
				$("#ep-" + currentEpisodeId).append('<i class="fa fa-pause"></i>');
			}
			else {
				$("#ep-" + currentEpisodeId).append('<i class="fa fa-play"></i>');
			}
		});

		$("#vid").on("ended", function() {
			pushEvent(Event.EndOfTrack);
		});

		var seeking = false;
		$("#seekbar").mousedown(function(e) {
			pushEvent(Event.Pause);
			el("vid").currentTime = 1 / $("#seekbar").width() * (e.pageX - 170) * el("vid").duration;
			Chromecast.seek(1 / $("#seekbar").width() * (e.pageX - 170) * el("vid").duration);
			seeking = true;
		});

		$(document).mouseup(function() {
			if (seeking) {
				seeking = false;
				pushEvent(Event.Play);
				if (el("vid").paused) {
					pushEvent(Event.Pause);
				}
			}
		});

		$(document).mousemove(function(e) {
			if (seeking) {
				var video = el("vid");
				video.currentTime = 1 / $("#seekbar").width() * (e.pageX - 170) * video.duration;
				Chromecast.seek(1 / $("#seekbar").width() * (e.pageX - 170) * video.duration);
				var progress = 1 / video.duration * video.currentTime;
				$("#seekbar div").css("width", $("#seekbar").width() * progress + "px")
			}
		});

		$("#playbar-gear").click(function() {
			$("#playbar-gear-menu").toggle();
		});

		$(".playback-rate").click(function() {
			$(".playback-rate").removeClass("selected");
			$(this).addClass("selected");
			el("vid").playbackRate = $(this).attr("rate");
		});

		$("#button-login").click(login);

		$("#input-password").keydown(function(e) {
			if (e.which === 13) {
				login();
			}
		});

		$("#button-logout").click(function() {
			sessionStorage.removeItem("token");
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
		});

		$("#button-vmenu-add").click(function() {
			addFeed($("#input-vmenu-add").val());
		});

		$("#input-vmenu-add").keydown(function(e) {
			if (e.which === 13) {
				addFeed($("#input-vmenu-add").val());
			}
		});

		var searchTimerId;
		$("#input-vmenu-add").keyup(function(e) {
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
					}
				});
			}, 100);
		});

		$("#vmenu-add-results").on("click", "p", function() {
			addFeed($(this).attr("feed-url"));
			$(this).parent().empty();
		});

		$("#vmenu-tags").click(function() {
			var prev = $(".vmenu-toggle:visible");
			$("#tags").toggle();
			prev.hide();
		});

		$("#vmenu-sync").click(function() {
			loadCasts();
			$("#tags button").removeClass("selected");
		});

		$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2 - 60) + "px");
		positionThumb();
		$(window).resize(function() {
			$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
			positionThumb();
		});

		$("#input-username").focus(function() {
			$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
		});

		$(document).click(function() {
			$(".context-menu").hide();
		});

		$("#volume").mousemove(function(e) {
			var width = window.innerWidth - e.pageX - 200;
			var height = 40 / 150 * width;
			el("vid").volume = width / 150;
			$("#volume-top").css("border-left-width", width+"px");
			$("#volume-top").css("border-top-width", height+"px");
		});

		$("#podcasts").on("contextmenu", ".cast", function(e) {
			showContextMenu("#cast-context-menu", this, e);
		});

		$("#episodes").on("contextmenu", ".episode", function(e) {
			showContextMenu("#episode-context-menu", this, e);
		});

		$("#podcasts").on("mouseover", ".cast", function() {
			castHovered = $(this).prop("id").split("-")[1];
		});

		$("#podcasts").on("mouseout", ".cast", function() {
			castHovered = null;
		});

		$(document).keydown(function(e) {
			if (e.which === 179) {
				playPauseToggle();
			}

			if (!(e.ctrlKey || e.metaKey)) {
				return;
			}

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
		});

		$(document).keyup(function(e) {
			ctrlDown = false;
		});

		$("#cast-context-rename").click(function() {
			var name = $("#cast-" + contextItemId).html();
			$("#cast-" + contextItemId).html('<input type="text">');
			$(".cast input").focus();
			$(".cast input").val(name);
			$(".cast input").keydown(function(e) {
				if (e.which === 13) {
					var name = $(this).val();
					$(this).parent().html(name);
					$.post(apiRoot + "library/casts/" + contextItemId, { name: name });
				}
			})
		});

		$("#cast-context-unsub").click(function() {
			$(".cast.selected").each(function() {
				$.ajax(apiRoot + "library/casts/" + $(this).prop("id").split("-")[1], { type: "DELETE" });
			});
			$.ajax(apiRoot + "library/casts/" + contextItemId, { 
				type: "DELETE",
				success: function(res) {
					loadCasts();
				}
			});
		});

		$("#episode-context-delete").click(function() {
			console.log("DELETE: " + contextItemId);
		});

		$("#input-target").keyup(function(e) {
			var url = $(this).val();
			if (url.indexOf("/", url.length - 1) === -1) {
				url += "/";
			}
			$.ajax(url + "account/ping", { 
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
				playEpisode(selectedEpisodeId);
			}
			else {
				playPauseToggle();
			}
		});

		$("#episode-bar-events").click(function() {
			$("#events").slideToggle("fast");
		});

		$("#episode-bar-play").click(function() {
			playPauseToggle();
		});

		$("#events").on("click", "div", function() {
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
				$(".cc img").prop("src", "cast_off.png");
				Chromecast.stop();
				$("#cast-overlay").hide();
				el("vid").currentTime = currentTime;
				play();
			}
			else {
				$(".cc img").prop("src", "cast_on.png");
				Chromecast.start();
				Chromecast.load(episodes[currentEpisodeId].feed.enclosure.url, {
					title: episodes[currentEpisodeId].feed.title,
					description: episodes[currentEpisodeId].feed.description,
					image: getEpisodeImage(currentEpisodeId)
				});				
			}
		});
		
		if (sessionStorage.token) {
			token = sessionStorage.token;
			username = sessionStorage.username;
			finishLogin();

			$("#playbar").show();
			$("#topbar nav").show();
			$("#userinfo").show();
		}

		Backbone.history.start({ pushState: true, root: root });
	});

	function addFeed(feedurl) {
		$.post(apiRoot + "library/casts", { feedurl: feedurl }, function() { loadCasts(); });

		$("#input-vmenu-add").val("");
		$("#input-vmenu-add").toggle();
		$("#button-vmenu-add").toggle();
		$("#vmenu-add-results").toggle();
	}

	function loadEpisodeInfo(id) {
		$.get(apiRoot + "library/events", { itemid: id, limit: 10 }, function(res) {
			var template = _.template($("script.events").html());
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
			});
			res.events.eventName = function(e) {
				return Event[e];
			}
			$("#events").empty().append(template({ events: res.events }));
		});

		var image = getEpisodeImage(id);
		if (image) {
			$("#pretty").prop("src", image);
			$("#pretty").show();
		}
		else {
			$("#pretty").hide();
		}

		selectedEpisodeId = id;

		$("#episode-title, #overlay-info h2").html(episodes[id].feed.title);
		$("#episode-date").html(new Date(episodes[id].feed.pubDate).toLocaleString());
		$("#episode-desc").html(episodes[id].feed.description);
		$("#overlay-info h5").html(casts[episodes[id].castid].feed.title);

		positionThumb();
	}

	function playEpisode(id) {
		if (currentEpisodeId !== id) {
			if (currentEpisodeId !== null) {
				if (!el("vid").paused) {
					pushEvent(Event.Play);
				}
			}

			loadEpisodeInfo(id);

			$(".episode i").remove();

			currentEpisodeId = id;

			if (episodes[id].lastevent === null) {
				pushEvent(Event.Start);
			}

			Chromecast.load(episodes[id].feed.enclosure.url, {
				title: episodes[id].feed.title,
				description: episodes[id].feed.description,
				image: getEpisodeImage(id)
			});

			var video = el("vid");
			video.setAttribute("src", episodes[id].feed.enclosure.url);
			video.load();
			videoLoading = true;

			$("#vid-container").show();
			$("#vid-container").removeClass("minimized");

			$(".episode").removeClass("current");
			$("#ep-" + id).addClass("current");
		}
	}

	var paused = false;

	function playPauseToggle() {
		if (paused) {
			play();
		}
		else {
			pause();
		}
	}

	function login() {
		username = $("#input-username").val();
		$.post(apiRoot + "account/login", {
			username: username,
			password: $("#input-password").val(),
			clientname: "Castcloud",
			clientdescription: "Best",
			clientversion: "1.0",
			uuid: "1881"
		}, function(res) {
			token = res.token;
			console.log(token);
			if (token !== undefined) {
				sessionStorage.token = token;
				sessionStorage.username = username;
				
				finishLogin();

				$("#vid-container").show();
				$("#tab-podcasts").fadeIn("fast");
				$("#playbar").slideDown("fast");
				$("#topbar nav").fadeIn("fast");
				$("#userinfo").fadeIn("fast");
			}
		});

		$("#input-username").val("");
		$("#input-password").val("");
	}

	function finishLogin() {
		loggedIn = true;

		$("#userinfo span").html(username);

		$.ajaxSetup({
			headers: { Authorization: token }
		});

		$(".tab").hide();
		$("#main-container").css("bottom", "60px");

		if (Backbone.history.fragment !== "now-playing") {
			$("#vid-container").addClass("thumb");
		}

		loadCasts();
		loadSettings();
		//loadTags();
	}

	var lastEventTS = null;
	var currentOrder = 0;

	function pushEvent(type) {
		var eventTS = unix();
		if (lastEventTS === eventTS) {
			currentOrder++;
		}
		else {
			currentOrder = 0;
		}
		lastEventTS = eventTS;

		episodes[currentEpisodeId].lastevent = {
			type: type,
			positionts: el("vid").currentTime | 0,
			clientts: eventTS,
			clientname: null,
			clientdescription: null
		}

		$.post(apiRoot + "library/events", { json: [{
			type: type,
			itemid: currentEpisodeId,
			positionts: el("vid").currentTime | 0,
			concurrentorder: currentOrder,
			clientts: eventTS				
		}] });

		localStorage.setItem("episode-" + currentEpisodeId, el("vid").duration);
	}

	function loadCasts(tag) {
		get(tag === undefined ? "library/casts" : "library/casts/" + tag, function(res) {
			var template = _.template($("script.podcasts").html());
			$("#podcasts").empty().append(template({ casts: res }));
			positionThumb();

			$(".label .name").click(function() {
				$(this).parent().find(".content").toggle();
				if ($(this).find("i").hasClass("fa-angle-down")) {
					$(this).find("i").removeClass("fa-angle-down");
					$(this).find("i").addClass("fa-angle-up");
				}
				else {
					$(this).find("i").removeClass("fa-angle-up");
					$(this).find("i").addClass("fa-angle-down");
				}
			});

			if (sessionStorage.lastepisode) {
				var lastepisode = JSON.parse(sessionStorage.lastepisode);
				loadEpisodes(lastepisode.castid);
			}
			if (sessionStorage.selectedcast) {
				loadEpisodes(sessionStorage.selectedcast);
				$("#cast-" + sessionStorage.selectedcast).addClass("current");
			}

			res.forEach(function(cast) {
				casts[cast.id] = cast;

				$("#cast-" + cast.id).click(function() {
					if (ctrlDown) {
						$(this).toggleClass("selected");
					}
					else {
						switchingTabs = true;
						loadEpisodes(cast.id);
						sessionStorage.selectedcast = cast.id;

						$(".cast").removeClass("current");
						$(this).addClass("current");
					}
				});
			});
		});
	}

	function loadEpisodes(id) {
		get("library/episodes/" + id, function(res) {
			var template = _.template($("script.episodes").html());
			$("#episodes").empty().append(template({ episodes: res }));
			positionThumb();

			res.forEach(function(episode) {
				$("#ep-" + episode.id).click(function() {
					if (ctrlDown) {
						$(this).toggleClass("selected");
						$(this).children(".bar").toggle();
					}
					else {
						selectedEpisodeId = episode.id;
						loadEpisodeInfo(episode.id);
					}
				});

				$("#ep-" + episode.id).dblclick(function() {
					sessionStorage.lastepisode = JSON.stringify({ id: episode.id, castid: episode.castid });
					autoplay = true;
					playEpisode(episode.id);
				});

				episodes[episode.id] = episode;
				if (episode.lastevent !== null && localStorage.getItem("episode-" + episode.id) !== null) {
					$("#ep-" + episode.id + " .bar").css("width", (episode.lastevent.positionts / localStorage.getItem("episode-" + episode.id) * 100)+"%");
				}

				if (switchingTabs && episode.id == currentEpisodeId) {
					switchingTabs = false;
					if (episode.lastevent.type == Event.Pause) {
						$("#ep-" + episode.id).append('<i class="fa fa-pause"></i>');
					}
					else {
						$("#ep-" + episode.id).append('<i class="fa fa-play"></i>');
					}
				}
			});

			if (sessionStorage.lastepisode) {
				var lastepisode = JSON.parse(sessionStorage.lastepisode);
				playEpisode(lastepisode.id);
				$("#ep-" + lastepisode.id).addClass("current");
			}

			$(".episode").mouseover(function() {
				$(this).children(".bar").css("background", "#0099cc");
			});

			$(".episode").mouseout(function() {
				$(this).children(".bar").css("background", "#333");
			});
		});
	}

	function loadSettings() {
		get("account/settings", function(res) {
			var settings = {};
			res.forEach(function(setting) {
				var category = setting.setting.split("/")[0];
				var name = setting.setting.split("/")[1];
				if (name === null) {
					name = category;
					category = "General";
				}
				if (settings[category] === null) {
					settings[category] = {};
				}
				settings[category][name] = setting.value;
			});
			for (var c in settings) {
				$("#tab-settings").append($("<h2>").text(c));
				for (var s in settings[c]) {
					$("#tab-settings").append("<p><label>" + s + '</label><input type="text" value="' + settings[c][s] + '"></p>');
				}
			}
		});
	}

	function loadTags() {
		get("library/tags", function(res) {
			res.forEach(function(tag) {
				$("#tags").append('<button class="button">' + tag + '</button>');
			});

			$("#tags button").click(function() {
				if ($(this).hasClass("selected")) {
					loadCasts();
					$("#tags button").removeClass("selected");
				}
				else {
					loadCasts($(this).text());
					$("#tags button").removeClass("selected");
					$(this).addClass("selected");
				}
			});
		});
	}

	function play() {
		if (Chromecast.running()) {
			Chromecast.play();
		}
		else {
			el("vid").play();
		}
		paused = false;
		pushEvent(Event.Play);
		$(".button-play i").addClass("fa-pause");
		$(".button-play i").removeClass("fa-play");
		$("#ep-" + currentEpisodeId + " i").removeClass("fa-pause");
		$("#ep-" + currentEpisodeId + " i").addClass("fa-play");
		$("#episode-bar-play").html("Pause");
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
		$("#ep-" + currentEpisodeId + " i").removeClass("fa-play");
		$("#ep-" + currentEpisodeId + " i").addClass("fa-pause");
		$("#episode-bar-play").html("Play");
	}

	function getEpisodeImage(id) {
		return episodes[id].feed["media:thumbnail"] ? episodes[id].feed["media:thumbnail"].url : null ||
			episodes[id].feed["itunes:image"] ? episodes[id].feed["itunes:image"].href : null ||
			casts[episodes[id].castid].feed["itunes:image"] ? casts[episodes[id].castid].feed["itunes:image"].href : null ||
			casts[episodes[id].castid].feed.image ? casts[episodes[id].castid].feed.image.url : null;
	}

	function positionThumb() {
		if ($("#main-container").isOverflowing()) {
			$("#vid-container.thumb").css("right", "15px");
		}
		else {
			$("#vid-container.thumb").css("right", "0px");
		}
	}

	function padCastOverlay() {
		$("#cast-overlay").css("line-height", $("#cast-overlay").height() + "px");
	}

	function showContextMenu(id, target, e) {
		contextItemId = $(target).prop("id").split("-")[1];

		$(id).css("left", e.pageX + "px");
		$(id).css("top", e.pageY + "px");
		$(".context-menu").hide();
		$(id).show();
		e.preventDefault();
	}

	function get(url, cb) {
		$.get(apiRoot + url, cb);
	}

	function el(id) {
		return $("#" + id).get(0);
	}

	function unix() {
		return $.now() / 1000 | 0;
	}

	Number.prototype.pad = function() {
		var str = this.toString();
		while (str.length < 2) {
			str = "0" + str;
		}
		return str;
	}

	Number.prototype.eventName = function() {
		return Event[this];
	}

	$.fn.isOverflowing = function() {
	    var $el = $(this).get(0);
	    var overflowing = false; 
	    if (($el.clientHeight < $el.scrollHeight) || ($el.clientWidth < $el.scrollWidth)) {
	        overflowing = true;
	    }
	    return overflowing;
	}
}());
