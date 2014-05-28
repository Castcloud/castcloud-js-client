// MD5
(function(){var e=function(e,t){var o=e[0],u=e[1],a=e[2],f=e[3];o=n(o,u,a,f,t[0],7,-680876936);f=n(f,o,u,a,t[1],12,-389564586);a=n(a,f,o,u,t[2],17,606105819);u=n(u,a,f,o,t[3],22,-1044525330);o=n(o,u,a,f,t[4],7,-176418897);f=n(f,o,u,a,t[5],12,1200080426);a=n(a,f,o,u,t[6],17,-1473231341);u=n(u,a,f,o,t[7],22,-45705983);o=n(o,u,a,f,t[8],7,1770035416);f=n(f,o,u,a,t[9],12,-1958414417);a=n(a,f,o,u,t[10],17,-42063);u=n(u,a,f,o,t[11],22,-1990404162);o=n(o,u,a,f,t[12],7,1804603682);f=n(f,o,u,a,t[13],12,-40341101);a=n(a,f,o,u,t[14],17,-1502002290);u=n(u,a,f,o,t[15],22,1236535329);o=r(o,u,a,f,t[1],5,-165796510);f=r(f,o,u,a,t[6],9,-1069501632);a=r(a,f,o,u,t[11],14,643717713);u=r(u,a,f,o,t[0],20,-373897302);o=r(o,u,a,f,t[5],5,-701558691);f=r(f,o,u,a,t[10],9,38016083);a=r(a,f,o,u,t[15],14,-660478335);u=r(u,a,f,o,t[4],20,-405537848);o=r(o,u,a,f,t[9],5,568446438);f=r(f,o,u,a,t[14],9,-1019803690);a=r(a,f,o,u,t[3],14,-187363961);u=r(u,a,f,o,t[8],20,1163531501);o=r(o,u,a,f,t[13],5,-1444681467);f=r(f,o,u,a,t[2],9,-51403784);a=r(a,f,o,u,t[7],14,1735328473);u=r(u,a,f,o,t[12],20,-1926607734);o=i(o,u,a,f,t[5],4,-378558);f=i(f,o,u,a,t[8],11,-2022574463);a=i(a,f,o,u,t[11],16,1839030562);u=i(u,a,f,o,t[14],23,-35309556);o=i(o,u,a,f,t[1],4,-1530992060);f=i(f,o,u,a,t[4],11,1272893353);a=i(a,f,o,u,t[7],16,-155497632);u=i(u,a,f,o,t[10],23,-1094730640);o=i(o,u,a,f,t[13],4,681279174);f=i(f,o,u,a,t[0],11,-358537222);a=i(a,f,o,u,t[3],16,-722521979);u=i(u,a,f,o,t[6],23,76029189);o=i(o,u,a,f,t[9],4,-640364487);f=i(f,o,u,a,t[12],11,-421815835);a=i(a,f,o,u,t[15],16,530742520);u=i(u,a,f,o,t[2],23,-995338651);o=s(o,u,a,f,t[0],6,-198630844);f=s(f,o,u,a,t[7],10,1126891415);a=s(a,f,o,u,t[14],15,-1416354905);u=s(u,a,f,o,t[5],21,-57434055);o=s(o,u,a,f,t[12],6,1700485571);f=s(f,o,u,a,t[3],10,-1894986606);a=s(a,f,o,u,t[10],15,-1051523);u=s(u,a,f,o,t[1],21,-2054922799);o=s(o,u,a,f,t[8],6,1873313359);f=s(f,o,u,a,t[15],10,-30611744);a=s(a,f,o,u,t[6],15,-1560198380);u=s(u,a,f,o,t[13],21,1309151649);o=s(o,u,a,f,t[4],6,-145523070);f=s(f,o,u,a,t[11],10,-1120210379);a=s(a,f,o,u,t[2],15,718787259);u=s(u,a,f,o,t[9],21,-343485551);e[0]=c(o,e[0]);e[1]=c(u,e[1]);e[2]=c(a,e[2]);e[3]=c(f,e[3])};var t=function(e,t,n,r,i,s){t=c(c(t,e),c(r,s));return c(t<<i|t>>>32-i,n)};var n=function(e,n,r,i,s,o,u){return t(n&r|~n&i,e,n,s,o,u)};var r=function(e,n,r,i,s,o,u){return t(n&i|r&~i,e,n,s,o,u)};var i=function(e,n,r,i,s,o,u){return t(n^r^i,e,n,s,o,u)};var s=function(e,n,r,i,s,o,u){return t(r^(n|~i),e,n,s,o,u)};var o=function(t){txt="";var n=t.length,r=[1732584193,-271733879,-1732584194,271733878],i;for(i=64;i<=t.length;i+=64){e(r,u(t.substring(i-64,i)))}t=t.substring(i-64);var s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(i=0;i<t.length;i++)s[i>>2]|=t.charCodeAt(i)<<(i%4<<3);s[i>>2]|=128<<(i%4<<3);if(i>55){e(r,s);for(i=0;i<16;i++)s[i]=0}s[14]=n*8;e(r,s);return r};var u=function(e){var t=[],n;for(n=0;n<64;n+=4){t[n>>2]=e.charCodeAt(n)+(e.charCodeAt(n+1)<<8)+(e.charCodeAt(n+2)<<16)+(e.charCodeAt(n+3)<<24)}return t};var a="0123456789abcdef".split("");var f=function(e){var t="",n=0;for(;n<4;n++)t+=a[e>>n*8+4&15]+a[e>>n*8&15];return t};var l=function(e){for(var t=0;t<e.length;t++)e[t]=f(e[t]);return e.join("")};window.md5=function(e){return l(o(e))};var c=function(e,t){return e+t&4294967295};if(md5("hello")!="5d41402abc4b2a76b9719d911017c592"){var c=function(e,t){var n=(e&65535)+(t&65535),r=(e>>16)+(t>>16)+(n>>16);return r<<16|n&65535}}})();

