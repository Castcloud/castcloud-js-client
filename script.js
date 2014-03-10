var token,
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
			"podcasts/:id": "episode",
			"settings": "settings"
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

		episode: function(id) {
			$(".tab").hide();
			$("#tab-podcasts").show();

			playEpisode(id);
		},

		settings: function() {
			$(".tab").hide();
			$("#tab-settings").show();
		}
	});

	var path = window.location.pathname;
	root = path.substr(0, path.indexOf("client/") + 7);
	apiRoot = root.replace("client", "api");

	loadcss("style.css");

	console.log("root: " + root);
	console.log("apiRoot: " + apiRoot);

	var router = new Router();

	Backbone.history.start({ pushState: true, root: root });

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
		el("vid").webkitRequestFullScreen();
	});

	$("#seekbar").mousedown(function(e) {
		el("vid").currentTime = 1 / window.innerWidth * e.pageX * el("vid").duration;
	});

	$("#button-login").click(function() {
		$(".tab").hide();
		$("#tab-podcasts").fadeIn("fast");
		$("#playbar").slideDown("fast");
		$("#topbar nav").fadeIn("fast");
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

	$.post(apiRoot + "account/login", {
		username: "user",
		password: "pass",
		clientname: "Castcloud",
		clientdescription: "Best",
		clientversion: "1.0",
		uuid: "1881"
	}, function(res) {
		token = res.token;
		loggedIn = true;

		loadCasts();
	});
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
