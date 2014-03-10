var token,
	username,
	episodes = {},
	root,
	apiRoot,
	loggedIn = false,
	contextCastId = 0;

$(document).ready(function() {
	var Router = Backbone.Router.extend({
		routes: {
			"": "podcasts",
			"podcasts": "podcasts",
			"settings": "settings",
			"*any": "podcasts"
		},

		podcasts: function() {
			$(".tab").hide();
			if (!loggedIn) {
				$("#tab-login").show();
			}
			else {
				$("#tab-podcasts").show();
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
		}
	});

	var path = window.location.pathname;
	root = path.substr(0, path.indexOf("client/") + 7);
	apiRoot = root.replace("client", "api");

	loadcss("style.css");

	var router = new Router();

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

		$("#playbar h1").html(date.getMinutes().pad() + ":" + date.getSeconds().pad() + " / " +
			dateTotal.getMinutes().pad() + ":" + dateTotal.getSeconds().pad());
		$("#seekbar div").css("width", window.innerWidth * progress + "px")
	});

	$("#vid").click(function() {
		var video = el("vid");
		if (video.paused) {
			video.play();
		}
		else {
			video.pause();
		}
	});

	$("#vid").dblclick(function() {
		var video = el("vid");
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.msRequestFullscreen){
			video.msRequestFullscreen();
		} else if (video.mozRequestFullScreen){
			video.mozRequestFullScreen();
		} else if (video.webkitRequestFullscreen){
			video.webkitRequestFullscreen();
		}
	});

	$("#seekbar").mousedown(function(e) {
		el("vid").currentTime = 1 / window.innerWidth * e.pageX * el("vid").duration;
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

		//$("#tab-podcasts").show();
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
			console.log(res.status);

			loadCasts();
		}
	});
}

function playEpisode(id) {
	var video = el("vid");
	video.setAttribute("src", episodes[id].enclosure.url);
	video.load();

	$("#vid").show();
	$("#episode-title").html(episodes[id].title);
	$("#episode-desc").html(episodes[id].description);
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

function loadCasts() {
	$("#podcasts").html("");
	get("library/casts", function(res) {
		res.forEach(function(cast) {
			var cc = cast.castcloud;
			$("#podcasts").append('<div id="cast-' + cc.id + '" class="cast">' + cast.title + "</div>");
			$("#cast-" + cc.id).click(function() {
				get("library/episodes/" + cc.id, function(res) {
					$("#episodes").html("");
					res.forEach(function(episode) {
						if (episode.title == null) episode.title = "N/A";
						$("#episodes").append('<div id="ep-' + episode.castcloud.id + '" class="cast">' + episode.title + "</div>");
						$("#ep-" + episode.castcloud.id).click(function() {
							playEpisode(episode.castcloud.id);
						});

						episodes[episode.castcloud.id] = episode;
					});
				});
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

function loadSettings() {
	get("account/settings", function(res) {
		var settings = {};
		for (var key in res) {
			var category = key.split("/")[0];
			var setting = key.split("/")[1];
			if (settings[category] == null) {
				settings[category] = {};
			}
			settings[category][setting] = res[key];
			
		}
		for (var c in settings) {
			$("#tab-settings").append("<h2>" + c + "</h2>");
			for (var s in settings[c]) {
				$("#tab-settings").append("<p><label>" + s + "</label><input type=\"text\"></p>");
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

function loadcss(filename) {
	$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', root + filename));
}

Number.prototype.pad = function() {
	var str = this.toString();
	while (str.length < 2) {
		str = "0" + str;
	}
	return str;
}
