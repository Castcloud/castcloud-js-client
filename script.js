var token,
	username,
	episodes = {},
	casts = {},
	root,
	apiRoot,
	loggedIn = false,
	contextCastId,
	currentEpisodeId = null,
	videoLoading = false;

var Event = {
	Start: 10,
	Pause: 20,
	Play: 30,
	SleepStart: 40,
	SleepEnd: 50,
	EndOfTrack: 60,
	Delete: 70
}

$(document).ready(function() {
	var Router = Backbone.Router.extend({
		routes: {
			"": "podcasts",
			"podcasts": "podcasts",
			"settings": "settings",
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
			}
		},

		settings: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-settings").show();
			}
		},

		foo: function(n) {
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
		}
	});

	var path = window.location.pathname;
	root = path.substr(0, path.indexOf("client/") + 7);
	apiRoot = root.replace("client", "api");

	var router = new Router();

	var page = 0;
	var small = $(".col").css("width") == "100%";
	var prevSmall = false;

	$(".col").click(function() {
		if ($(this).index() < $(".col").length - 1) {
			router.navigate("p" + ($(this).index() + 1), { trigger: true });
		}
	});

	$(window).resize(function() {
		small = window.innerWidth < 600;
		if (!prevSmall && small) {
			$(".col").hide();
			$(".col:eq(" + page + ")").show();
			if (page == 2) {
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

	$("#vid").on("timeupdate", function() {
		var video = el("vid");
		var date = new Date(video.currentTime * 1000);
		var dateTotal = new Date(video.duration * 1000);
		var progress = 1 / video.duration * video.currentTime;

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
		$("#seekbar div").css("width", $("#seekbar").width() * progress + "px")
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

	$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
		$("#vid-container").toggleClass("fs");
		if ($("#vid-container").hasClass("fs")) {
			$("#playbar").show();
		}
		else {
			if (timer != null) {
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
			if (timer != null) {
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
			if (timer != null) {
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
		if (currentEpisodeId != null) {
			if (!el("vid").paused) {
				pushEvent(Event.Play);
			}
		}
	});

	$(window).on("unload", function() {
		if (currentEpisodeId != null) {
			if (!el("vid").paused) {
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

	$("#vid").on("canplay", function() {
		var lastevent = episodes[currentEpisodeId].lastevent;
		if (lastevent != null && videoLoading) {
			videoLoading = false;
			el("vid").currentTime = lastevent.positionts;

			if (lastevent.type == Event.Pause) {
				el("vid").pause();
			}
		}
	});

	$("#vid").on("play", function() {
		pushEvent(Event.Play);
		$(".button-play i").addClass("fa-pause");
		$(".button-play i").removeClass("fa-play");
	});

	$("#vid").on("pause", function() {
		pushEvent(Event.Pause);
		$(".button-play i").addClass("fa-play");
		$(".button-play i").removeClass("fa-pause");
	});

	var seeking = false;
	$("#seekbar").mousedown(function(e) {
		pushEvent(Event.Pause);
		el("vid").currentTime = 1 / $("#seekbar").width() * (e.pageX - 170) * el("vid").duration;
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
		if (e.which == 13) {
			login();
		}
	});

	$("#button-logout").click(function() {
		$.removeCookie("token");
		$("#playbar").hide();
		$("#topbar nav").hide();
		$("#userinfo").hide();
		$(".tab").hide();
		$("#tab-login").show();
	});

	$("#vmenu-add").click(function() {
		$("#input-vmenu-add").toggle();
		$("#button-vmenu-add").toggle();
		$("#input-vmenu-add").focus();
	});

	$("#button-vmenu-add").click(function() {
		addFeed($("#input-vmenu-add").val());
		$("#input-vmenu-add").val("");
		$("#input-vmenu-add").toggle();
		$("#button-vmenu-add").toggle();
	});

	$("#input-vmenu-add").keydown(function(e) {
		if (e.which == 13) {
			addFeed($("#input-vmenu-add").val());
			$("#input-vmenu-add").val("");
			$("#input-vmenu-add").toggle();
			$("#button-vmenu-add").toggle();
		}
	});

	$("#login-container").css("padding-top", window.innerHeight / 2 - 150 + "px");
	$(window).resize(function() {
		$("#login-container").css("padding-top", window.innerHeight / 2 - 150 + "px");
	});

	$(document).click(function() {
		$("#cast-context-menu").hide();
	});

	$("#volume").mousemove(function(e) {
		var width = window.innerWidth - e.pageX - 200;
		var height = 40 / 150 * width;
		el("vid").volume = width / 150;
		$("#volume-top").css("border-left-width", width+"px");
		$("#volume-top").css("border-top-width", height+"px");
	});

	$("#cast-context-unsub").click(function() {
		$.ajax(apiRoot + "library/casts/" + contextCastId, { 
			type: "DELETE",
			headers: { 
				Authorization: token 
			}, 
			success: function(res) {
				loadCasts();
			}
		});
	});
	
	if ($.cookie("token") != null) {
		token = $.cookie("token");
		finishLogin();

		$("#userinfo span").html($.cookie("username"));

		$("#playbar").show();
		$("#topbar nav").show();
		$("#userinfo").show();
	}

	Backbone.history.start({ pushState: true, root: root });
});

function addFeed(feedurl) {
	$.ajax(apiRoot + "library/casts", { 
		type: "POST",
		data: { 
			feedurl: feedurl 
		}, 
		headers: { 
			Authorization: token 
		}, 
		success: function(res) {
			loadCasts();
		}
	});
}

function playEpisode(id) {
	if (currentEpisodeId != null) {
		if (!el("vid").paused) {
			console.log("!");
			pushEvent(Event.Play);
		}
	}

	currentEpisodeId = id;

	var video = el("vid");
	video.setAttribute("src", episodes[id].feed.enclosure.url);
	video.load();
	videoLoading = true;

	$("#vid").show();
	$("#episode-title, #overlay-info h2").html(episodes[id].feed.title);
	$("#episode-date").html(new Date(episodes[id].feed.pubDate).toLocaleString());
	$("#episode-desc").html(episodes[id].feed.description);
	$("#overlay-info h5").html(casts[episodes[id].castid].feed.title);
}

function playPauseToggle() {
	var video = el("vid");
	if (video.paused) {
		video.play();
	}
	else {
		video.pause();
	}
}

function login() {
	var username = $("#input-username").val();
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
		if (token != null) {
			$.cookie("token", token);
			$.cookie("username", username);
			
			finishLogin();

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

	$(".tab").hide();

	loadCasts();
	loadSettings();
}

var lastEventTS = null;
var currentOrder = 0;

function pushEvent(type) {
	eventTS = unix();
	if (lastEventTS == eventTS) {
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

	$.ajax(apiRoot + "library/events", { 
		type: "POST",
		data: { 
			json: [{
				type: type,
				itemid: currentEpisodeId,
				positionts: el("vid").currentTime | 0,
				concurrentorder: currentOrder,
				clientts: eventTS				
			}]
		}, 
		headers: { 
			Authorization: token 
		}
	});

	$.cookie("episode-" + currentEpisodeId, el("vid").duration, { expires: 1});
}

function loadCasts() {
	get("library/casts", function(res) {
		var template = _.template($("script.podcasts").html());
		$("#podcasts").empty().append(template({ casts: res }));

		if ($.cookie("selectedcast") != null) {
			loadEpisodes($.cookie("selectedcast"));
		}

		res.forEach(function(cast) {
			casts[cast.id] = cast;

			$("#cast-" + cast.id).click(function() {
				$.cookie("selectedcast", cast.id);
				loadEpisodes(cast.id);
			});
		});

		$(".cast").on("contextmenu", function(e) {
			contextCastId = $(this).prop("id").split("-")[1];

			$("#cast-context-menu").css("left", e.pageX + "px");
			$("#cast-context-menu").css("top", e.pageY + "px");
			$("#cast-context-menu").show();
			e.preventDefault();
		});
	});
}

function loadEpisodes(id) {
	get("library/episodes/" + id, function(res) {
		var template = _.template($("script.episodes").html());
		$("#episodes").empty().append(template({ episodes: res }));

		res.forEach(function(episode) {
			$("#ep-" + episode.id).click(function() {
				$.cookie("lastepisode", episode.id);
				playEpisode(episode.id);
			});
			episodes[episode.id] = episode;
			if (episode.lastevent != null && $.cookie("episode-" + episode.id) != null) {
				$("#ep-" + episode.id + " .bar").css("width", (episode.lastevent.positionts / $.cookie("episode-" + episode.id) * 100)+"%");
			}
		});

		if ($.cookie("lastepisode") != null) {
			playEpisode($.cookie("lastepisode"));
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
			if (name == null) {
				name = category;
				category = "General";
			}
			if (settings[category] == null) {
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

function get(url, cb) {
	$.ajax(apiRoot + url, { headers: { Authorization: token }, success: cb});
}

function post(url, cb) {
	$.ajax(apiRoot + url, { type: "POST", headers: { Authorization: token }, success: cb});
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