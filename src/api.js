var request = require("superagent");

var root;
var token;

function url(path) {
	return root + path;
}

function UUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
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

var API = {
	login: function(username, password, cb) {
		var uuid = localStorage.uuid || UUID();

		request
			.post(url("account/login"))
			.type("form")
			.send({
				username: username,
				password: password,
				clientname: "Castcloud",
				clientdescription: userAgent(),
				clientversion: "0.1",
				uuid: uuid
			})
			.end(function(res) {
				if (res.ok) {
					token = res.body.token;
					$.ajaxSetup({
						headers: { Authorization: token }
					});
					cb(true);

					localStorage.token = token;
					localStorage.username = username;
					localStorage.uuid = uuid;
					localStorage[username + "-apiTarget"] = root;
				}
				else {
					cb(false);
				}
			});
	},

	getCasts: function(cb) {
		request
			.get(url("library/casts"))
			.set("Authorization", token)
			.end(function(res) {
				if (res.ok) {
					var casts = {};
					res.body.forEach(function(cast) {
						casts[cast.id] = cast;
					});
					cb(casts);
				}					
			});
	},

	addCast: function(feedurl, cb) {
		request
			.post(url("library/casts"))
			.type("form")
			.set("Authorization", token)
			.send({ feedurl: feedurl })
			.end(function(res) {
				cb();
			});
	},

	renameCast: function(id, name, cb) {
		request
			.put(url("library/casts/" + id))
			.type("form")
			.set("Authorization", token)
			.send({ name: name })
			.end(function(res) {
				cb();
			});
	},

	removeCast: function(id, cb) {
		request
			.del(url("library/casts/" + id))
			.set("Authorization", token)
			.end(function(res) {
				cb();
			});
	},

	exportOPML: function(cb) {
		request
			.get(url("library/casts.opml"))
			.set("Authorization", token)
			.end(function(res) {
				cb(res.body);
			});
	},

	importOPML: function(opml, cb) {
		request
			.post(url("library/casts.opml"))
			.type("form")
			.set("Authorization", token)
			.send({ opml: opml })
			.end(function(res) {
				cb();
			});
	},

	getLabels: function(cb) {
		request
			.get(url("library/labels"))
			.set("Authorization", token)
			.end(function(res) {
				if (res.ok) {
					var rootLabelId;
					var labels = {};
					res.body.forEach(function(label) {
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

					cb(labels);
				}
			});
	},

	addLabel: function(name, cb) {
		request
			.post(url("library/labels"))
			.type("form")
			.set("Authorization", token)
			.send({ name: name })
			.end(function(res) {
				cb();
			});
	},

	updateLabel: function(id, data, cb) {
		request
			.put(url("library/labels/" + id))
			.type("form")
			.set("Authorization", token)
			.send(data)
			.end(function(res) {
				cb();
			});
	},

	renameLabel: function(id, name, cb) {
		updateLabel(id, { name: name }, cb);
	},

	removeLabel: function(id, cb) {
		request
			.del(url("library/labels/" + id))
			.set("Authorization", token)
			.end(function(res) {
				cb();
			});
	},

	getNewEpisodes: function(cb) {
		localforage.getItem("since_episodes", function(err, since) {
			var since = since || 0;
			
			request
				.get(url("library/newepisodes"))
				.set("Authorization", token)
				.query({ since: since })
				.end(function(res) {
					if (res.ok) {
						localforage.setItem("since_episodes", res.body.timestamp);
						cb(res.body.episodes);
					}
				});
		});
		
	},

	getEpisodes: function(castid, cb) {
		request
			.get(url("library/episodes/" + castid))
			.set("Authorization", token)
			.end(function(res) {
				cb(res.body);
			});
	},

	getEvents: function(cb) {
		localforage.getItem("since_events", function(err, since) {
			var since = since || 0;
			
			request
				.get(url("library/events"))
				.set("Authorization", token)
				.query({
					since: since,
					exclude_self: true
				})
				.end(function(res) {
					if (res.ok) {
						localforage.setItem("since_events", res.body.timestamp);
						res.body.events.forEach(function(event) {
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
						cb(res.body.events);
					}
				});
		});
	},

	sendEvents: function(events, cb) {
		request
			.post(url("library/events"))
			.type("form")
			.set("Authorization", token)
			.send({ json: JSON.stringify(events) })
			.end(function(res) {
				cb();
			});
	},

	getSettings: function(cb) {
		request
			.get(url("account/settings"))
			.set("Authorization", token)
			.end(function(res) {
				if (res.ok) {
					var settings = {};
					res.body.forEach(function(setting) {
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

					cb(settings);
				}
			});
	},

	saveSettings: function(settings, cb) {
		request
			.post(url("account/settings"))
			.type("form")
			.set("Authorization", token)
			.send({ json: JSON.stringify(settings) })
			.end(function(res) {
				cb();
			});
	},

	setRoot: function(_root) {
		root = _root;
	},

	setToken: function(_token) {
		token = _token;
	}
};

module.exports = API;