// UAParser.js
(function(window,undefined){"use strict";var EMPTY="",UNKNOWN="?",FUNC_TYPE="function",UNDEF_TYPE="undefined",OBJ_TYPE="object",MAJOR="major",MODEL="model",NAME="name",TYPE="type",VENDOR="vendor",VERSION="version",ARCHITECTURE="architecture",CONSOLE="console",MOBILE="mobile",TABLET="tablet";var util={has:function(str1,str2){return str2.toLowerCase().indexOf(str1.toLowerCase())!==-1},lowerize:function(str){return str.toLowerCase()}};var mapper={rgx:function(){for(var result,i=0,j,k,p,q,matches,match,args=arguments;i<args.length;i+=2){var regex=args[i],props=args[i+1];if(typeof result===UNDEF_TYPE){result={};for(p in props){q=props[p];if(typeof q===OBJ_TYPE){result[q[0]]=undefined}else{result[q]=undefined}}}for(j=k=0;j<regex.length;j++){matches=regex[j].exec(this.getUA());if(!!matches){for(p=0;p<props.length;p++){match=matches[++k];q=props[p];if(typeof q===OBJ_TYPE&&q.length>0){if(q.length==2){if(typeof q[1]==FUNC_TYPE){result[q[0]]=q[1].call(this,match)}else{result[q[0]]=q[1]}}else if(q.length==3){if(typeof q[1]===FUNC_TYPE&&!(q[1].exec&&q[1].test)){result[q[0]]=match?q[1].call(this,match,q[2]):undefined}else{result[q[0]]=match?match.replace(q[1],q[2]):undefined}}else if(q.length==4){result[q[0]]=match?q[3].call(this,match.replace(q[1],q[2])):undefined}}else{result[q]=match?match:undefined}}break}}if(!!matches)break}return result},str:function(str,map){for(var i in map){if(typeof map[i]===OBJ_TYPE&&map[i].length>0){for(var j=0;j<map[i].length;j++){if(util.has(map[i][j],str)){return i===UNKNOWN?undefined:i}}}else if(util.has(map[i],str)){return i===UNKNOWN?undefined:i}}return str}};var maps={browser:{oldsafari:{major:{1:["/8","/1","/3"],2:"/4","?":"/"},version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",RT:"ARM"}}}};var regexes={browser:[[/(opera\smini)\/((\d+)?[\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,/(opera).+version\/((\d+)?[\w\.]+)/i,/(opera)[\/\s]+((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/\s(opr)\/((\d+)?[\w\.]+)/i],[[NAME,"Opera"],VERSION,MAJOR],[/(kindle)\/((\d+)?[\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,/(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,/(rekonq)((?:\/)[\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i],[NAME,VERSION,MAJOR],[/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i],[[NAME,"IE"],VERSION,MAJOR],[/(yabrowser)\/((\d+)?[\w\.]+)/i],[[NAME,"Yandex"],VERSION,MAJOR],[/(comodo_dragon)\/((\d+)?[\w\.]+)/i],[[NAME,/_/g," "],VERSION,MAJOR],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(dolfin)\/((\d+)?[\w\.]+)/i],[[NAME,"Dolphin"],VERSION,MAJOR],[/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i],[[NAME,"Chrome"],VERSION,MAJOR],[/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i],[VERSION,MAJOR,[NAME,"Mobile Safari"]],[/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i],[VERSION,MAJOR,NAME],[/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i],[NAME,[MAJOR,mapper.str,maps.browser.oldsafari.major],[VERSION,mapper.str,maps.browser.oldsafari.version]],[/(konqueror)\/((\d+)?[\w\.]+)/i,/(webkit|khtml)\/((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(navigator|netscape)\/((\d+)?[\w\.-]+)/i],[[NAME,"Netscape"],VERSION,MAJOR],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,/(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,/(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,/(links)\s\(((\d+)?[\w\.]+)/i,/(gobrowser)\/?((\d+)?[\w\.]+)*/i,/(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,/(mosaic)[\/\s]((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[ARCHITECTURE,"amd64"]],[/((?:i[346]|x)86)[;\)]/i],[[ARCHITECTURE,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[ARCHITECTURE,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[ARCHITECTURE,/ower/,"",util.lowerize]],[/(sun4\w)[;\)]/i],[[ARCHITECTURE,"sparc"]],[/(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[ARCHITECTURE,util.lowerize]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[MODEL,VENDOR,[TYPE,TABLET]],[/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[MODEL,VENDOR,[TYPE,MOBILE]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/\((bb10);\s(\w+)/i],[[VENDOR,"BlackBerry"],MODEL,[TYPE,MOBILE]],[/android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i],[[VENDOR,"Asus"],MODEL,[TYPE,TABLET]],[/(sony)\s(tablet\s[ps])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(nintendo)\s([wids3u]+)/i],[VENDOR,MODEL,[TYPE,CONSOLE]],[/((playstation)\s[3portablevi]+)/i],[[VENDOR,"Sony"],MODEL,[TYPE,CONSOLE]],[/(sprint\s(\w+))/i],[[VENDOR,mapper.str,maps.device.sprint.vendor],[MODEL,mapper.str,maps.device.sprint.model],[TYPE,MOBILE]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[VENDOR,[MODEL,/_/g," "],[TYPE,MOBILE]],[/\s((milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?))[\w\s]+build\//i,/(mot)[\s-]?(\w+)*/i],[[VENDOR,"Motorola"],MODEL,[TYPE,MOBILE]],[/android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i],[[VENDOR,"Motorola"],MODEL,[TYPE,TABLET]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,TABLET]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,MOBILE]],[/(sie)-(\w+)*/i],[[VENDOR,"Siemens"],MODEL,[TYPE,MOBILE]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[VENDOR,"Nokia"],MODEL,[TYPE,MOBILE]],[/android\s3\.[\s\w-;]{10}((a\d{3}))/i],[[VENDOR,"Acer"],MODEL,[TYPE,TABLET]],[/android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i],[[VENDOR,"LG"],MODEL,[TYPE,TABLET]],[/((nexus\s4))/i,/((nexus\s5))/i,/(lg)[e;\s-\/]+(\w+)*/i],[[VENDOR,"LG"],MODEL,[TYPE,MOBILE]],[/(mobile|tablet);.+rv\:.+gecko\//i],[TYPE,VENDOR,MODEL]],engine:[[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[NAME,VERSION],[/rv\:([\w\.]+).*(gecko)/i],[VERSION,NAME]],os:[[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[NAME,[VERSION,mapper.str,maps.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[NAME,"Windows"],[VERSION,mapper.str,maps.os.windows.version]],[/\((bb)(10);/i],[[NAME,"BlackBerry"],VERSION],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)\/([\w\.]+)/i,/(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i],[NAME,VERSION],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[NAME,"Symbian"],VERSION],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[NAME,"Firefox OS"],VERSION],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[NAME,VERSION],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[NAME,"Chromium OS"],VERSION],[/(sunos)\s?([\w\.]+\d)*/i],[[NAME,"Solaris"],VERSION],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[NAME,VERSION],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[NAME,"iOS"],[VERSION,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i],[NAME,[VERSION,/_/g,"."]],[/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,/(unix)\s?([\w\.]+)*/i],[NAME,VERSION]]};var UAParser=function(uastring){var ua=uastring||(window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:EMPTY);if(!(this instanceof UAParser)){return new UAParser(uastring).getResult()}this.getBrowser=function(){return mapper.rgx.apply(this,regexes.browser)};this.getCPU=function(){return mapper.rgx.apply(this,regexes.cpu)};this.getDevice=function(){return mapper.rgx.apply(this,regexes.device)};this.getEngine=function(){return mapper.rgx.apply(this,regexes.engine)};this.getOS=function(){return mapper.rgx.apply(this,regexes.os)};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return ua};this.setUA=function(uastring){ua=uastring;return this};this.setUA(ua)};if(typeof exports!==UNDEF_TYPE){if(typeof module!==UNDEF_TYPE&&module.exports){exports=module.exports=UAParser}exports.UAParser=UAParser}else{window.UAParser=UAParser;if(typeof define===FUNC_TYPE&&define.amd){define(function(){return UAParser})}if(typeof window.jQuery!==UNDEF_TYPE){var $=window.jQuery;var parser=new UAParser;$.ua=parser.getResult();$.ua.get=function(){return parser.getUA()};$.ua.set=function(uastring){parser.setUA(uastring);var result=parser.getResult();for(var prop in result){$.ua[prop]=result[prop]}}}}})(this);

//
// chromecast.js
//
var Chromecast = (function() {
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
		//chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
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

	return {
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

		timeUpdate: function(callback) {
			timeUpdateCallbacks.push(callback);
		},

		receiverName: function() {
			return session.receiver.friendlyName;
		}
	}
}());

var DragDrop = (function() {
	var container;
	var child;
	var dragging;
	var moving;
	var el;
	var offsetX;
	var offsetY;
	var y;
	var h;
	var prevY;
	var endCallbacks = [];

	function find(y) {
		var result;
		$(child + ":not(.dragging)").each(function(index, element) {
			if (Math.abs($(element).offset().top + h - y) < h) {
				result = $(element);
			}
		});
		return result;
	}

	return {
		init: function(_container, _child) {
			container = _container;
			child = _child;

			$(container).on("mousedown", child, function(e) {
				e.stopPropagation();
				dragging = $(this);
				h = dragging.outerHeight() / 2;

				y = e.pageY;
				prevY = y;
				offsetX = e.pageX - dragging.offset().left;
				offsetY = e.pageY - dragging.offset().top;
			});

			$(document).mousemove(function(e) {
				if (e.pageY !== y) {
					if (dragging && !moving) {
						if (dragging.hasClass("label")) {
							dragging.find(".content").hide();
						}
						moving = true;
						var width = dragging.width();
						var height = dragging.outerHeight();
						dragging.replaceWith('<div class="dragging-placeholder"></div>');
						$(".dragging-placeholder").height(height);
						dragging.addClass("dragging").width(width);
						dragging.css("left", dragging.offset().left);
						dragging.css("top", dragging.offset().top);
						dragging.detach().appendTo("body");
					}
					if (dragging) {
						dragging.css("left", "50px");
						dragging.css("top", e.pageY - offsetY);

						var height = dragging.outerHeight();

						el = find(e.pageY - offsetY + h);
						if (el !== undefined) {
							$(".dragging-placeholder").remove();
							if (prevY < e.pageY) {
								if (el.hasClass("label")) {
									el.find(".content").prepend($('<div class="dragging-placeholder"></div>'));
								}
								else {
									$('<div class="dragging-placeholder"></div>').insertAfter(el);	
								}							
							}
							else {
								$('<div class="dragging-placeholder"></div>').insertBefore(el);
							}
							$(".dragging-placeholder").height(height);
						}
						prevY = e.pageY;
					}
				}			
			});

			$(document).mouseup(function(e) {
				if (dragging) {
					if (moving) {
						dragging.css("left", "auto");
						dragging.css("top", "auto");

						dragging.removeClass("dragging");
						$(".dragging-placeholder").replaceWith(dragging);
						moving = false;
						endCallbacks.forEach(function(cb) { cb(); });
					}
					dragging = null;
				}			
			});
		},

		ended: function(cb) {
			endCallbacks.push(cb);
		}
	}
}());

//
// script.js
//
(function() {
	"use strict";

	var token,
		username,
		episodes = {},
		casts = {},
		labels,
		events = [],
		db,
		rootLabelId,
		root,
		apiRoot,
		loggedIn = false,
		contextEpisodeID,
		currentEpisodeId = null,
		currentEpisodeDuration,
		selectedEpisodeId = null,
		selectedCastId = null,
		videoLoading = false,
		castHovered = null,
		ctrlDown = false,
		autoplay = false,
		castScroll,
		episodeScroll,
		episodeinfoScroll,
		poppedOut,
		mediaType,
		idbReady = false;

	var Setting = {
		Text: 0,
		Bool: 1,
		Keybind: 2
	}

	var DefaultSettings = {
		General: {

		},
		Playback: {
			KeepPlaying: {
				type: Setting.Bool,
				value: true
			}
		},
		Keybinds: {
			PlayPause: {
				type: Setting.Keybind,
				value: 'space'
			},
			Next: {
				type: Setting.Keybind,
				value: 'pageup'
			},
			Previous: {
				type: Setting.Keybind, 
				value: 'pagedown'
			},
			SkipForward: {
				type: Setting.Keybind,
				value: 'right'
			},
			SkipBack: {
				type: Setting.Keybind,
				value: 'left'
			}
		}
	};

	var settings = DefaultSettings;

	var Event = {
		Start: 10,
		Pause: 20,
		Play: 30,
		SleepStart: 40,
		SleepEnd: 50,
		EndOfTrack: 60,
		Delete: 70,
		10: "Start",
		20: "Pause",
		30: "Play",
		40: "Sleep Started",
		50: "Sleep Ended",
		60: "End Of Track",
		70: "Delete"
	};

	var buffer = {
		events: [],
		settings: {},
		idb: {}
	};

	Chromecast.init("3EC703A8");
	Chromecast.session(function() {
		$(".cc img").prop("src", "cast_on.png");
		el("vid").pause();
		$("#cast-overlay").show();
		padCastOverlay();
	});
	Chromecast.receiver(function(n) {
		if (n > 0) {
			$(".cc").show();
			$("#seekbar").css("right", ($("#playbar").width() - $("#time").position().left) + "px");
		}
		else {
			$(".cc").hide();
		}
	});
	Chromecast.mediaLoaded(function() {
		Chromecast.seek(el("vid").currentTime);
		if (paused) {
			Chromecast.pause();
		}
	});

	$(document).ready(function() {
		//DragDrop.init("#podcasts", ".drag");
		//DragDrop.ended(saveLabels);

		var Router = Backbone.Router.extend({
			routes: {
				"": "podcasts",
				"podcasts": "podcasts",
				"settings": "settings",
				"now-playing": "nowPlaying",
				"fullscreen":  "fullscreen",
				"p:n": "foo",
				"*any": "podcasts"
			},

			podcasts: function() {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
				}
				else {
					$("#tab-podcasts").show();
					if (small) {
						page = 0;
						$(".col").hide();
						$("#playbar").show();
						$(".col:eq(0)").show();
					}
					$("#vid-container").addClass("thumb");
				}
			},

			settings: function() {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
				}
				else {
					$("#tab-settings").show();
					$("#vid-container").addClass("thumb");
				}
			},

			foo: function(n) {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
				}
				else {
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
					$("#vid-container").addClass("thumb");
				}
			},

			nowPlaying: function() {
				$(".tab").hide();
				if (!loggedIn) {
					$("#tab-login").show();
					$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
				}
				else {
					$("#vid-container").removeClass("thumb");
					$("#vid-container").css("right", 0);
					$("#tab-now-playing").show();
				}
			},

			fullscreen: function() {
				$("#topbar").hide();
				$("#vid-container").removeClass("thumb");
				$("#vid-container").addClass("fs");
			}
		});

		var path = window.location.pathname;
		root = path.substr(0, path.indexOf("client/") + 7);
		
		if(localStorage.username){
			username = localStorage.username;
			$("#input-username").val(username);
		}
		
		apiRoot = localStorage[uniqueName("apiTarget")] || window.location.protocol + "//" + window.location.host + root.replace("client", "api");

		$("#input-target").val(apiRoot);

		var router = new Router();

		router.bind("all", function(route, router) {
			positionThumb();
			padCastOverlay();
			$("#overlay-info").hide();
		});

		var page = 0;
		var small = $(".col").css("width") === "100%";
		var prevSmall = false;

		$("#podcast-cols").on("click", ".cast", function() {
			router.navigate("p1", { trigger: true });
		});

		$("#podcast-cols").on("click", ".episode", function() {
			router.navigate("p2", { trigger: true });
		});

		$(window).resize(function() {
			small = window.innerWidth < 600;
			if (!prevSmall && small) {
				$(".col").hide();
				$(".col:eq(" + page + ")").show();
				if (page === 2) {
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
			$(".pretty-button").css("line-height", $("#pretty img").height() + "px");
			$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
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

		function updateTime(currentTime) {
			var date = new Date(currentTime * 1000);
			var dateTotal = new Date(currentEpisodeDuration * 1000);
			var progress = 1 / currentEpisodeDuration * currentTime;

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

			if (window.name === "popout" && currentTime > 0) {
				var ev = new window.Event('timeupdate');
				ev.data = { time: currentTime };
				window.dispatchEvent(ev);
			}

			$("#time").html(time);
			if ($("#seekbar").is(":visible")) {
				$("#seekbar").css("right", ($("#playbar").width() - $("#time").position().left) + "px");
				$("#seekbar div").css("width", $("#seekbar").width() * progress + "px");
			}
		}

		$("#vid").on("timeupdate", function() {
			var video = el("vid");
			updateTime(video.currentTime);
		});

		var currentTime;
		Chromecast.timeUpdate(function(time) {
			updateTime(time);
			currentTime = time;
		});

		$("#vid").click(function() {
			playPauseToggle();
		});

		$("#vid").dblclick(function() {
			toggleFullscreen();
		});

		$("#vid-thumb-bar .popout").click(function() {
			var video = el("vid");
			if (paused) {
				pushEvent(Event.Pause);
			}
			else {
				pushEvent(Event.Play);
			}
			video.setAttribute("src", "#");
			video.load();

			poppedOut = window.open(root + "fullscreen", "popout", 'toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=0,top=0');
			$(poppedOut).on("beforeunload", function() {				
				poppedOut = null;
				var id = currentEpisodeId;
				currentEpisodeId = null;

				playEpisode(id);
			});

			$(poppedOut).on("timeupdate", function(e) {
				updateTime(e.originalEvent.data.time);
			});

			$(poppedOut).on("unload", function() {
				if (localStorage.beforeunloadevent) {
					var ev = JSON.parse(localStorage.beforeunloadevent);
					pushEvent(ev.type, ev.id, ev.time);
					localStorage.removeItem("unloadevent");
					localStorage.removeItem("beforeunloadevent");
				}
			});
		});

		$("#vid-thumb-bar .minimize").click(function() {
			$("#vid-container").toggleClass("minimized");
		});

		if (window.name === "popout") {
			$(window).on("message", function(e) {
				var message = JSON.parse(e.originalEvent.data);
				switch (message.action) {
					case "playPause":
						playPauseToggle();
						break;

					case "skipForward":
						skipForward();
						break;

					case "skipBack":
						skipBack();
						break;

					case "seek":
						seek(message.time);
						break;
				}
			});
		}

		$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			$("#vid-container").toggleClass("fs");
			if ($("#vid-container").hasClass("fs")) {
				$("#vid-container").removeClass("thumb");
				$("#playbar").detach().appendTo("#vid-container");
				$("#playbar").show();
			}
			else {
				if (Backbone.history.fragment !== "now-playing") {
					$("#vid-container").addClass("thumb");
				}
				$("#playbar").detach().appendTo("body");
				$("#playbar").show();
				if (timer !== null) {
					clearTimeout(timer);
				}
				$("#overlay-info").stop().hide();
			}
		});

		var timer = null;
		$("#vid-container").mousemove(function() {
			if (!bar) {
				if ($(this).hasClass("fs")) {
					$("#playbar").show();
					$("#overlay-info").fadeIn("fast");
					if (timer !== null) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() { 
						$("#playbar").hide();
						$("#overlay-info").stop().fadeOut("fast");
					}, 1000);
				}
				else if ($(this).css("right") == "0px") {
					$("#overlay-info").fadeIn("fast");
					if (timer !== null) {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						$("#overlay-info").stop().fadeOut("fast");
					}, 1000);
				}
			}
		});

		var bar = false;

		$("#playbar").mouseover(function() {
			bar = true;
			if ($(this).parent().hasClass("fs")) {
				if (timer !== null) {
					clearTimeout(timer);
				}
			}
		});

		$("#playbar").mouseout(function() {
			bar = false;
			if ($(this).parent().hasClass("fs")) {
				timer = setTimeout(function() {
					$("#playbar").hide();
					$("#overlay-info").fadeOut("fast");
				}, 1000);
			}
		});

		$(window).on("beforeunload", function() {
			if (currentEpisodeId !== null) {
				if (!paused && !ended) {
					localStorage.beforeunloadevent = JSON.stringify({
						type: Event.Play,
						id: currentEpisodeId,
						time: el("vid").currentTime | 0
					});
				}
			}
		});

		$(window).on("unload", function() {
			if (currentEpisodeId !== null) {
				if (!paused && !ended) {
					localStorage.unloadevent = JSON.stringify({
						type: Event.Play,
						id: currentEpisodeId,
						time: el("vid").currentTime | 0
					});
				}
			}
		});

		$(".button-skipback").click(function() {
			skipBack();
		});

		$(".button-play").click(function() {
			playPauseToggle();
		});

		$(".button-skipforward").click(function() {
			skipForward();
		});

		$("#vid").on("loadstart", function() {
			if ($("#ep-" + currentEpisodeId + " i").length > 0) {
				$("#ep-" + currentEpisodeId + " i").remove();
			}
			$("#vid-container").hide();
			updateEpisodeIndicators();
		});

		$("#vid").on("canplay", function() {
			var video = el("vid");
			if (video.videoWidth > 0) {
				mediaType = "video";
				$("#vid-container").removeClass("audio");
				$("#vid-container").show();
			}
			else {
				$("#vid-art").prop("src", getEpisodeImage(currentEpisodeId));
				mediaType = "audio";
				$("#vid-container").show();
				$("#vid-container").addClass("audio");
			}

			currentEpisodeDuration = video.duration;

			var lastevent = episodes[currentEpisodeId].lastevent;

			if (lastevent && lastevent.type == Event.EndOfTrack) {
				ended = true;
				paused = true;
			}

			if (lastevent !== null && videoLoading && lastevent.type != Event.EndOfTrack) {
				video.currentTime = lastevent.positionts;

				if (lastevent.type == Event.Play) {
					play();
				}
				else {
					pause();
				}
			}
			if (autoplay && videoLoading) {
				autoplay = false;
				if (!(lastevent && lastevent.type == Event.EndOfTrack)) {
					play();
				}
			}
			videoLoading = false;

			updateEpisodeIndicators();
		});

		$("#vid").on("ended", function() {
			pushEvent(Event.EndOfTrack);
			$("#vid-container").hide();
			ended = true;
			updateEpisodeIndicators();
			nextEpisode();
		});

		var seeking = false;
		$("#seekbar").mousedown(function(e) {
			pushEvent(Event.Pause);
			seek(1 / $("#seekbar").width() * (e.pageX - 170) * currentEpisodeDuration);
			seeking = true;
		});

		$("#seekbar").mouseover(function() {
			$("#seektime").show();
		});

		$("#seekbar").mouseout(function() {
			if (!seeking) {
				$("#seektime").hide();
			}
		});

		function updateSeektime(x) {
			var currentTime = 1 / $("#seekbar").width() * (x - 170) * currentEpisodeDuration;

			var date = new Date(currentTime * 1000);

			date.setHours(date.getHours() - 1);
			
			var time = "";
			if (date.getHours() > 0) {
				time += date.getHours().pad() + ":";
			}
			time += date.getMinutes().pad() + ":" + date.getSeconds().pad();

			$("#seektime").css("left", (x - $("#seektime").outerWidth() / 2) + "px");
			$("#seektime").html(time);
		}

		$("#seekbar").mousemove(function(e) {
			updateSeektime(e.pageX);
		});

		$(document).mouseup(function() {
			x = false;
			if (seeking) {
				$("#seektime").hide();
				seeking = false;
				pushEvent(Event.Play);
				if (el("vid").paused) {
					pushEvent(Event.Pause);
				}
			}
		});

		$(document).mousemove(function(e) {
			//$(".thumb").css("left", e.pageX+"px");
			if (x) {
				$(".thumb").css("width", (window.innerWidth - e.pageX - 15 + o)+"px");
			}
			if (seeking) {
				seek(1 / $("#seekbar").width() * (e.pageX - 170) * currentEpisodeDuration);
				updateSeektime(e.pageX);
			}
		});

		$("#playbar-gear").click(function() {
			$("#playbar-gear-menu").toggle();
		});

		$("#playbar-fullscreen").click(toggleFullscreen);

		$(".playback-rate").click(function() {
			$(".playback-rate").removeClass("selected");
			$(this).addClass("selected");
			el("vid").playbackRate = $(this).attr("rate");
		});

		$("#button-login").click(login);

		$("#input-password").keydown(function(e) {
			if (e.which === 13) {
				login();
			}
		});

		$("#button-logout").click(function() {
			localStorage.removeItem("token");
			$("#vid-container").hide();
			$("#playbar").hide();
			$("#topbar nav").hide();
			$("#userinfo").hide();
			$(".tab").hide();
			$("#tab-login").show();
		});

		$("#vmenu-add").click(function() {
			var prev = $(".vmenu-toggle:visible");
			$("#input-vmenu-add").toggle();
			$("#button-vmenu-add").toggle();
			$("#vmenu-add-results").toggle();
			prev.hide();
			$("#input-vmenu-add").focus();
			if ($("#input-vmenu-add:visible").length > 0) {
				castScroll.scrollTo(0, 0);
			}
		});

		$("#button-vmenu-add").click(function() {
			addFeed($("#input-vmenu-add").val());
		});

		$("#input-vmenu-add").keydown(function(e) {
			e.stopPropagation();

			var selected = $("#vmenu-add-results p.selected");
			if (e.which === 13) {
				if (selected.length > 0) {
					addFeed(selected.attr("feed-url"));
					selected.parent().empty();
				}
				else {
					addFeed($(this).val());
				}
			}
			else if (e.which === 40) {
				var el = $("#vmenu-add-results p");
				var i = selected.removeClass("selected").index();
				i++;
				if (i > el.length - 1) {
					i = 0;
				}
				$(el.get(i)).addClass("selected");
			}
			else if (e.which === 38) {
				var el = $("#vmenu-add-results p");
				var i = selected.removeClass("selected").index();
				i--;
				if (i < 0) {
					i = el.length - 1;
				}
				$(el.get(i)).addClass("selected");
			}
		});

		var searchTimerId;
		$("#input-vmenu-add").keyup(function(e) {
			if (e.which !== 40 && e.which !== 38) {
				clearTimeout(searchTimerId);
				var term = $(this).val();
				searchTimerId = setTimeout(function() {				
					$.ajax({
						url: "http://itunes.apple.com/search",
						jsonp: "callback",
						dataType: "jsonp",
						data: {
							media: "podcast",
							term: term,
							limit: 5
						},
						success: function(res) {
							$("#vmenu-add-results").empty();
							res.results.forEach(function(result) {
								$("#vmenu-add-results").append('<p feed-url="' + result.feedUrl + '">' + result.trackName + '</p>');
							});
							$("#vmenu-add-results p:first-child").addClass("selected");
						}
					});
				}, 100);
			}
		});

		$("#vmenu-add-results").on("click", "p", function() {
			addFeed($(this).attr("feed-url"));
			$(this).parent().empty();
		});

		$("#vmenu-label").click(function() {
			var prev = $(".vmenu-toggle:visible");
			$("#input-vmenu-label").toggle();
			$("#button-vmenu-label").toggle();
			prev.hide();
			$("#input-vmenu-label").focus();
			if ($("#input-vmenu-label:visible").length > 0) {
				castScroll.scrollTo(0, 0);
			}
		});

		$("#button-vmenu-label").click(function() {
			addLabel($("#input-vmenu-label").val());
		});

		$("#input-vmenu-label").keydown(function(e) {
			if (e.which === 13) {
				addLabel($(this).val());
			}
		});

		$("#vmenu-sync").click(function() {
			sync(true);
		});

		
		positionThumb();
		$(window).resize(function() {
			$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
			positionThumb();
		});

		/*$("#input-username").focus(function() {
			$("#login-container").css("padding-top", ((window.innerHeight - 60) / 2 - $("#login-container").height() / 2) + "px");
		});*/

		$(document).click(function() {
			$(".context-menu").hide();
		});

		$("#volume").mousemove(function(e) {
			var width = window.innerWidth - e.pageX - 200;
			var height = 40 / 150 * width;
			el("vid").volume = width / 150;
			$("#volume-top").css("border-left-width", width+"px");
			$("#volume-top").css("border-top-width", height+"px");
		});

		$("#podcasts").on("contextmenu", ".cast", function(e) {
			e.stopPropagation();
			showContextMenu("#cast-context-menu", this, e);
		});

		$("#podcasts").on("contextmenu", ".label", function(e) {
			showContextMenu("#label-context-menu", this, e);
		});

		$("#episodes").on("contextmenu", ".episode", function(e) {
			showContextMenu("#episode-context-menu", this, e);
		});

		$("#podcasts").on("mouseover", ".cast", function() {
			castHovered = $(this).prop("id").split("-")[1];
		});

		$("#podcasts").on("mouseout", ".cast", function() {
			castHovered = null;
		});

		$(document).keydown(function(e) {
			if (!(e.ctrlKey || e.metaKey)) {
				return;
			}

			ctrlDown = true;

			if ($(e.target).is("input:visible,textarea:visible")) {
				return;
			}

			if (window.getSelection().toString()) {
				return;
			}

			if (castHovered !== null) {
				$("#clip").val(casts[castHovered].url).focus().select();
			}
		});

		$(document).keyup(function(e) {
			ctrlDown = false;
		});

		$("#cast-context-rename").click(function() {
			var name = $("#cast-" + contextEpisodeID + " .name").html();
			$("#cast-" + contextEpisodeID + " .name").html('<input type="text">');
			$(".cast input").focus();
			$(".cast input").val(name);
			$(".cast input").keydown(function(e) {
				if (e.which === 13) {
					var name = $(this).val();
					$(this).parent().html(name);
					$.ajax(apiRoot + "library/casts/" + contextEpisodeID, {
						type: "PUT",
						data: {
							name: name
						}
					});
				}
			})
		});

		$("#cast-context-unsub").click(function() {
			$(".cast.selected").each(function() {
				var id = $(this).prop("id").split("-")[1];
				$("#cast-" + id).remove();
				$.ajax(apiRoot + "library/casts/" + id, { type: "DELETE" });
			});
			$("#cast-" + contextEpisodeID).remove();
			$.ajax(apiRoot + "library/casts/" + contextEpisodeID, { 
				type: "DELETE",
				success: function(res) {
					loadLabels();
				}
			});
		});

		$("#label-context-rename").click(function() {
			var name = $("#label-" + contextEpisodeID + " .name span").html();
			$("#label-" + contextEpisodeID + " .name span").html('<input type="text">');
			$(".label input").focus();
			$(".label input").val(name);
			$(".label input").keydown(function(e) {
				if (e.which === 13) {
					var name = $(this).val();
					$(this).parent().html(name);
					$.ajax(apiRoot + "library/labels/" + contextEpisodeID, {
						type: "PUT",
						data: {
							name: name
						}
					});
				}
			});
		});

		$("#episode-context-delete").click(function() {
			deleteEpisode(contextEpisodeID);
		});

		$("#episode-context-reset").click(function() {
			if (contextEpisodeID === currentEpisodeId) {
				seek(0);
			}
			else {
				pushEvent(Event.Pause, contextEpisodeID, 0);
				updateEpisodeIndicators();
			}
		});

		$("#input-target").keyup(function(e) {
			var url = $(this).val();
			if (url.indexOf("/", url.length - 1) === -1) {
				url += "/";
			}
			$.ajax(url + "account/ping", { 
				error: function(res) { 
					if (res.responseText === "Bad token") {
						$("#input-target-container i").show();
					}
					else {
						$("#input-target-container i").hide();
					}
				}, 
				success: function() { 
					$("#input-target-container i").hide();
				}
			});
		});

		$("#pretty").click(function() {
			if (selectedEpisodeId !== currentEpisodeId) {
				autoplay = true;
				playEpisode(selectedEpisodeId);
			}
			else {
				playPauseToggle();
			}
		});

		$("#pretty img").load(function() {			
			$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
			$(".pretty-button").css("line-height", $(this).height() + "px");
		});

		$("#episode-bar-events").click(function() {
			$("#events").css("left", "66.666666%");
		});

		$("#episode-bar-play").click(function() {
			if (selectedEpisodeId !== currentEpisodeId) {
				autoplay = true;
				playEpisode(selectedEpisodeId);
			}
			else {
				playPauseToggle();
			}
		});

		$("#events").on("click", "#events-close", function() {
			$("#events").css("left", "100%");
		});

		$("#events").on("click", "div", function() {
			$("#events").css("left", "100%");
			var type = $(this).attr("event-type");
			var video = el("vid");

			video.currentTime = $(this).attr("event-position");
			Chromecast.seek($(this).attr("event-position"));
			if (type == Event.Start || type == Event.Play) {
				video.play();
			}
			else {
				video.pause();
			}
		});

		$(".cc").click(function() {
			if (Chromecast.running()) {
				$(".cc img").prop("src", "cast_off.png");
				Chromecast.stop();
				$("#cast-overlay").hide();
				el("vid").currentTime = currentTime;
				play();
			}
			else {
				$(".cc img").prop("src", "cast_on.png");
				Chromecast.start();
				Chromecast.load(episodes[currentEpisodeId].feed.enclosure.url, {
					title: episodes[currentEpisodeId].feed.title,
					description: episodes[currentEpisodeId].feed.description,
					image: getEpisodeImage(currentEpisodeId)
				});				
			}
		});

		$("#podcasts").on("click", ".label .name", function() {
			$(this).parent().find(".content").toggle();
			if ($(this).find("i").hasClass("fa-angle-down")) {
				$(this).find("i").removeClass("fa-angle-down");
				$(this).find("i").addClass("fa-angle-up");
			}
			else {
				$(this).find("i").removeClass("fa-angle-up");
				$(this).find("i").addClass("fa-angle-down");
			}
			setTimeout(function() { castScroll.refresh(); }, 0);
			saveLabels();
		});


		$("#podcasts").on("click", ".cast", function(e) {
			if (ctrlDown) {
				$(this).toggleClass("selected");
			}
			else {
				var id = $(this).prop("id").split("-")[1];
				selectCast(id);
			}
		});

		$("#episodes").on("click", ".episode", function() {
			if (ctrlDown) {
				$(this).toggleClass("selected");
				$(this).children(".bar").toggle();
			}
			else {
				var id = $(this).prop("id").split("-")[1];
				selectedEpisodeId = id;
				loadEpisodeInfo(id);
				sessionStorage.selectedepisode = id;

				if (currentEpisodeId === id) {
					if (paused) {
						$("#episode-bar-play").html("Play");
					}
					else {
						$("#episode-bar-play").html("Pause");
					}
				}
				else {
					$("#episode-bar-play").html("Play");
				}

				$(".episode").removeClass("current");
				$(this).addClass("current");
			}
		});

		$("#episodes").on("dblclick", ".episode", function() {
			var id = $(this).prop("id").split("-")[1];
			sessionStorage.lastepisode = JSON.stringify({ id: id, castid: episodes[id].castid });
			autoplay = true;
			playEpisode(id);
		});

		$("#episodes").on("click", ".delete", function(e) {
			e.stopPropagation();
			var id = $(this).parent().prop("id").split("-")[1];
			deleteEpisode(id);
		});

		$("#episodes").on("mouseover", ".episode", function() {
			$(this).children(".progress").css("color", "#FFF");
			if ($(this).find(".fa-circle").length > 0) {
				$(this).children(".delete").show();
			}
		});

		$("#episodes").on("mouseout", ".episode", function() {
			$(this).children(".progress").css("color", "#666");
			$(this).children(".delete").hide();
		});

		$("body").on("dragover", function(e) {
			e.stopPropagation();
			e.preventDefault();
		});

		$("body").on("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();

			var file = e.originalEvent.dataTransfer.files[0];
			var reader = new FileReader();

			reader.onload = function() {
				$.post(apiRoot + "library/casts.opml", { opml: reader.result });
			};

			reader.readAsText(file);
		});

		$("#settings-panel").on("click", "#opml", function() {
			$.get(apiRoot + "library/casts.opml", function(res) {
				var a = window.document.createElement('a');
				a.href = window.URL.createObjectURL(new Blob([res], {type: 'text/plain'}));
				a.download = 'casts.opml';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			});			
		});

		$("#settings-panel").on("click", "#import-opml", function() {
			$("#hax").click();
		});

		$("#settings-panel").on("change", "#hax", function(e) {
			var file = e.target.files[0];
			var reader = new FileReader();

			reader.onload = function() {
				$.post(apiRoot + "library/casts.opml", { opml: reader.result });
			};

			reader.readAsText(file);
		});

		$("#settings-panel").on("click", "#reset-settings", resetSettings);

		var settingTimerId;
		$("#tab-settings").on("keyup", ".setting", function() {
			clearTimeout(settingTimerId);
			var id = $(this).prop("id").split(":");
			var val = $(this).val();
			settingTimerId = setTimeout(function() {
				saveSetting(id[1], val, id[0]);
			}, 500);
		});

		$("#tab-settings").on("change", ".setting", function() {
			var id = $(this).prop("id").split("_");
			var val = $(this).prop("checked");
			saveSetting(id[1], val, id[0]);
		});

		$("#tab-settings").on("keydown", ".keybind", function(e) {
			e.preventDefault();
			e.stopPropagation();
			var s = "";
			if (e.ctrlKey) {
				s += "ctrl+";
			}
			if (e.shiftKey) {
				s += "shift+";
			}
			if (e.altKey) {
				s += "alt+";
			}
			if (e.metaKey) {
				s += "meta+";
			}

			var special = {
				8: 'backspace',
				9: 'tab',
				13: 'enter',
				20: 'capslock',
				27: 'esc',
				32: 'space',
				33: 'pageup',
				34: 'pagedown',
				35: 'end',
				36: 'home',
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
				45: 'ins',
				46: 'del'
			};

			var character = 
		        (e.which > 47 && e.which < 58)   ||
		        (e.which > 64 && e.which < 91)   ||
		        (e.which > 95 && e.which < 112)  ||
		        (e.which > 185 && e.which < 193) ||
		        (e.which > 218 && e.which < 223);

		    if (character) {
		    	var k = String.fromCharCode(e.which).toLowerCase();
		    	s += k;
		    }
		    else if (e.which in special) {
		    	var k = special[e.which];
		    	s += k;
		    }
			
			if (character || e.which in special) {
				$(this).val(s);
			}
			return false;
		});

		var x = false;
		var o = 0;

		/*$("#vid-thumb-bar").mousedown(function(e) {
			x = true;
			o = window.innerWidth - e.pageX;
			$(".thumb").css("width", (window.innerWidth - e.pageX - 15 + o)+"px");
		});*/

		$("#settings-menu").on("click", "p", function() {
			var id = $(this).prop("id").split("-")[1];
			$(".setting-panel").hide();
			$(".setting-button").removeClass("selected");
			$("#setting-"+ id).addClass("selected");
			$("#setting-panel-" + id).show();
		});

		setKeybinds();

		episodeinfoScroll = new IScroll('#episodeinfo', {
			mouseWheel: true,
			scrollbars: 'custom',
			keyBindings: true,
			interactiveScrollbars: true,
			click: true
		});
		
		if (localStorage.token) {
			token = localStorage.token;
			finishLogin();

			$("#playbar").show();
			$("#topbar nav").show();
			$("#userinfo").show();
		}

		Backbone.history.start({ pushState: true, root: root });
	});

	var addingFeed = false;

	function addFeed(feedurl) {
		$.post(apiRoot + "library/casts", { feedurl: feedurl }, function() {
			addingFeed = true;
			loadEpisodes();
		});

		$("#input-vmenu-add").val("");
		$("#input-vmenu-add").toggle();
		$("#button-vmenu-add").toggle();
		$("#vmenu-add-results").toggle();
	}

	function addLabel(name) {
		$("#input-vmenu-label").val("");
		$("#input-vmenu-label").toggle();
		$("#button-vmenu-label").toggle();

		$.post(apiRoot + "library/labels", { name: name }, function() {
			loadLabels();
		});
	}

	function loadEpisodeInfo(id) {
		renderEvents(id);

		var image = getEpisodeImage(id);
		if (image) {
			$("#pretty img").prop("src", image);
			$("#pretty").show();
			$(".pretty-button").css("line-height", $("#pretty img").height() + "px");
			$("#pretty img").css("max-height", $("#main-container").height() * 0.4 + "px");
		}
		else {
			$("#pretty").hide();
		}

		selectedEpisodeId = id;

		$("#episode-title, #overlay-info h2").html(episodes[id].feed.title);
		$("#episode-date").html(new Date(episodes[id].feed.pubDate).toLocaleString());
		$("#episode-desc").html(episodes[id].feed.description);
		$("#episode-desc *").removeAttr("style");
		$("#overlay-info h5").html(casts[episodes[id].castid].feed.title);
		$("#episode-bar").show();

		setTimeout(function() { episodeinfoScroll.refresh(); }, 0);

		positionThumb();
	}

	var c = 0;
	var q = [];

	function playEpisode(id) {
		if (currentEpisodeId !== id) {
			if (currentEpisodeId !== null) {
				if (!el("vid").paused) {
					pushEvent(Event.Play);
				}
			}

			loadEpisodeInfo(id);

			currentEpisodeId = id;

			if (episodes[id].lastevent === null) {
				pushEvent(Event.Start, id, 0);
			}

            var desc = "";
            if (_.isString(episodes[id].feed.description)) {
                desc = episodes[id].feed.description.replace(/(<([^>]+)>)/ig,"");
            }

			Chromecast.load(episodes[id].feed.enclosure.url, {
				title: episodes[id].feed.title,
				description: desc,
				image: getEpisodeImage(id)
			});

			var video = el("vid");
			video.setAttribute("src", episodes[id].feed.enclosure.url);
			video.load();
			videoLoading = true;
			ended = false;

			id = episodes[id].castid;

			q = [];
			for (var x in episodes) {
				if (episodes[x].castid == id) {
					if (!(episodes[x].lastevent && episodes[x].lastevent.type == Event.Delete)) {
						q.push(episodes[x]);
						if (x == currentEpisodeId) {
							c = q.length - 1;
						}
					}
				}
			}

			q.sort(function(a, b) {
				var d1 = new Date(a.feed.pubDate);
				var d2 = new Date(b.feed.pubDate);
				if (d1 > d2) {
					return -1;
				}
				if (d1 < d2) {
					return 1;
				}
				return 0;
			});

			$("#vid-container").removeClass("minimized");
		}
	}

	function deleteEpisode(id) {
		$("#ep-" + id).remove();
		pushEvent(Event.Delete, id);
		delete episodes[contextEpisodeID];
		db.put("episodes", episodes);
	}

	function login() {
		username = $("#input-username").val();
		apiRoot = $("#input-target").val();
		if (apiRoot.indexOf("/", apiRoot.length - 1) === -1) {
			apiRoot += "/";
		}
		
		var _uuid = localStorage.uuid || uuid();

		$.post(apiRoot + "account/login", {
			username: username,
			password: $("#input-password").val(),
			clientname: "Castcloud",
			clientdescription: "Best",
			clientversion: "1.0",
			uuid: _uuid
		}, function(res) {
			token = res.token;
			console.log(token);
			if (token !== undefined) {
				localStorage.token = token;
				localStorage.username = username;
				localStorage.uuid = _uuid;
				localStorage[uniqueName("apiTarget")] = apiRoot;
				
				finishLogin();

				$("#tab-podcasts").fadeIn("fast");
				$("#playbar").slideDown("fast");
				$("#topbar nav").fadeIn("fast");
				$("#userinfo").fadeIn("fast");
			}
		});

		$("#input-password").val("");
	}

	function finishLogin() {
		loggedIn = true;

		$("#userinfo span").html(username);
		$(".tab").hide();
		$("#main-container").css("bottom", "60px");

		if (Backbone.history.fragment !== "now-playing") {
			$("#vid-container").addClass("thumb");
		}

		var render = _.after(4, renderCasts);
		var updateLastEvent =_.after(2, function() {
			events.forEach(function(event) {
				if (event.episodeid in episodes && (!episodes[event.episodeid].lastevent || event.clientts > episodes[event.episodeid].lastevent.clientts)) {
					episodes[event.episodeid].lastevent = event;
				}
			});
		});

		db = new IDBStore({
			storeName: uniqueName("db"),
			keyPath: null
		}, function() {
			idbReady = true;
			console.log("IDB ready");

			db.get("labels", function(data) {
				if (data) {
					console.log("Labels loaded from IDB");
					labels = data;
					render();
				}
			});

			db.get("casts", function(data) {
				if (data) {
					console.log("Casts loaded from IDB");
					casts = data;
					render();
				}
			})

			db.get("episodes", function(data) {
				if (data) {
					console.log("Episodes loaded from IDB");
					episodes = data;

					updateLastEvent();
					render();
				}
			});

			db.get("events", function(data) {
				if (data) {
					console.log("Events loaded from IDB");
					events = data;
					
					if (window.name !== "popout") {
						if (localStorage.beforeunloadevent) {
							var ev = JSON.parse(localStorage.beforeunloadevent);
							console.log("pushing beforeunloadevent");
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("beforeunloadevent");
						}
						if (localStorage.unloadevent) {
							var ev = JSON.parse(localStorage.unloadevent);
							console.log("pushing unloadevent");
							pushEvent(ev.type, ev.id, ev.time);
							localStorage.removeItem("unloadevent");
						}
					}

					updateLastEvent();
					render();
				}
			});

			db.get("settings", function(data) {
				if (data) {
					console.log("Settings loaded from IDB");
					settings = $.extend(true, {}, DefaultSettings, data);

					setKeybinds();
					renderSettings();
				}
			});

			db.get("buffer_events", function(data) {
				if (data) {
					buffer.events = data;
				}
			});

			db.get("buffer_settings", function(data) {
				if (data) {
					buffer.settings = data;
				}
			});

			for (var key in buffer.idb) {
				db.put(key, buffer.idb[key]);
				console.log("Flushed " + key + " from IDB buffer");
			}
		});	

		$.ajaxSetup({
			headers: { Authorization: token }
		});

		sync();
	}

	function sync(onDemand) {
		loadLabels();
		loadEpisodes();
		loadEvents();
		loadSettings();

		if (buffer.events.length > 0) {
			flushEvents();
		}
		if (_.size(buffer.settings) > 0) {
			flushSettings();
		}

		if (!onDemand) {
			setTimeout(sync, 10000);
		}		
	}

	var lastEventTS = null;
	var currentOrder = 0;

	function pushEvent(type, id, time) {
		var eventTS = unix();
		if (lastEventTS === eventTS) {
			currentOrder++;
		}
		else {
			currentOrder = 0;
		}
		lastEventTS = eventTS;

		id = id || currentEpisodeId;

		buffer.events.push({
			type: type,
			episodeid: id,
			positionts: time === undefined ? el("vid").currentTime | 0 : time,
			concurrentorder: currentOrder,
			clientts: eventTS				
		});
		db.put("buffer_events", buffer.events);

		flushEvents();

		episodes[id].lastevent = {
			type: type,
			positionts: time === undefined ? el("vid").currentTime | 0 : time,
			clientts: eventTS,
			clientname: null,
			clientdescription: null
		}

		var event = {
			clientdescription: "Best",
			clientname: "Castcloud",
			clientts: eventTS,
			episodeid: id,
			name: Event[type],
			positionts: time === undefined ? el("vid").currentTime | 0 : time,
			type: type
		};

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

		events.unshift(event);

		db.put("events", events);

		if (id == selectedEpisodeId) {
			renderEvents(id);
		}
	}

	function flushEvents() {
		$.post(apiRoot + "library/events", { json: buffer.events }, function() {
			buffer.events = [];
			db.remove("buffer_events");
		});	
	}

	function loadCasts(tag) {
		$.get(apiRoot + (tag === undefined ? "library/casts" : "library/casts/" + tag), function(res) {
			res.forEach(function(cast) {
				casts[cast.id] = cast;
			});

			if (idbReady) {
				db.put("casts", casts);				
			}
			else {
				buffer.idb.casts = casts;
			}

			renderCasts();
		});
	}

	var castsHash;
	var firstCastsRender = true;

	function renderCasts() {
		var hash = "";
		if (!firstCastsRender) {
			hash = md5(JSON.stringify(labels) + JSON.stringify(casts));
		}
		if (hash !== castsHash) {
			castsHash = hash;

			var template = _.template($("script.podcasts").html());
			$("#podcasts").empty().append(template({ labels: labels, casts: casts }));
			positionThumb();

			labels.root.forEach(function(label) {
				if (label.type === "label") {
					if (labels[label.id].expanded) {
						$("#label-" + label.id + " .content").show();
					}
				}
			});

			if (castScroll) {
				setTimeout(function() { castScroll.refresh(); }, 0);
			}
			else {
				castScroll = new IScroll('#foo', {
					mouseWheel: true,
					scrollbars: 'custom',
					keyBindings: true,
					interactiveScrollbars: true,
					click: true
				});
			}

			if (sessionStorage.selectedcast) {
				if (selectedCastId === null) {
					renderEpisodes(sessionStorage.selectedcast);
				}
				selectedCastId = sessionStorage.selectedcast;
				$("#cast-" + sessionStorage.selectedcast).addClass("current");
			}
			else if (sessionStorage.lastepisode) {
				var lastepisode = JSON.parse(sessionStorage.lastepisode);
				renderEpisodes(lastepisode.castid);
			}

			var n = {};
			for (var i in episodes) {
				var episode = episodes[i];
				if (episode.castid in n) {
					n[episode.castid]++;
				}
				else {
					n[episode.castid] = 1;
				}
			}

			for (var index in n) {
				$("#cast-" + index + " .n").html(n[index]);
			}

			if (addingFeed) {
				addingFeed = false;
				selectCast($("#podcasts > .cast:last-child").prop("id").split("-")[1]);
				setTimeout(function() {
					castScroll.scrollTo(0, castScroll.maxScrollY, 0); 
				}, 0);
			}

			if (firstCastsRender) {
				firstCastsRender = false;
				setTimeout(function() {
					castsHash = md5(JSON.stringify(labels) + JSON.stringify(casts));
				}, 0);
			}
		}
	}

	function selectCast(id) {
		selectedCastId = id;
		renderEpisodes(id);
		$(".cast").removeClass("current");
		$("#cast-" + id).addClass("current");
		sessionStorage.selectedcast = id;
	}

	function loadEpisodes() {
		if (!localStorage[uniqueName("since")]) {
			localStorage[uniqueName("since")] = 0;
		}
		console.log("fetching episodes since " + localStorage[uniqueName("since")]);
		$.get(apiRoot + "library/newepisodes", { since: localStorage[uniqueName("since")] }, function(res) {
			localStorage[uniqueName("since")] = res.timestamp;
			console.log(res.episodes.length + " episodes fetched");
			if (res.episodes.length > 0) {
				db.get("episodes", function(localEpisodes) {
					localEpisodes = localEpisodes || {};
					res.episodes.forEach(function(episode) {
						localEpisodes[episode.id] = episode;
					});
					db.put("episodes", localEpisodes);
				});

				res.episodes.forEach(function(episode) {
					episodes[episode.id] = episode;
					if (selectedCastId == episode.castid) {
						$("#episodes").prepend('<div id="ep-' + episode.id + '" class="episode">' + episode.feed.title + '<div class="delete">Delete</div></div>');
					}
				});
				if (selectedCastId == res.episodes[0].castid) {
					setTimeout(function() { episodeScroll.refresh(); }, 0);
				}
				if (addingFeed) {
					loadLabels();
				}
			}			
		});
	}

	function renderEpisodes(id) {
		var e = [];
		for (var x in episodes) {
			if (episodes[x].castid == id) {
				if (!(episodes[x].lastevent && episodes[x].lastevent.type == Event.Delete)) {
					e.push(episodes[x]);
				}
			}
		}

		e.sort(function(a, b) {
			var d1 = new Date(a.feed.pubDate);
			var d2 = new Date(b.feed.pubDate);
			if (d1 > d2) {
				return -1;
			}
			if (d1 < d2) {
				return 1;
			}
			return 0;
		});

		var template = _.template($("script.episodes").html());
		$("#episodes").empty().append(template({ episodes: e }));

		if (episodeScroll) {
			setTimeout(function() { episodeScroll.refresh(); }, 0);
		}
		else {
			episodeScroll = new IScroll('#foo2', {
				mouseWheel: true,
				scrollbars: 'custom',
				keyBindings: true,
				interactiveScrollbars: true,
				click: true
			});
		}
		
		updateEpisodeIndicators();

		if (sessionStorage.lastepisode) {
			var lastepisode = JSON.parse(sessionStorage.lastepisode);
			if (lastepisode.id in episodes) {
				playEpisode(lastepisode.id);
			}
			$("#ep-" + lastepisode.id).addClass("current");
		}
		else if (sessionStorage.selectedepisode) {
			loadEpisodeInfo(sessionStorage.selectedepisode);
			$("#ep-" + sessionStorage.selectedepisode).addClass("current");
		}
	}

	function loadSettings() {
		$.get(apiRoot + "account/settings", function(res) {
			settings = {};
			res.forEach(function(setting) {
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
					value: setting.value
				};
			});

			settings = $.extend(true, {}, DefaultSettings, settings);

			setKeybinds();
			renderSettings();

			if (idbReady) {
				db.put("settings", settings);
			}
			else {
				buffer.idb.settings = settings;
			}
		});
	}

	var settingsHash;
	var firstSettingsRender = true;

	function renderSettings(forceRender) {
		var hash = "";
		if (forceRender === undefined && !firstSettingsRender) {
			hash = md5(JSON.stringify(settings));
		}
		if (forceRender || hash !== settingsHash) {
			settingsHash = hash;

			$("#settings-menu").empty();
			$("#settings-panel").empty();
			for (var c in settings) {
				$("#settings-menu").append('<p class="setting-button" id="setting-' + c + '">' + c + '</p>');
				var panel = $('<div class="setting-panel" id="setting-panel-' + c + '"><h2>' + c + "</h2></div>");

				if (c === "General") {
					panel.append('<h3>OPML</h3><p><button class="button" id="import-opml">Import</button><input type="file" id="hax" style="display:none">' +
						'<button class="button" id="opml">Export</button></p>' +
						'<h3>Default settings</h3><button class="button" id="reset-settings">Reset</button>');
				}

				for (var s in settings[c]) {
					var id = c + "_" + s;
					var setting = settings[c][s];
					if (setting.type === Setting.Keybind) {
						panel.append("<p><label>" + s + '</label><input type="text" id="' + id + '" class="setting keybind" value="' + setting.value + '"></p>');
					}
					else if (setting.type === Setting.Bool) {
						panel.append("<p><label>" + s + '</label><input type="checkbox" id="' + id + '" class="setting"></p>');
						panel.find("#" + id).prop("checked", String(setting.value) == "true");
					}
					else {
						panel.append("<p><label>" + s + '</label><input type="text" id="' + id + '" class="setting" value="' + setting.value + '"></p>');
					}
				}

				$("#settings-panel").append(panel);
			}
			$("#setting-General").addClass("selected");
			$("#setting-panel-General").show();

			if (firstSettingsRender) {
				firstSettingsRender = false;
				setTimeout(function() {
					settingsHash = md5(JSON.stringify(settings));
				}, 0);
			}
		}
	}

	function saveSetting(key, value, category) {
		category = category || 'General'
		settings[category][key].value = value;
		settingsHash = md5(JSON.stringify(settings));
		buffer.settings[category + "/" + key] = value;
		db.put("buffer_settings", buffer.settings);
		flushSettings();
		db.put("settings", settings);

		if (category === "Keybinds") {
			setKeybinds();		
		}
	}

	function flushSettings() {
		$.post(apiRoot + "account/settings", buffer.settings, function() {
			buffer.settings = {};
			db.remove("buffer_settings");
		});
	}

	function resetSettings() {
		settings = DefaultSettings;
		for (var c in settings) {
			for (var s in settings[c]) {
				buffer.settings[c + "/" + s] = settings[c][s];
			}
		}
		db.put("buffer_settings", buffer.settings);
		flushSettings();
		db.put("settings", settings);

		renderSettings(true);
		setKeybinds();
	}

	function setKeybinds() {
		Mousetrap.reset();
		Mousetrap.bind(settings.Keybinds.PlayPause.value, playPauseToggle);
		Mousetrap.bind(settings.Keybinds.Next.value, nextEpisode);
		Mousetrap.bind(settings.Keybinds.Previous.value, previousEpisode);
		Mousetrap.bind(settings.Keybinds.SkipForward.value, skipForward);
		Mousetrap.bind(settings.Keybinds.SkipBack.value, skipBack);
	}

	function loadLabels() {
		$.get(apiRoot + "library/labels", function(res) {
			labels = {};
			res.forEach(function(label) {
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
			if (idbReady) {
				db.put("labels", labels);
			}
			else {
				buffer.idb.labels = labels;
			}
			loadCasts();
		});
	}

	function saveLabels() {
		var content = [];
		$("#podcasts > div").each(function(index, el) {
			content.push($(el).prop("id").replace("-", "/"));
		});

		$.ajax(apiRoot + "library/labels/" + rootLabelId, {
			type: "PUT",
			data: {
				content: content.join()
			}
		});

		$("#podcasts .label").each(function(index, el) {
			content = [];
			$(el).find(".cast").each(function(index, el) {
				content.push($(el).prop("id").replace("-", "/"));
			});

			$.ajax(apiRoot + "library/labels/" + $(el).prop("id").split("-")[1], {
				type: "PUT",
				data: {
					content: content.join(),
					expanded: $(el).find(".content").is(":visible")
				}
			});
		});
	}

	function loadEvents() {
		if (!localStorage[uniqueName("since-events")]) {
			localStorage[uniqueName("since-events")] = 0;
		}
		console.log("fetching events since " + localStorage[uniqueName("since-events")]);
		$.get(apiRoot + "library/events", { since: localStorage[uniqueName("since-events")], exclude_self: true }, function(res) {
			localStorage[uniqueName("since-events")] = res.timestamp;
			res.events.forEach(function(event) {
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
				event.name = Event[event.type];

				if (event.episodeid in episodes && (!episodes[event.episodeid].lastevent || event.clientts > episodes[event.episodeid].lastevent.clientts)) {
					episodes[event.episodeid].lastevent = event;
				}

				events.unshift(event);
			});

			if (res.events.length > 0) {
				events.sort(function(a, b) {
					if (a.clientts > b.clientts) {
						return -1;
					}
					if (a.clientts < b.clientts) {
						return 1;
					}

					if (a.concurrentorder > b.concurrentorder) {
						return -1;
					}
					if (a.concurrentorder < b.concurrentorder) {
						return 1;
					}
					return 0;
				});

				if (idbReady) {
					db.put("events", events);
				}
				else {
					buffer.idb.events = events;
				}

				if (selectedEpisodeId !== null) {
					renderEvents(selectedEpisodeId);
				}
			}
			console.log(res.events.length + " events fetched");
		});
	}

	function renderEvents(id) {
		var e = [];
		events.forEach(function(event) {
			if (event.episodeid == id) {
				e.push(event);
			}
		});
		var template = _.template($("script.events").html());
		$("#events").empty().append(template({ events: e }));
	}

	var paused = false;
	var ended = false;

	function playPauseToggle() {
		if (paused) {
			play();
		}
		else {
			pause();
		}
		if (poppedOut) {
			popoutMessage({
				action: "playPause"
			});
		}
	}

	function play() {
		if (Chromecast.running()) {
			Chromecast.play();
		}
		else {
			el("vid").play();
		}
		ended = false;
		paused = false;
		pushEvent(Event.Play);
		$(".button-play i").addClass("fa-pause");
		$(".button-play i").removeClass("fa-play");
		updateEpisodeIndicators();
		$("#episode-bar-play").html("Pause");
		$(".pretty-overlay").hide();
	}

	function pause() {
		if (Chromecast.running()) {
			Chromecast.pause();
		}
		else {
			el("vid").pause();
		}
		paused = true;
		pushEvent(Event.Pause);
		$(".button-play i").addClass("fa-play");
		$(".button-play i").removeClass("fa-pause");
		updateEpisodeIndicators();
		$("#episode-bar-play").html("Play");
		$(".pretty-overlay").show();
	}

	function seek(time) {
		console.log(time);
		if (poppedOut) {
			popoutMessage({
				action: "seek",
				time: time
			});
		}
		else {
			var video = el("vid");
			video.currentTime = time;
			Chromecast.seek(time);
		}
		var progress = 1 / currentEpisodeDuration * time;
		$("#seekbar div").css("width", $("#seekbar").width() * progress + "px");
	}

	function skipBack() {
		if (poppedOut) {
			popoutMessage({
				action: "skipBack"
			});
		}
		else {
			var video = el("vid");
			pushEvent(Event.Pause);
			video.currentTime = video.currentTime - 15;
			pushEvent(Event.Play);
			if (video.paused) {
				pushEvent(Event.Pause);
			}
		}
	}

	function skipForward() {
		if (poppedOut) {
			popoutMessage({
				action: "skipForward"
			});
		}
		else {
			var video = el("vid");
			pushEvent(Event.Pause);
			video.currentTime = video.currentTime + 15;
			pushEvent(Event.Play);
			if (video.paused) {
				pushEvent(Event.Pause);
			}
		}
	}

	function nextEpisode() {
		if (String(settings.Playback.KeepPlaying.value) == "true") {
			c++;
			if (c < q.length) {
				autoplay = true;
				playEpisode(q[c].id);
			}
		}
	}

	function previousEpisode() {
		console.log("previousEpisode called");
	}

	function toggleFullscreen() {
		var video = el("vid-container");
		if ($("#vid-container").hasClass("fs")) {
			document.webkitExitFullscreen();
			$("#playbar-fullscreen").removeClass("fa-compress").addClass("fa-expand");
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
			$("#playbar-fullscreen").removeClass("fa-expand").addClass("fa-compress");
		}
	}

	function getEpisodeImage(id) {
		return episodes[id].feed["media:thumbnail"] ? episodes[id].feed["media:thumbnail"].url : null ||
			episodes[id].feed["itunes:image"] ? episodes[id].feed["itunes:image"].href : null ||
			casts[episodes[id].castid].feed["itunes:image"] ? casts[episodes[id].castid].feed["itunes:image"].href : null ||
			casts[episodes[id].castid].feed.image ? casts[episodes[id].castid].feed.image.url : null;
	}

	function positionThumb() {
		if ($("#episodeinfo").isOverflowing()) {
			$("#vid-container.thumb").css("right", "15px");
		}
		else {
			$("#vid-container.thumb").css("right", "1px");
		}
	}

	function updateEpisodeIndicators() {
		$(".episode i").remove();
		for (var id in episodes) {
			var episode = episodes[id];
			if (id === currentEpisodeId && !ended) {
				if (videoLoading) {
					$("#ep-" + id).append('<i class="fa fa-spinner fa-spin"></i>');
				}
				else if (paused) {
					$("#ep-" + id).append('<i class="fa fa-pause"></i>');
				}
				else {
					$("#ep-" + id).append('<i class="fa fa-play"></i>');
				}
			}
			else if (episode.lastevent !== null) {				
				if (episode.lastevent.type == Event.EndOfTrack) {
					$("#ep-" + id).append('<i class="fa fa-circle progress"></i>');
				}
				else if (episode.lastevent.positionts > 0) {
					$("#ep-" + id).append('<i class="fa fa-circle-o progress"></i>');
				}
			}
		}
	}

	function popoutMessage(obj) {
		poppedOut.postMessage(JSON.stringify(obj), "*");
	}

	function padCastOverlay() {
		$("#cast-overlay").css("line-height", $("#cast-overlay").height() + "px");
	}

	function showContextMenu(id, target, e) {
		contextEpisodeID = $(target).prop("id").split("-")[1];

		$(id).css("left", e.pageX + "px");
		$(id).css("top", e.pageY + "px");
		$(".context-menu").hide();
		$(id).show();
		e.preventDefault();
	}

	function el(id) {
		return $("#" + id).get(0);
	}

	function unix() {
		return $.now() / 1000 | 0;
	}

	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}

	function uniqueName(name) {
		return username + "-" + name;
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

	Number.prototype.pad = function() {
		var str = this.toString();
		while (str.length < 2) {
			str = "0" + str;
		}
		return str;
	}

	$.fn.isOverflowing = function() {
	    var el = $(this).get(0);
	    var overflowing = false;
	    if (el.clientHeight < el.scrollHeight) {
	        overflowing = true;
	    }
	    return overflowing;
	}
}());
