var allowed = "<a><b><br><del><dd><dl><dt><em><hr><i><li><ol><p><s><strong><strike><ul>";
allowed = allowed.toLowerCase().match(/<[a-z][a-z0-9]*>/g).join('');
var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

NodeList.prototype.forEach = Array.prototype.forEach;
var el = document.createElement("div");

exports.strip = function(input) {
	if (input) {
	    el.innerHTML = input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
	        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	    });
	    el.querySelectorAll("*").forEach(function(node) {
	    	node.removeAttribute("style");
	    });
	    return el.innerHTML;
	}
	return null;
};

exports.UUID = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
};

exports.userAgent = function() {
	var ua = new UAParser().getResult();
	var s = ua.browser.name ? ua.browser.name + ", " : "";
	s += ua.os.name ? ua.os.name + " " + ua.os.version + ", " : "";
	s += ua.device.vendor ? ua.device.vendor + " " + ua.device.model : "";
	if (s.indexOf(" ", s.length - 1) !== -1) {
		s = s.substr(0, s.length - 2);
	}
	return s;
};

exports.unix = function() {
	return $.now() / 1000 | 0;
};

function pad(str, char, len) {
	str += "";
	while (str.length < len) {
		str = char + str;
	}
	return str;
};

exports.formatSeconds = function(seconds) {
	var date = new Date(seconds * 1000);
	date.setHours(date.getHours() - 1);

	var result = "";
	if (date.getHours() > 0) {
		result += pad(date.getHours(), "0", 2) + ":";
	}
	result += pad(date.getMinutes(), "0", 2) + ":" + pad(date.getSeconds(), "0", 2);
	return result;
};

exports.toggleFullscreen = function() {
	var video = document.getElementById("vid-wrap");
	if ($("#vid-wrap").hasClass("fs")) {
		document.webkitExitFullscreen();
		//$("#playbar-fullscreen").removeClass("fa-compress").addClass("fa-expand");
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
		//$("#playbar-fullscreen").removeClass("fa-expand").addClass("fa-compress");
	}
};