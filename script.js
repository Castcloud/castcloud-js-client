var token,
	episodes = {},
	root = "/castcloud/client/";

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
			$("#tab-podcasts").show();
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

	$.post("/castcloud/api/account/login", {
		username: "user",
		password: "pass",
		clientname: "Castcloud",
		clientdescription: "Best",
		clientversion: "1.0",
		uuid: "1881"
	}, function(res) {
		token = res.token;

		get("/castcloud/api/library/casts", function(res) {
			res.forEach(function(cast) {
				var cc = cast.castcloud;
				$("#podcasts").append('<div id="cast-' + cc.id + '" class="cast">' + cast.title + "</div>");
				$("#cast-" + cc.id).click(function() {
					get("/castcloud/api/library/episodes/" + cc.id, function(res) {
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
		});
	});
});

function playEpisode(id) {
	var video = el("vid");
	video.setAttribute("src", episodes[id].enclosure.url);
	video.load();

	$("#vid").show();
	$("#episode-title").html(episodes[id].title);
	$("#episode-desc").html(episodes[id].description);
}

function get(url, cb) {
	$.ajax(url, { headers: { Authorization: token }, success: cb});
}

function post(url, cb) {
	$.ajax(url, { headers: { Authorization: token }, success: cb});
}

function el(id) {
	return $("#" + id).get(0);
}

Number.prototype.pad = function() {
	var str = this.toString();
	while (str.length < 2) {
		str = "0" + str;
	}
	return str;
}