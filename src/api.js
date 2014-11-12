var request = require("superagent");
var util = require('./util.js');

var DefaultSettings = require('./settings.js').DefaultSettings;

var root;
var token;

function url(path) {
	return root + path;
}

var buffer = {
	events: [],
	settings: []
};

var API = {
	login: function(username, password, cb) {
		var uuid = localStorage.uuid || util.UUID();

		request
			.post(url("account/login"))
			.type("form")
			.send({
				username: username,
				password: password,
				clientname: "Castcloud",
				clientdescription: util.userAgent(),
				clientversion: "0.1",
				uuid: uuid
			})
			.end(function(res) {
				if (res.ok) {
					token = res.body.token;
					$.ajaxSetup({
						headers: { Authorization: token }
					});
					cb(true, username);

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
				cb(res.text);
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

	sendEvent: function(event, cb) {
		buffer.events.push(event);

		localforage.setItem("buffer_events", buffer.events);

		request
			.post(url("library/events"))
			.type("form")
			.set("Authorization", token)
			.send({ json: JSON.stringify(buffer.events) })
			.end(function(res) {
				if (res.ok) {
					buffer.events = [];
					localforage.removeItem("buffer_events");
				}
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

	saveSetting: function(name, value, category, cb) {
		category = category || "General";

		buffer.settings.push({
			setting: category + "/" + name,
			value: value,
			clientspecific: DefaultSettings[category][name].clientspecific || false
		});

		localforage.setItem("buffer_settings", buffer.settings);

		request
			.post(url("account/settings"))
			.type("form")
			.set("Authorization", token)
			.send({ json: JSON.stringify(buffer.settings) })
			.end(function(res) {
				if (res.ok) {
					buffer.settings = [];
					localforage.removeItem("buffer_settings");
				}
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
