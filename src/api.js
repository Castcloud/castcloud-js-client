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
					cb(_.indexBy(res.body, "id"));
				}
			});
	},

	addCast: function(feedurl, success, fail) {
		request
			.post(url("library/casts"))
			.type("form")
			.set("Authorization", token)
			.send({ feedurl: feedurl })
			.end(function(res) {
				if (res.ok) {
					success(res.body);
				}
				else {
					fail(feedurl);
				}
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
					var labels = [];
					var root = _.find(res.body, "root");

					_.each(root.content.split(","), function(item) {
						var split = item.split("/");
						var type = split[0];
						var id = split[1];
						
						if (type === "cast") {
							labels.push({
								id: id,
								type: "cast"
							});
						}
						else {
							var label = _.find(res.body, { id: id });
							var casts = [];
							if (label.content) {
								casts = _.map(label.content.split(","), function(item) {
									return item.split("/")[1];
								});
							}
							labels.push({
								id: id,
								type: "label",
								name: label.name,
								expanded: label.expanded,
								casts: casts
							});
						}
					});

					cb(labels);
				}
			});
	},

	addLabel: function(name, success, fail) {
		request
			.post(url("library/labels"))
			.type("form")
			.set("Authorization", token)
			.send({ name: name })
			.end(function(res) {
				if (res.ok) {
					success(res.body);
				}
				else {
					fail(name);
				}
			});
	},

	updateLabel: function(id, data, cb) {
		if (data.casts) {
			data.content = "herp";
			delete data.casts;
		}
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
						_.each(res.body.events, function(event) {
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
					_.each(res.body, function(setting) {
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