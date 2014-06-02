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

module.exports = {
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
		if (currentMedia) {
			var seek = new chrome.cast.media.SeekRequest();
			seek.currentTime = timestamp;
			currentMedia.seek(seek, null, null);
		}
	},

	mute: function(muted) {
		if (currentMedia) {
			var req = new chrome.cast.media.VolumeRequest(new chrome.cast.Volume(null, muted));
			currentMedia.setVolume(req, null, null);
		}
	},

	volume: function(vol) {
		if (currentMedia) {
			var req = new chrome.cast.media.VolumeRequest(new chrome.cast.Volume(vol, null));
			currentMedia.setVolume(req, null, null);
		}
	},

	timeUpdate: function(callback) {
		timeUpdateCallbacks.push(callback);
	},

	receiverName: function() {
		return session.receiver.friendlyName;
	}
};