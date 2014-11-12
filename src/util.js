exports.UUID = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}

exports.userAgent = function() {
	var ua = new UAParser().getResult();
	var s = ua.browser.name ? ua.browser.name + ", " : "";
	s += ua.os.name ? ua.os.name + " " + ua.os.version + ", " : "";
	s += ua.device.vendor ? ua.device.vendor + " " + ua.device.model : "";
	if (s.indexOf(" ", s.length - 1) !== -1) {
		s = s.substr(0, s.length - 2);
	}
	return s;
}