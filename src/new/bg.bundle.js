/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var helpers_1 = __webpack_require__(1);
var stats_1 = __webpack_require__(7);
var logAction = function (tabId, parsedURL) {
    return stats_1.addBoost(tabId, parsedURL);
};
// redirect page resource to webboost resource
exports.redirect = function (url, tabId, parsedURL) {
    logAction(tabId, parsedURL);
    return { redirectUrl: helpers_1.js(url) };
};
// used for msvp blocking
// no resource will be loaded
exports.block = function (tabId, parsedURL) {
    logAction(tabId, parsedURL);
    return { cancel: true };
};
exports.ALLOW_REQUEST_TOKEN = { cancel: true };


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var url_1 = __webpack_require__(3);
exports.js = function (filename) {
    return chrome.extension.getURL(['/injectees/', filename].join(''));
};
exports.random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.$id = function (id) {
    return document.getElementById(id);
};
exports.not = function (fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return !fn.apply(void 0, args);
    };
};
exports.getUriFromTab = function (tab) {
    return url_1.parseURL(tab.url.replace(/#.*$/, '')).host;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.VERSION_TAG = /\$version\$/;
exports.NAME_TAG = /\$name\$/;
exports.URL_QUERY_TAG = /\?.+$/;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var configSyntax_1 = __webpack_require__(2);
var last = function (arr) { return arr[arr.length - 1]; };
exports.parseURL = function (url) {
    var splitted = url.split('://');
    var schema = splitted[0], path = splitted[1];
    var result = {
        schema: schema,
        uri: path.replace(configSyntax_1.URL_QUERY_TAG, ''),
        isExtension: false,
        host: '',
        library: ''
    };
    result.isExtension = result.schema === 'chrome-extension';
    var parsedLibrary = result.uri.split('/');
    var host = parsedLibrary[0];
    result.host = host;
    result.library = last(parsedLibrary);
    return result;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hash_check_1 = __webpack_require__(5);
var reg_check_1 = __webpack_require__(8);
var msvpCheck_1 = __webpack_require__(10);
var requestInterceptor_1 = __webpack_require__(0);
var url_1 = __webpack_require__(3);
var state_1 = __webpack_require__(11);
var checkers = [hash_check_1.check, reg_check_1.regCheck, msvpCheck_1.check];
// webpage-specific settings are stored in this object
var state = state_1.load();
// need to maintain listeners, because all already opened tabs will not be boosted otherwise...
// furthermore, all tabs with changed URLs will not be boosted...
// const tabListeners = {};
// // set listener for each created/reloaded tab
// // this is needed because tabId and website URL will not be available otherwise inside the listener
// chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
// 	// sync state on each refresh/creation to have less syncing penalty
// 	state = loadState();
// 	// if the page is reloaded and the URL is changed or it is a first installation of the extension...
// 	// tab object is IMMUTABLE, surprise surprise!
// 	// So, we need to add new listeners for a tab with a new URL...
// 	if ((change.status === 'loading') && (change.url || !tabListeners[tabId])) {
// 		if (tabListeners[tabId]) {
// 			chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
// 		}
// 		tabListeners[tabId] = checkUrl(tab);
// 		return chrome.webRequest.onBeforeRequest.addListener(
// 			checkUrl, {
// 			urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*'],
// 			tabId: tab.id
// 		},
// 			["blocking"]
// 		);
// 	}
// });
// // cleanup all those listeners
// chrome.tabs.onRemoved.addListener(function(tabId, removeObj) {
// 	chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
// 	return tabListeners[tabId] = null;
// });
// // First time impression
// chrome.runtime.onInstalled.addListener(function(details) {
// 	if (details.reason === 'install') {
// 		return chrome.tabs.create({url: 'https://www.facebook.com/WebBoostExtension/app/135876083099764/'});
// 	}});
var checkUrl = function (request) {
    if (request.method !== 'GET') {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
    var normalizedUrl = url_1.parseURL(request.url);
    // do nothing if boosting was disabled for given website
    var siteUrl = url_1.parseURL(request.initiator);
    if (__guard__(state.forHost(siteUrl.host), function (x) { return x.disabled; }) === true) {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
    for (var _i = 0, checkers_1 = checkers; _i < checkers_1.length; _i++) {
        var check = checkers_1[_i];
        var result = check(normalizedUrl, request.tabId);
        if ((result != null ? result.redirectUrl : undefined) || (result != null ? result.cancel : undefined)) {
            return result;
        }
    }
    return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
};
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
chrome.webRequest.onBeforeRequest.addListener(checkUrl, {
    urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*']
}, ["blocking"]);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hash_config_1 = __webpack_require__(6);
var requestInterceptor_1 = __webpack_require__(0);
var configSyntax_1 = __webpack_require__(2);
var comparisonHash = {};
var keys = Object.keys(hash_config_1.versions);
function check(normalizedUrl, tabId) {
    if (normalizedUrl.isExtension) {
        return;
    }
    var checkUrl = normalizedUrl.uri;
    // console.log('hash check', checkUrl)
    // url totally match the library + version + cdn address
    if (comparisonHash[checkUrl]) {
        normalizedUrl.boostedBy = 'hash';
        return requestInterceptor_1.redirect(comparisonHash[checkUrl], tabId, normalizedUrl);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
}
exports.check = check;
;
// fill in comparison map
keys.forEach(function (key) {
    var entry = hash_config_1.versions[key];
    if (entry.versions) {
        return entry.versions.forEach(function (version) {
            entry.urls.forEach(function (url) {
                var hashUrl = url.replace(configSyntax_1.VERSION_TAG, version);
                return comparisonHash[hashUrl] =
                    entry.file.replace(configSyntax_1.NAME_TAG, key).replace(configSyntax_1.VERSION_TAG, version);
            });
        });
    }
    else {
        return entry.urls.forEach(function (url) {
            comparisonHash[url] =
                entry.file.replace(configSyntax_1.NAME_TAG, key);
        });
    }
});
console.log('comparison hash in hash-check', comparisonHash);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.versions = {
    'jquery': {
        versions: [
            '2.2.2',
            '2.2.1',
            '2.2.0',
            '2.1.4',
            '2.1.3',
            '2.1.2',
            '2.1.1',
            '2.1.0',
            '2.0.3',
            '2.0.2',
            '2.0.1',
            '2.0.0',
            '1.11.3',
            '1.11.2',
            '1.11.1',
            '1.11.0',
            '1.10.2',
            '1.10.1',
            '1.10.0',
            '1.9.1',
            '1.9.0',
            '1.8.3',
            '1.8.2',
            '1.8.1',
            '1.8.0',
            '1.7.2',
            '1.7.1',
            '1.7.0',
            '1.6.4',
            '1.6.3',
            '1.6.2',
            '1.6.1',
            '1.6.0',
            '1.5.2',
            '1.5.1',
            '1.5.0',
            '1.4.4',
            '1.4.3',
            '1.4.2',
            '1.4.1'
        ],
        urls: [
            'ajax.googleapis.com/ajax/libs/jquery/$version$/jquery.min.js',
            'yandex.st/jquery/$version$/jquery.min.js',
            'cdn.jsdelivr.net/jquery/$version$/jquery.min.js',
            'ajax.aspnetcdn.com/ajax/jQuery/jquery-$version$.min.js',
            'cdnjs.cloudflare.com/ajax/libs/jquery/$version$/jquery.min.js',
            'code.jquery.com/jquery-$version$.min.js',
            'oss.maxcdn.com/jquery/$version$/jquery.min.js'
        ],
        file: '$name$/$version$/jquery.min.js'
    },
    // a special shorted version number of jquery
    'jquery-1': {
        versions: ['1'],
        urls: [
            'ajax.googleapis.com/ajax/libs/jquery/$version$/jquery.min.js',
            'yandex.st/jquery/$version$/jquery.min.js',
            'cdn.jsdelivr.net/jquery/$version$/jquery.min.js',
            'ajax.aspnetcdn.com/ajax/jQuery/jquery-$version$.min.js',
            'cdnjs.cloudflare.com/ajax/libs/jquery/$version$/jquery.min.js',
            'code.jquery.com/jquery-$version$.min.js'
        ],
        file: 'jquery/1.11.1/jquery.min.js'
    },
    'jquery-migrate': {
        versions: ['1.2.1'],
        urls: [
            'code.jquery.com/jquery-migrate-$version$.min.js'
        ],
        file: '$name$/$version$/jquery-migrate.min.js'
    },
    'jquery-latest': {
        urls: [
            'code.jquery.com/jquery.js'
        ],
        file: 'jquery/$name$.js'
    },
    'angular': {
        versions: [
            '1.2.14',
            '1.2.13',
            '1.2.12',
            '1.2.11',
            '1.2.10',
            '1.2.9',
            '1.2.8',
            '1.2.7',
            '1.2.6',
            '1.2.5',
            '1.2.4',
            '1.2.3',
            '1.2.2',
            '1.2.1',
            '1.2.0',
            '1.0.8',
            '1.0.7',
            '1.0.6',
            '1.0.5',
            '1.0.4',
            '1.0.3',
            '1.0.2',
            '1.0.1'
        ],
        urls: [
            'ajax.googleapis.com/ajax/libs/angularjs/$version$/angular.min.js'
        ],
        file: 'angular/$version$/angular.min.js'
    },
    'webfontloader': {
        versions: [
            '1.5.2',
            '1.5.0',
            '1.4.10',
            '1.4.8',
            '1.4.7',
            '1.4.6',
            '1.4.2',
            '1.3.0',
            '1.1.2',
            '1.1.1',
            '1.1.0',
            '1.0.31',
            '1.0.30',
            '1.0.29',
            '1.0.28',
            '1.0.27',
            '1.0.26',
            '1.0.25',
            '1.0.24',
            '1.0.23',
            '1.0.22',
            '1.0.21',
            '1.0.19',
            '1.0.18',
            '1.0.17',
            '1.0.16',
            '1.0.15',
            '1.0.14',
            '1.0.13',
            '1.0.12',
            '1.0.11',
            '1.0.10',
            '1.0.9',
            '1.0.6',
            '1.0.5',
            '1.0.4',
            '1.0.3',
            '1.0.2',
            '1.0.1',
            '1.0.0'
        ],
        urls: [
            'ajax.googleapis.com/ajax/libs/webfont/$version$/webfont.js'
        ],
        file: 'webfont/$version$/webfont.js'
    },
    'yandex': {
        urls: [
            'mc.yandex.ru/metrika/watch.js'
        ],
        file: 'yandex/yandex-watch.js'
    },
    'plusone': {
        urls: [
            'apis.google.com/js/plusone.js'
        ],
        file: 'google/plusone.js'
    },
    'plusone-new': {
        urls: [
            'apis.google.com/js/platform.js'
        ],
        file: 'google/platform.js'
    },
    'twitter-client': {
        urls: [
            'platform.twitter.com/js/tfw/hub/client.js'
        ],
        file: 'twitter/client.js'
    },
    'facebook': {
        urls: [
            'connect.facebook.net/en_US/all.js'
        ],
        file: 'facebook/all.js'
    },
    'swfobject': {
        versions: ['2.2', '2.1'],
        urls: [
            'cdnjs.cloudflare.com/ajax/libs/swfobject/$version$/swfobject.js',
            'ajax.googleapis.com/ajax/libs/swfobject/$version$/swfobject.js',
            'yandex.st/swfobject/$version$/swfobject.min.js'
        ],
        file: 'swfobject/$version$/swfobject.js'
    },
    'bootstrap-min-js': {
        versions: ['2.1.1', '2.1.0', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/js/bootstrap.min.js',
            'netdna.bootstrapcdn.com/bootstrap/$version$/js/bootstrap.min.js',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/js/bootstrap.min.js',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/js/bootstrap.min.js'
        ],
        file: 'bootstrap/$version$/js/bootstrap.min.js'
    },
    'bootstrap-js': {
        versions: ['2.1.0', '2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/js/bootstrap.js',
            'netdna.bootstrapcdn.com/bootstrap/$version$/js/bootstrap.js',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/js/bootstrap.js',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/js/bootstrap.js'
        ],
        file: 'bootstrap/$version$/js/bootstrap.js'
    },
    'bootstrap-min-css': {
        versions: ['2.1.0', '2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap.min.css'
    },
    'bootstrap-css': {
        versions: ['2.1.0', '2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap.css'
    },
    'bootstrap-theme-min-css': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-theme.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-theme.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-theme.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-theme.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-theme.min.css'
    },
    'bootstrap-theme-css': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-theme.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-theme.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-theme.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-theme.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-theme.css'
    },
    'bootstrap-glyphicons-css': {
        versions: ['3.0.0'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-glyphicons.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-glyphicons.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-glyphicons.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-glyphicons.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-glyphicons.css'
    },
    'bootstrap-fonts-glyphicons-eot': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.eot',
            'netdna.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.eot',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.eot',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.eot'
        ],
        file: 'bootstrap/$version$/fonts/glyphicons-halflings-regular.eot'
    },
    'bootstrap-fonts-glyphicons-svg': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.svg',
            'netdna.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.svg',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.svg',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.svg'
        ],
        file: 'bootstrap/$version$/fonts/glyphicons-halflings-regular.svg'
    },
    'bootstrap-fonts-glyphicons-ttf': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.ttf',
            'netdna.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.ttf',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.ttf',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.ttf'
        ],
        file: 'bootstrap/$version$/fonts/glyphicons-halflings-regular.ttf'
    },
    'bootstrap-fonts-glyphicons-woff': {
        versions: ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.3.1', '3.3.2', '3.3.4', '3.3.5', '3.3.6'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.woff',
            'netdna.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.woff',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/fonts/glyphicons-halflings-regular.woff',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/fonts/glyphicons-halflings-regular.woff'
        ],
        file: 'bootstrap/$version$/fonts/glyphicons-halflings-regular.woff'
    },
    'old-bootstrap-responsive-css': {
        versions: ['2.1.1', '2.2.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-responsive.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-responsive.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-responsive.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-responsive.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-responsive.css'
    },
    'old-bootstrap-responsive-min-css': {
        versions: ['2.1.1', '2.2.1', '2.2.2', '2.3.0', '2.3.1'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-responsive.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-responsive.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-responsive.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-responsive.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-responsive.min.css'
    },
    'old-bootstrap-min-nr-css': {
        versions: ['2.1.0', '2.2.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.min.nr.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.min.nr.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.min.nr.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.min.nr.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap.min.nr.css'
    },
    'old-bootstrap-no-icons-min-css': {
        versions: ['2.1.0', '2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '3.0.0'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.no-icons.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.no-icons.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap.no-icons.min.css'
    },
    'old-bootstrap-combined-min-css': {
        versions: ['2.1.0', '2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-combined.min.css'
    },
    'old-bootstrap-combined-for-cwd-min-css': {
        versions: ['2.1.1'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined-for-cwd.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined-for-cwd.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined-for-cwd.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined-for-cwd.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-combined-for-cwd.min.css'
    },
    'old-bootstrap-combined-no-icon-css': {
        versions: ['2.3.0', '2.3.1', '2.3.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined.no-icons.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap-combined.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap-combined.no-icons.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap-combined.no-icons.min.css'
    },
    'old-bootstrap-no-responsive-no-icons-css': {
        versions: ['2.1.1', '2.2.0', '2.2.1', '2.3.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.no-responsive.no-icons.min.css',
            'netdna.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.no-responsive.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/css/bootstrap.no-responsive.no-icons.min.css',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/css/bootstrap.no-responsive.no-icons.min.css'
        ],
        file: 'bootstrap/$version$/css/bootstrap.no-responsive.no-icons.min.css'
    },
    'old-bootstrap-img': {
        versions: ['2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/img/glyphicons-halflings.png',
            'netdna.bootstrapcdn.com/bootstrap/$version$/img/glyphicons-halflings.png',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/img/glyphicons-halflings.png',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/img/glyphicons-halflings.png'
        ],
        file: 'bootstrap/$version$/img/glyphicons-halflings.png'
    },
    'old-bootstrap-img-white': {
        versions: ['2.1.1', '2.2.0', '2.2.1', '2.2.2', '2.3.0', '2.3.1', '2.3.2'],
        urls: [
            'netdna.bootstrapcdn.com/twitter-bootstrap/$version$/img/glyphicons-halflings-white.png',
            'netdna.bootstrapcdn.com/bootstrap/$version$/img/glyphicons-halflings-white.png',
            'maxcdn.bootstrapcdn.com/twitter-bootstrap/$version$/img/glyphicons-halflings-white.png',
            'maxcdn.bootstrapcdn.com/bootstrap/$version$/img/glyphicons-halflings-white.png'
        ],
        file: 'bootstrap/$version$/img/glyphicons-halflings-white.png'
    },
    'font-awesome': {
        versions: ['3.2.1', '4.0.0'],
        urls: [
            'netdna.bootstrapcdn.com/font-awesome/$version$/css/font-awesome.css'
        ],
        file: 'font-awesome/$version$/css/font-awesome-4.0.0.css'
    },
    // google fonts
    'arimo_6yxuWfvvwL6sRuuLVujCo4DGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/6yxuWfvvwL6sRuuLVujCo4DGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/6yxuWfvvwL6sRuuLVujCo4DGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_pZWmmfuKiSKRuR8DZvlbR4DGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/pZWmmfuKiSKRuR8DZvlbR4DGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/pZWmmfuKiSKRuR8DZvlbR4DGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_B75qyz4dRW0ik816V7jBnIDGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/B75qyz4dRW0ik816V7jBnIDGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/B75qyz4dRW0ik816V7jBnIDGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_kazQtCHILhg0dazJeX7tgoDGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/kazQtCHILhg0dazJeX7tgoDGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/kazQtCHILhg0dazJeX7tgoDGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_C9D0NKNOeY121NaeSHhbhoDGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/C9D0NKNOeY121NaeSHhbhoDGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/C9D0NKNOeY121NaeSHhbhoDGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_1UbnmhyD_WWKr8RP-sOOGIDGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/1UbnmhyD_WWKr8RP-sOOGIDGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/1UbnmhyD_WWKr8RP-sOOGIDGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_TiQL6NBhTEJ6MIQRmGAWSIDGDUGfDkXyfkzVDelzfFk.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/TiQL6NBhTEJ6MIQRmGAWSIDGDUGfDkXyfkzVDelzfFk.woff2'],
        file: 'google-fonts/TiQL6NBhTEJ6MIQRmGAWSIDGDUGfDkXyfkzVDelzfFk.woff2'
    },
    'arimo_Gy9Y2XtPh2ochAQDpqJXSaCWcynf_cDxXwCLxiixG1c.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/Gy9Y2XtPh2ochAQDpqJXSaCWcynf_cDxXwCLxiixG1c.woff2'],
        file: 'google-fonts/Gy9Y2XtPh2ochAQDpqJXSaCWcynf_cDxXwCLxiixG1c.woff2'
    },
    'arimo_ar6XjGD_YvbpY9XD5YxKTBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/ar6XjGD_YvbpY9XD5YxKTBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/ar6XjGD_YvbpY9XD5YxKTBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_XzFO_hPcAZmADxw_2htokBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/XzFO_hPcAZmADxw_2htokBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/XzFO_hPcAZmADxw_2htokBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_Tq4Zh2K0uru54pu6hyua9BkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/Tq4Zh2K0uru54pu6hyua9BkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/Tq4Zh2K0uru54pu6hyua9BkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_gRIQMcBGUlcKSvTGaO9yHBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/gRIQMcBGUlcKSvTGaO9yHBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/gRIQMcBGUlcKSvTGaO9yHBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_Jg7MGeIJdVGhHqsyezM8VRkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/Jg7MGeIJdVGhHqsyezM8VRkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/Jg7MGeIJdVGhHqsyezM8VRkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_u0Tw4Txbkc9Av4uzN1j1aBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/u0Tw4Txbkc9Av4uzN1j1aBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/u0Tw4Txbkc9Av4uzN1j1aBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_XCmwOdi6K62tkWaszbVGURkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/XCmwOdi6K62tkWaszbVGURkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/XCmwOdi6K62tkWaszbVGURkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'arimo_27rE5lMk9EHpLbxiIuGd0HYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/27rE5lMk9EHpLbxiIuGd0HYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/27rE5lMk9EHpLbxiIuGd0HYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'arimo_AFEZQGBTVzQAOca-d2aFjlKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/AFEZQGBTVzQAOca-d2aFjlKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/AFEZQGBTVzQAOca-d2aFjlKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_WvX0Hvnp0ab_LpSwFJ-Ft1KPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/WvX0Hvnp0ab_LpSwFJ-Ft1KPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/WvX0Hvnp0ab_LpSwFJ-Ft1KPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_GwEATBwKE9TtvcxzdRl6WVKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/GwEATBwKE9TtvcxzdRl6WVKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/GwEATBwKE9TtvcxzdRl6WVKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_AEtOwtkcrUgdQHjpq-J-i1KPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/AEtOwtkcrUgdQHjpq-J-i1KPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/AEtOwtkcrUgdQHjpq-J-i1KPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_mlh1wyApxlFze-hZpZUTb1KPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/mlh1wyApxlFze-hZpZUTb1KPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/mlh1wyApxlFze-hZpZUTb1KPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo__jbpmE8Amw6YpMlbV5tlzFKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/_jbpmE8Amw6YpMlbV5tlzFKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/_jbpmE8Amw6YpMlbV5tlzFKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_rePj-_zTOi68vu4BGKjdq1KPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/rePj-_zTOi68vu4BGKjdq1KPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/rePj-_zTOi68vu4BGKjdq1KPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'arimo_YRSaxNZPMAFvgZMzEY-jfwLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/YRSaxNZPMAFvgZMzEY-jfwLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/YRSaxNZPMAFvgZMzEY-jfwLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'arimo_PMX17CJABUi39laGALqdRgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/PMX17CJABUi39laGALqdRgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/PMX17CJABUi39laGALqdRgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_6aR2_U6-nh1z2xBBolNEYAsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/6aR2_U6-nh1z2xBBolNEYAsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/6aR2_U6-nh1z2xBBolNEYAsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_Ua7ZUxBHMVlxaKDIh8-XpQsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/Ua7ZUxBHMVlxaKDIh8-XpQsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/Ua7ZUxBHMVlxaKDIh8-XpQsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_4-AJwEhISSAzst5fATLUFwsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/4-AJwEhISSAzst5fATLUFwsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/4-AJwEhISSAzst5fATLUFwsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_Cd_dBMlEC9DuDie98bhp5wsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/Cd_dBMlEC9DuDie98bhp5wsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/Cd_dBMlEC9DuDie98bhp5wsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_twKtDH0n_vHUmzdHOWAskQsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/twKtDH0n_vHUmzdHOWAskQsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/twKtDH0n_vHUmzdHOWAskQsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo_cxbOUSTgtyl7V_qnBf4BYwsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/cxbOUSTgtyl7V_qnBf4BYwsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/cxbOUSTgtyl7V_qnBf4BYwsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'arimo__K7sg-ijHdmkwPzV9FiqaAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/arimo/v9/_K7sg-ijHdmkwPzV9FiqaAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/_K7sg-ijHdmkwPzV9FiqaAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'bitter_VyzH0eNzfhxMjuJ3chtK7H-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/VyzH0eNzfhxMjuJ3chtK7H-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/VyzH0eNzfhxMjuJ3chtK7H-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'bitter_HEpP8tJXlWaYHimsnXgfCOvvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/HEpP8tJXlWaYHimsnXgfCOvvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/HEpP8tJXlWaYHimsnXgfCOvvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'bitter_JGVZEP92dXgoQBG1CnQcfIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/JGVZEP92dXgoQBG1CnQcfIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/JGVZEP92dXgoQBG1CnQcfIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'bitter_evC1haE-MsorTl_A7_uSGZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/evC1haE-MsorTl_A7_uSGZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/evC1haE-MsorTl_A7_uSGZBw1xU1rKptJj_0jans920.woff2'
    },
    'bitter_PX9NwOMMeyM1S_WWulmbfhkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/PX9NwOMMeyM1S_WWulmbfhkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/PX9NwOMMeyM1S_WWulmbfhkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'bitter_-t3SK6sofTjAH0MNf_tLaHYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/bitter/v7/-t3SK6sofTjAH0MNf_tLaHYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/-t3SK6sofTjAH0MNf_tLaHYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'droidsans_s-BiyweUPV0v-yRb-cjciAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/droidsans/v6/s-BiyweUPV0v-yRb-cjciAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/s-BiyweUPV0v-yRb-cjciAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'droidsans_EFpQQyG9GqCrobXxL-KRMWaVI6zN22yiurzcBKxPjFE.woff2': {
        urls: ['fonts.gstatic.com/s/droidsans/v6/EFpQQyG9GqCrobXxL-KRMWaVI6zN22yiurzcBKxPjFE.woff2'],
        file: 'google-fonts/EFpQQyG9GqCrobXxL-KRMWaVI6zN22yiurzcBKxPjFE.woff2'
    },
    'droidserif_0AKsP294HTD-nvJgucYTaIgp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/droidserif/v6/0AKsP294HTD-nvJgucYTaIgp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/0AKsP294HTD-nvJgucYTaIgp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'droidserif_QQt14e8dY39u-eYBZmppwf79_ZuUxCigM2DespTnFaw.woff2': {
        urls: ['fonts.gstatic.com/s/droidserif/v6/QQt14e8dY39u-eYBZmppwf79_ZuUxCigM2DespTnFaw.woff2'],
        file: 'google-fonts/QQt14e8dY39u-eYBZmppwf79_ZuUxCigM2DespTnFaw.woff2'
    },
    'droidserif_cj2hUnSRBhwmSPr9kS589weOulFbQKHxPa89BaxZzA0.woff2': {
        urls: ['fonts.gstatic.com/s/droidserif/v6/cj2hUnSRBhwmSPr9kS589weOulFbQKHxPa89BaxZzA0.woff2'],
        file: 'google-fonts/cj2hUnSRBhwmSPr9kS589weOulFbQKHxPa89BaxZzA0.woff2'
    },
    'droidserif_c92rD_x0V1LslSFt3-QEpsyRwA4nzNmLFN68bwzDkMk.woff2': {
        urls: ['fonts.gstatic.com/s/droidserif/v6/c92rD_x0V1LslSFt3-QEpsyRwA4nzNmLFN68bwzDkMk.woff2'],
        file: 'google-fonts/c92rD_x0V1LslSFt3-QEpsyRwA4nzNmLFN68bwzDkMk.woff2'
    },
    'fjallaone_SHXJdWnWW6HDq-6DpcG8PwsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/fjallaone/v4/SHXJdWnWW6HDq-6DpcG8PwsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/SHXJdWnWW6HDq-6DpcG8PwsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'fjallaone_rxxXUYj4oZ6Q5oDJFtEd6gzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/fjallaone/v4/rxxXUYj4oZ6Q5oDJFtEd6gzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/rxxXUYj4oZ6Q5oDJFtEd6gzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'indieflower_10JVD_humAd5zP2yrFqw6hampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/indieflower/v8/10JVD_humAd5zP2yrFqw6hampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/10JVD_humAd5zP2yrFqw6hampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'lato_h3_FseZLI76g1To6meQ4zX-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/h3_FseZLI76g1To6meQ4zX-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/h3_FseZLI76g1To6meQ4zX-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'lato_ifRS04pY1nJBsu8-cUFUS-vvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/ifRS04pY1nJBsu8-cUFUS-vvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/ifRS04pY1nJBsu8-cUFUS-vvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'lato_IY9HZVvI1cMoAHxvl0w9LVKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/IY9HZVvI1cMoAHxvl0w9LVKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/IY9HZVvI1cMoAHxvl0w9LVKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lato_22JRxvfANxSmnAhzbFH8PgLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/22JRxvfANxSmnAhzbFH8PgLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/22JRxvfANxSmnAhzbFH8PgLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'lato_8qcEw_nrk_5HEcCpYdJu8BTbgVql8nDJpwnrE27mub0.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/8qcEw_nrk_5HEcCpYdJu8BTbgVql8nDJpwnrE27mub0.woff2'],
        file: 'google-fonts/8qcEw_nrk_5HEcCpYdJu8BTbgVql8nDJpwnrE27mub0.woff2'
    },
    'lato_MDadn8DQ_3oT6kvnUq_2r_esZW2xOQ-xsNqO47m55DA.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/MDadn8DQ_3oT6kvnUq_2r_esZW2xOQ-xsNqO47m55DA.woff2'],
        file: 'google-fonts/MDadn8DQ_3oT6kvnUq_2r_esZW2xOQ-xsNqO47m55DA.woff2'
    },
    'lato_rZPI2gHXi8zxUjnybc2ZQFKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/rZPI2gHXi8zxUjnybc2ZQFKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/rZPI2gHXi8zxUjnybc2ZQFKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lato_MgNNr5y1C_tIEuLEmicLmwLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/MgNNr5y1C_tIEuLEmicLmwLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/MgNNr5y1C_tIEuLEmicLmwLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'lato_t85RP2zhSdDjt5PhsT_SnlKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/t85RP2zhSdDjt5PhsT_SnlKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/t85RP2zhSdDjt5PhsT_SnlKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lato_lEjOv129Q3iN1tuqWOeRBgLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/lEjOv129Q3iN1tuqWOeRBgLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/lEjOv129Q3iN1tuqWOeRBgLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'lato_muRcAtdNYlnTj3NeuakxChkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/muRcAtdNYlnTj3NeuakxChkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/muRcAtdNYlnTj3NeuakxChkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'lato_9TBVFLzQ3GUZLG8FZ4yrEXYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/9TBVFLzQ3GUZLG8FZ4yrEXYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/9TBVFLzQ3GUZLG8FZ4yrEXYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'lato_XNVd6tsqi9wmKNvnh5HNEIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/XNVd6tsqi9wmKNvnh5HNEIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/XNVd6tsqi9wmKNvnh5HNEIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'lato_2HG_tEPiQ4Z6795cGfdivJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/2HG_tEPiQ4Z6795cGfdivJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/2HG_tEPiQ4Z6795cGfdivJBw1xU1rKptJj_0jans920.woff2'
    },
    'lato_cT2GN3KRBUX69GVJ2b2hxn-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/cT2GN3KRBUX69GVJ2b2hxn-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/cT2GN3KRBUX69GVJ2b2hxn-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'lato_1KWMyx7m-L0fkQGwYhWwuuvvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/1KWMyx7m-L0fkQGwYhWwuuvvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/1KWMyx7m-L0fkQGwYhWwuuvvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'lato_AcvTq8Q0lyKKNxRlL28Rn4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/AcvTq8Q0lyKKNxRlL28Rn4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/AcvTq8Q0lyKKNxRlL28Rn4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'lato_HkF_qI1x_noxlxhrhMQYEJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYEJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/HkF_qI1x_noxlxhrhMQYEJBw1xU1rKptJj_0jans920.woff2'
    },
    'lato_81X-1TO5y4aMK2PPy9kFw4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/81X-1TO5y4aMK2PPy9kFw4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/81X-1TO5y4aMK2PPy9kFw4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'lato_VNUH7ZAcagYBWsAiBBCEY5Bw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/lato/v11/VNUH7ZAcagYBWsAiBBCEY5Bw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/VNUH7ZAcagYBWsAiBBCEY5Bw1xU1rKptJj_0jans920.woff2'
    },
    'lobster_MeFZ5NpSE1j8mC06Jh1miFKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lobster/v15/MeFZ5NpSE1j8mC06Jh1miFKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/MeFZ5NpSE1j8mC06Jh1miFKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lobster_UKmFXcLnvG78k2CT5LYRfFKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lobster/v15/UKmFXcLnvG78k2CT5LYRfFKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/UKmFXcLnvG78k2CT5LYRfFKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lobster_MCZn_h27nLxWmTqnbmnb3lKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lobster/v15/MCZn_h27nLxWmTqnbmnb3lKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/MCZn_h27nLxWmTqnbmnb3lKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lobster_G6-OYdAAwU5fSlE7MlBvhQLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/lobster/v15/G6-OYdAAwU5fSlE7MlBvhQLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/G6-OYdAAwU5fSlE7MlBvhQLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'lora_XXbc_aQtUtjJrkp7pYGEKhTbgVql8nDJpwnrE27mub0.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/XXbc_aQtUtjJrkp7pYGEKhTbgVql8nDJpwnrE27mub0.woff2'],
        file: 'google-fonts/XXbc_aQtUtjJrkp7pYGEKhTbgVql8nDJpwnrE27mub0.woff2'
    },
    'lora_tHQOv8O1rd82EIrTHlzvmhTbgVql8nDJpwnrE27mub0.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/tHQOv8O1rd82EIrTHlzvmhTbgVql8nDJpwnrE27mub0.woff2'],
        file: 'google-fonts/tHQOv8O1rd82EIrTHlzvmhTbgVql8nDJpwnrE27mub0.woff2'
    },
    'lora_rAXKWvABQNHjPUk26ixVvvesZW2xOQ-xsNqO47m55DA.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/rAXKWvABQNHjPUk26ixVvvesZW2xOQ-xsNqO47m55DA.woff2'],
        file: 'google-fonts/rAXKWvABQNHjPUk26ixVvvesZW2xOQ-xsNqO47m55DA.woff2'
    },
    'lora_yNp9UcngimMxgyQxKMt1QVKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/yNp9UcngimMxgyQxKMt1QVKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/yNp9UcngimMxgyQxKMt1QVKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lora_sNDli5YcfijR40K0xz3mZVKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/sNDli5YcfijR40K0xz3mZVKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/sNDli5YcfijR40K0xz3mZVKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'lora_mlTYdpdDwCepOR2s5kS2CwLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/mlTYdpdDwCepOR2s5kS2CwLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/mlTYdpdDwCepOR2s5kS2CwLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'lora_fCoJt7FyRSVNwXkC_nvEPX-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/fCoJt7FyRSVNwXkC_nvEPX-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/fCoJt7FyRSVNwXkC_nvEPX-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'lora_sGaC9t9HYN4ok_W_UWzQF3-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/sGaC9t9HYN4ok_W_UWzQF3-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/sGaC9t9HYN4ok_W_UWzQF3-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'lora__MYF_5lLoOGnzKiQsUc_vevvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/_MYF_5lLoOGnzKiQsUc_vevvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/_MYF_5lLoOGnzKiQsUc_vevvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'lora_66KG1MDzU5Zo36weZ_yx-YX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/66KG1MDzU5Zo36weZ_yx-YX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/66KG1MDzU5Zo36weZ_yx-YX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'lora_1wR3aOJ69QwyZ9B-WDmIqYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/1wR3aOJ69QwyZ9B-WDmIqYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/1wR3aOJ69QwyZ9B-WDmIqYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'lora__IxjUs2lbQSu0MyFEAfa7ZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/lora/v9/_IxjUs2lbQSu0MyFEAfa7ZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/_IxjUs2lbQSu0MyFEAfa7ZBw1xU1rKptJj_0jans920.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6nrsKtFnhOiVZh9MDlvO1Vys.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6nrsKtFnhOiVZh9MDlvO1Vys.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6nrsKtFnhOiVZh9MDlvO1Vys.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6nkZRWJQ0UjzR2Uv6RollX_g.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6nkZRWJQ0UjzR2Uv6RollX_g.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6nkZRWJQ0UjzR2Uv6RollX_g.woff2'
    },
    'merriweather_RFda8w1V0eDZheqfcyQ4EIjoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/RFda8w1V0eDZheqfcyQ4EIjoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/RFda8w1V0eDZheqfcyQ4EIjoYw3YTyktCCer_ilOlhE.woff2'
    },
    'merriweather_RFda8w1V0eDZheqfcyQ4EBampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/RFda8w1V0eDZheqfcyQ4EBampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/RFda8w1V0eDZheqfcyQ4EBampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6nkqWMeizceScn2Xpn1ZpsKI.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6nkqWMeizceScn2Xpn1ZpsKI.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6nkqWMeizceScn2Xpn1ZpsKI.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6nshHwsiXhsDb0smKjAA7Bek.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6nshHwsiXhsDb0smKjAA7Bek.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6nshHwsiXhsDb0smKjAA7Bek.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6nhAfvtEF4ZyB_l2hMK8g8Ds.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6nhAfvtEF4ZyB_l2hMK8g8Ds.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6nhAfvtEF4ZyB_l2hMK8g8Ds.woff2'
    },
    'merriweather_ZvcMqxEwPfh2qDWBPxn6noQ7a4ChFTJXKOvSywU5K9Q.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/ZvcMqxEwPfh2qDWBPxn6noQ7a4ChFTJXKOvSywU5K9Q.woff2'],
        file: 'google-fonts/ZvcMqxEwPfh2qDWBPxn6noQ7a4ChFTJXKOvSywU5K9Q.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwIFPx9KgpCoczUSdnmwUGkhk.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwIFPx9KgpCoczUSdnmwUGkhk.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwIFPx9KgpCoczUSdnmwUGkhk.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwIB0ue0Sk5cwvYx5tGiUAApw.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwIB0ue0Sk5cwvYx5tGiUAApw.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwIB0ue0Sk5cwvYx5tGiUAApw.woff2'
    },
    'merriweather_So5lHxHT37p2SS4-t60SlLbeiSZn9gAT0uu8FgUa5kU.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/So5lHxHT37p2SS4-t60SlLbeiSZn9gAT0uu8FgUa5kU.woff2'],
        file: 'google-fonts/So5lHxHT37p2SS4-t60SlLbeiSZn9gAT0uu8FgUa5kU.woff2'
    },
    'merriweather_So5lHxHT37p2SS4-t60SlGfrnYWAzH6tTbHZfcsRIsM.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/So5lHxHT37p2SS4-t60SlGfrnYWAzH6tTbHZfcsRIsM.woff2'],
        file: 'google-fonts/So5lHxHT37p2SS4-t60SlGfrnYWAzH6tTbHZfcsRIsM.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwIFMxop41rUAeuGQqDMZDGyg.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwIFMxop41rUAeuGQqDMZDGyg.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwIFMxop41rUAeuGQqDMZDGyg.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwIFh3o8VkC1exAYQ700cRowo.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwIFh3o8VkC1exAYQ700cRowo.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwIFh3o8VkC1exAYQ700cRowo.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwIFnykpnEl_qi3sJ0Elge17A.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwIFnykpnEl_qi3sJ0Elge17A.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwIFnykpnEl_qi3sJ0Elge17A.woff2'
    },
    'merriweather_EYh7Vl4ywhowqULgRdYwILZYYHiK7MQWKA3oxaVNfbE.woff2': {
        urls: ['fonts.gstatic.com/s/merriweather/v8/EYh7Vl4ywhowqULgRdYwILZYYHiK7MQWKA3oxaVNfbE.woff2'],
        file: 'google-fonts/EYh7Vl4ywhowqULgRdYwILZYYHiK7MQWKA3oxaVNfbE.woff2'
    },
    'montserrat_zhcz-_WihjSQC0oHJ9TCYAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/montserrat/v6/zhcz-_WihjSQC0oHJ9TCYAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/zhcz-_WihjSQC0oHJ9TCYAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'montserrat_IQHow_FEYlDC4Gzy_m8fcmaVI6zN22yiurzcBKxPjFE.woff2': {
        urls: ['fonts.gstatic.com/s/montserrat/v6/IQHow_FEYlDC4Gzy_m8fcmaVI6zN22yiurzcBKxPjFE.woff2'],
        file: 'google-fonts/IQHow_FEYlDC4Gzy_m8fcmaVI6zN22yiurzcBKxPjFE.woff2'
    },
    'notosans_C7bP6N8yXZ-PGLzbFLtQKYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/C7bP6N8yXZ-PGLzbFLtQKYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/C7bP6N8yXZ-PGLzbFLtQKYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_iLJc6PpCnnbQjYc1Jq4v04X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/iLJc6PpCnnbQjYc1Jq4v04X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/iLJc6PpCnnbQjYc1Jq4v04X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_5pCv5Yz4eMu9gmvX8nNhfYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/5pCv5Yz4eMu9gmvX8nNhfYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/5pCv5Yz4eMu9gmvX8nNhfYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_gEkd0pn-sMtQ_P4HUpi6WIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/gEkd0pn-sMtQ_P4HUpi6WIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/gEkd0pn-sMtQ_P4HUpi6WIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_iPF-u8L1qkTPHaKjvXERn4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/iPF-u8L1qkTPHaKjvXERn4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/iPF-u8L1qkTPHaKjvXERn4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_mTzVK0-EJOCaJiOPeaz-h4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/mTzVK0-EJOCaJiOPeaz-h4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/mTzVK0-EJOCaJiOPeaz-h4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_erE3KsIWUumgD1j_Ca-V-4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/erE3KsIWUumgD1j_Ca-V-4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/erE3KsIWUumgD1j_Ca-V-4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'notosans_LeFlHvsZjXu2c3ZRgBq9nJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/LeFlHvsZjXu2c3ZRgBq9nJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/LeFlHvsZjXu2c3ZRgBq9nJBw1xU1rKptJj_0jans920.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1w7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1w7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1w7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1xdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1xdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1xdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1yGUML8f7tzeB6gGvgki0bE.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1yGUML8f7tzeB6gGvgki0bE.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1yGUML8f7tzeB6gGvgki0bE.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ156vnaPZw6nYDxM4SVEMFKg.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ156vnaPZw6nYDxM4SVEMFKg.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ156vnaPZw6nYDxM4SVEMFKg.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1_y1_HTwRwgtl1cPga3Fy3Y.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1_y1_HTwRwgtl1cPga3Fy3Y.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1_y1_HTwRwgtl1cPga3Fy3Y.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1_grLsWo7Jk1KvZser0olKY.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1_grLsWo7Jk1KvZser0olKY.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1_grLsWo7Jk1KvZser0olKY.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ14joYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ14joYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ14joYw3YTyktCCer_ilOlhE.woff2'
    },
    'notosans_PIbvSEyHEdL91QLOQRnZ1xampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/PIbvSEyHEdL91QLOQRnZ1xampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/PIbvSEyHEdL91QLOQRnZ1xampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4PZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4PZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4PZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4F4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4F4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4F4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4Pkqa6bqz2MWWNAbes-nCbE.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4Pkqa6bqz2MWWNAbes-nCbE.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4Pkqa6bqz2MWWNAbes-nCbE.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4FBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4FBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4FBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4At_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4At_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4At_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4NDiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4NDiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4NDiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4KE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4KE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4KE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'notosans_ByLA_FLEa-16SpQuTcQn4Igp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/ByLA_FLEa-16SpQuTcQn4Igp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/ByLA_FLEa-16SpQuTcQn4Igp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDgXaAXup5mZlfK6xRLrhsco.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDgXaAXup5mZlfK6xRLrhsco.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDgXaAXup5mZlfK6xRLrhsco.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDlx-M1I1w5OMiqnVF8xBLhU.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDlx-M1I1w5OMiqnVF8xBLhU.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDlx-M1I1w5OMiqnVF8xBLhU.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDqQr5kLUZ00oRH1V4iZRmWo.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDqQr5kLUZ00oRH1V4iZRmWo.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDqQr5kLUZ00oRH1V4iZRmWo.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDlT7aJLK6nKpn36IMwTcMMc.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDlT7aJLK6nKpn36IMwTcMMc.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDlT7aJLK6nKpn36IMwTcMMc.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDgn6Wqxo-xwxilDXPU8chVU.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDgn6Wqxo-xwxilDXPU8chVU.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDgn6Wqxo-xwxilDXPU8chVU.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDsbIQSYZnWLaWC9QNCpTK_U.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDsbIQSYZnWLaWC9QNCpTK_U.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDsbIQSYZnWLaWC9QNCpTK_U.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDogd9OEPUCN3AdYW0e8tat4.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDogd9OEPUCN3AdYW0e8tat4.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDogd9OEPUCN3AdYW0e8tat4.woff2'
    },
    'notosans_9Z3uUWMRR7crzm1TjRicDv79_ZuUxCigM2DespTnFaw.woff2': {
        urls: ['fonts.gstatic.com/s/notosans/v6/9Z3uUWMRR7crzm1TjRicDv79_ZuUxCigM2DespTnFaw.woff2'],
        file: 'google-fonts/9Z3uUWMRR7crzm1TjRicDv79_ZuUxCigM2DespTnFaw.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTQ7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTQ7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTQ7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTRdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTRdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTRdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTZ6vnaPZw6nYDxM4SVEMFKg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTZ6vnaPZw6nYDxM4SVEMFKg.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTZ6vnaPZw6nYDxM4SVEMFKg.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTfy1_HTwRwgtl1cPga3Fy3Y.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTfy1_HTwRwgtl1cPga3Fy3Y.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTfy1_HTwRwgtl1cPga3Fy3Y.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTfgrLsWo7Jk1KvZser0olKY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTfgrLsWo7Jk1KvZser0olKY.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTfgrLsWo7Jk1KvZser0olKY.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTYjoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTYjoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTYjoYw3YTyktCCer_ilOlhE.woff2'
    },
    'opensans_DXI1ORHCpsQm3Vp6mXoaTRampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTRampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/DXI1ORHCpsQm3Vp6mXoaTRampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'opensans_K88pR3goAWT7BTt32Z01m4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/K88pR3goAWT7BTt32Z01m4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/K88pR3goAWT7BTt32Z01m4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_RjgO7rYTmqiVp7vzi-Q5UYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/RjgO7rYTmqiVp7vzi-Q5UYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/RjgO7rYTmqiVp7vzi-Q5UYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_LWCjsQkB6EMdfHrEVqA1KYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/LWCjsQkB6EMdfHrEVqA1KYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/LWCjsQkB6EMdfHrEVqA1KYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_xozscpT2726on7jbcb_pAoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xozscpT2726on7jbcb_pAoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/xozscpT2726on7jbcb_pAoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_59ZRklaO5bWGqF5A9baEEYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/59ZRklaO5bWGqF5A9baEEYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/59ZRklaO5bWGqF5A9baEEYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_u-WUoqrET9fUeobQW7jkRYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/u-WUoqrET9fUeobQW7jkRYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/u-WUoqrET9fUeobQW7jkRYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'opensans_cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNSg7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSg7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNSg7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNShdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNShdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNShdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNSp6vnaPZw6nYDxM4SVEMFKg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSp6vnaPZw6nYDxM4SVEMFKg.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNSp6vnaPZw6nYDxM4SVEMFKg.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNSvy1_HTwRwgtl1cPga3Fy3Y.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSvy1_HTwRwgtl1cPga3Fy3Y.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNSvy1_HTwRwgtl1cPga3Fy3Y.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNSvgrLsWo7Jk1KvZser0olKY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSvgrLsWo7Jk1KvZser0olKY.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNSvgrLsWo7Jk1KvZser0olKY.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNSojoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSojoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNSojoYw3YTyktCCer_ilOlhE.woff2'
    },
    'opensans_MTP_ySUJH_bn48VBG8sNShampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNShampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/MTP_ySUJH_bn48VBG8sNShampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzA7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzA7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzA7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzBdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzBdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzBdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzJ6vnaPZw6nYDxM4SVEMFKg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzJ6vnaPZw6nYDxM4SVEMFKg.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzJ6vnaPZw6nYDxM4SVEMFKg.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzPy1_HTwRwgtl1cPga3Fy3Y.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzPy1_HTwRwgtl1cPga3Fy3Y.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzPy1_HTwRwgtl1cPga3Fy3Y.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzPgrLsWo7Jk1KvZser0olKY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzPgrLsWo7Jk1KvZser0olKY.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzPgrLsWo7Jk1KvZser0olKY.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzIjoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzIjoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzIjoYw3YTyktCCer_ilOlhE.woff2'
    },
    'opensans_k3k702ZOKiLJc3WVjuplzBampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzBampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/k3k702ZOKiLJc3WVjuplzBampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hg7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hg7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hg7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hhdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hhdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hhdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hp6vnaPZw6nYDxM4SVEMFKg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hp6vnaPZw6nYDxM4SVEMFKg.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hp6vnaPZw6nYDxM4SVEMFKg.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hvy1_HTwRwgtl1cPga3Fy3Y.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hvy1_HTwRwgtl1cPga3Fy3Y.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hvy1_HTwRwgtl1cPga3Fy3Y.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hvgrLsWo7Jk1KvZser0olKY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hvgrLsWo7Jk1KvZser0olKY.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hvgrLsWo7Jk1KvZser0olKY.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hojoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hojoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hojoYw3YTyktCCer_ilOlhE.woff2'
    },
    'opensans_EInbV5DfGHOiMmvb1Xr-hhampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/EInbV5DfGHOiMmvb1Xr-hhampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/EInbV5DfGHOiMmvb1Xr-hhampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxkExlR2MysFCBK8OirNw2kM.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxkExlR2MysFCBK8OirNw2kM.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxkExlR2MysFCBK8OirNw2kM.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxmdsm03krrxlabhmVQFB99s.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxmdsm03krrxlabhmVQFB99s.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxmdsm03krrxlabhmVQFB99s.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxiJ0caWjaSBdV-xZbEgst_k.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxiJ0caWjaSBdV-xZbEgst_k.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxiJ0caWjaSBdV-xZbEgst_k.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxmMSHb9EAJwuSzGfuRChQzQ.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxmMSHb9EAJwuSzGfuRChQzQ.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxmMSHb9EAJwuSzGfuRChQzQ.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxupRBTtN4E2_qSPBnw6AgMc.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxupRBTtN4E2_qSPBnw6AgMc.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxupRBTtN4E2_qSPBnw6AgMc.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxtDnm4qiMZlH5rhYv_7LI2Y.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxtDnm4qiMZlH5rhYv_7LI2Y.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxtDnm4qiMZlH5rhYv_7LI2Y.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxtTIkQYohD4BpHvJ3NvbHoA.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxtTIkQYohD4BpHvJ3NvbHoA.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxtTIkQYohD4BpHvJ3NvbHoA.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBvZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBvZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBvZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBl4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBl4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBl4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBlBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBlBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBlBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBgt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBgt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBgt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBtDiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBtDiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBtDiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBqE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBqE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBqE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'opensans_xjAJXh38I15wypJXxuGMBogp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBogp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/xjAJXh38I15wypJXxuGMBogp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxjBFCZ8rkaaoOvHyaB4p1V8.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxjBFCZ8rkaaoOvHyaB4p1V8.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxjBFCZ8rkaaoOvHyaB4p1V8.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxs2Ua5FNUHV5nolPhplIfzg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxs2Ua5FNUHV5nolPhplIfzg.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxs2Ua5FNUHV5nolPhplIfzg.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxn1XrJsKtwhNaJmMXegB1eg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxn1XrJsKtwhNaJmMXegB1eg.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxn1XrJsKtwhNaJmMXegB1eg.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxtDawAUxQv-nqIa2sHgh1E4.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxtDawAUxQv-nqIa2sHgh1E4.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxtDawAUxQv-nqIa2sHgh1E4.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxo6uqQeO3rRcuZb4avK7jaw.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxo6uqQeO3rRcuZb4avK7jaw.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxo6uqQeO3rRcuZb4avK7jaw.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxkWd5At5A4dPjoTcH8-WMxA.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxkWd5At5A4dPjoTcH8-WMxA.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxkWd5At5A4dPjoTcH8-WMxA.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxsiAiQ_a33snTsJhwZvMEaI.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxsiAiQ_a33snTsJhwZvMEaI.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxsiAiQ_a33snTsJhwZvMEaI.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxgXaAXup5mZlfK6xRLrhsco.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxgXaAXup5mZlfK6xRLrhsco.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxgXaAXup5mZlfK6xRLrhsco.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxlx-M1I1w5OMiqnVF8xBLhU.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxlx-M1I1w5OMiqnVF8xBLhU.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxlx-M1I1w5OMiqnVF8xBLhU.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxlT7aJLK6nKpn36IMwTcMMc.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxlT7aJLK6nKpn36IMwTcMMc.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxlT7aJLK6nKpn36IMwTcMMc.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxgn6Wqxo-xwxilDXPU8chVU.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxgn6Wqxo-xwxilDXPU8chVU.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxgn6Wqxo-xwxilDXPU8chVU.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxsbIQSYZnWLaWC9QNCpTK_U.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxsbIQSYZnWLaWC9QNCpTK_U.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxsbIQSYZnWLaWC9QNCpTK_U.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxogd9OEPUCN3AdYW0e8tat4.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxogd9OEPUCN3AdYW0e8tat4.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxogd9OEPUCN3AdYW0e8tat4.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxv79_ZuUxCigM2DespTnFaw.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxv79_ZuUxCigM2DespTnFaw.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxv79_ZuUxCigM2DespTnFaw.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxn6R3Xv-e6B79xl5HkmgNhg.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxn6R3Xv-e6B79xl5HkmgNhg.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxn6R3Xv-e6B79xl5HkmgNhg.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxh0aj4r8o_EFns5janpBDyI.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxh0aj4r8o_EFns5janpBDyI.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxh0aj4r8o_EFns5janpBDyI.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxi6YLLovB_TP0ww2BP_2m6E.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxi6YLLovB_TP0ww2BP_2m6E.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxi6YLLovB_TP0ww2BP_2m6E.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxpJkxLuyU7HkgJy3gZf6al0.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxpJkxLuyU7HkgJy3gZf6al0.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxpJkxLuyU7HkgJy3gZf6al0.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxjXFJsAmRr-kbJgAcGJdm8k.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxjXFJsAmRr-kbJgAcGJdm8k.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxjXFJsAmRr-kbJgAcGJdm8k.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxsI9ytsQgoRd-8mg6J4vcxU.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxsI9ytsQgoRd-8mg6J4vcxU.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxsI9ytsQgoRd-8mg6J4vcxU.woff2'
    },
    'opensans_PRmiXeptR36kaC0GEAetxmPkvcX8kXDzy1NrkNCBkJ4.woff2': {
        urls: ['fonts.gstatic.com/s/opensans/v13/PRmiXeptR36kaC0GEAetxmPkvcX8kXDzy1NrkNCBkJ4.woff2'],
        file: 'google-fonts/PRmiXeptR36kaC0GEAetxmPkvcX8kXDzy1NrkNCBkJ4.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xE6du99w8ONfQrOf4kprgAx_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xE6du99w8ONfQrOf4kprgAx_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xE6du99w8ONfQrOf4kprgAx_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xK8wKBk9M_9zvJF5T73CXCh_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xK8wKBk9M_9zvJF5T73CXCh_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xK8wKBk9M_9zvJF5T73CXCh_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xJ14gK-0unzMDfuYl-aQUV9_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xJ14gK-0unzMDfuYl-aQUV9_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xJ14gK-0unzMDfuYl-aQUV9_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xB5VLgeZEtrtjc2zP-H3k9d_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xB5VLgeZEtrtjc2zP-H3k9d_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xB5VLgeZEtrtjc2zP-H3k9d_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xAWz7bTsodKOChnd4npPWzF_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xAWz7bTsodKOChnd4npPWzF_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xAWz7bTsodKOChnd4npPWzF_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xD_0YkshJ_UyXEU-Q7eV4G5_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xD_0YkshJ_UyXEU-Q7eV4G5_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xD_0YkshJ_UyXEU-Q7eV4G5_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xMmDra0ONnO3FPH--kzkC5zr7w4p9aSvGirXi6XmeXNA.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xMmDra0ONnO3FPH--kzkC5zr7w4p9aSvGirXi6XmeXNA.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xMmDra0ONnO3FPH--kzkC5zr7w4p9aSvGirXi6XmeXNA.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xPX7z5o44AuUJ1t1avdkNXJ_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xPX7z5o44AuUJ1t1avdkNXJ_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xPX7z5o44AuUJ1t1avdkNXJ_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xLLF6RfyvCYuuChpfFHKAr5_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xLLF6RfyvCYuuChpfFHKAr5_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xLLF6RfyvCYuuChpfFHKAr5_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xIbCcO5IWJIaQ5MtZqYsHUp_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xIbCcO5IWJIaQ5MtZqYsHUp_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xIbCcO5IWJIaQ5MtZqYsHUp_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xHQ3DnTiPFZC1qn696_nOv9_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xHQ3DnTiPFZC1qn696_nOv9_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xHQ3DnTiPFZC1qn696_nOv9_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xLzZT6Zu7Z-BZJGL0hT-UJV_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xLzZT6Zu7Z-BZJGL0hT-UJV_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xLzZT6Zu7Z-BZJGL0hT-UJV_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xPJmhJzg6kSQTtrFMk-8lT5_v5H-gcmDugi2HQeB0BPm.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xPJmhJzg6kSQTtrFMk-8lT5_v5H-gcmDugi2HQeB0BPm.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xPJmhJzg6kSQTtrFMk-8lT5_v5H-gcmDugi2HQeB0BPm.woff2'
    },
    'opensanscondensed_gk5FxslNkTTHtojXrkp-xIgEy7irt_A5K-aDq9kG7DHr7w4p9aSvGirXi6XmeXNA.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/gk5FxslNkTTHtojXrkp-xIgEy7irt_A5K-aDq9kG7DHr7w4p9aSvGirXi6XmeXNA.woff2'],
        file: 'google-fonts/gk5FxslNkTTHtojXrkp-xIgEy7irt_A5K-aDq9kG7DHr7w4p9aSvGirXi6XmeXNA.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzVxzW2HGxJE-cxaore_4G_hYZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzVxzW2HGxJE-cxaore_4G_hYZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzVxzW2HGxJE-cxaore_4G_hYZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzV4zIibREM_xtIOs0xIJYzcAZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzV4zIibREM_xtIOs0xIJYzcAZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzV4zIibREM_xtIOs0xIJYzcAZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzV9WNSx_9Tm--PxC8nYzol_oZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzV9WNSx_9Tm--PxC8nYzol_oZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzV9WNSx_9Tm--PxC8nYzol_oZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzV4S1q5RGaHzzAAUgHklRNwMZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzV4S1q5RGaHzzAAUgHklRNwMZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzV4S1q5RGaHzzAAUgHklRNwMZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzV0RUj-8OE20lRl9GlTGRU-QZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzV0RUj-8OE20lRl9GlTGRU-QZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzV0RUj-8OE20lRl9GlTGRU-QZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzV12Cn97i9IlPbfrzIs7KZtAZAM-K2J-O2ctq74oFkH-s.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzV12Cn97i9IlPbfrzIs7KZtAZAM-K2J-O2ctq74oFkH-s.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzV12Cn97i9IlPbfrzIs7KZtAZAM-K2J-O2ctq74oFkH-s.woff2'
    },
    'opensanscondensed_jIXlqT1WKafUSwj6s9AzVyqWG1TIildrkra2taUxHyR2IY20qb3OO3nusUf_NB58.woff2': {
        urls: ['fonts.gstatic.com/s/opensanscondensed/v10/jIXlqT1WKafUSwj6s9AzVyqWG1TIildrkra2taUxHyR2IY20qb3OO3nusUf_NB58.woff2'],
        file: 'google-fonts/jIXlqT1WKafUSwj6s9AzVyqWG1TIildrkra2taUxHyR2IY20qb3OO3nusUf_NB58.woff2'
    },
    'oswald_l1cOQ90roY9yC7voEhngDIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/l1cOQ90roY9yC7voEhngDIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/l1cOQ90roY9yC7voEhngDIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'oswald_HqHm7BVC_nzzTui2lzQTDZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/HqHm7BVC_nzzTui2lzQTDZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/HqHm7BVC_nzzTui2lzQTDZBw1xU1rKptJj_0jans920.woff2'
    },
    'oswald_Qw6_9HvXRQGg5mMbFR3Phn-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/Qw6_9HvXRQGg5mMbFR3Phn-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/Qw6_9HvXRQGg5mMbFR3Phn-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'oswald__P8jt3Y65hJ9c4AzRE0V1OvvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/_P8jt3Y65hJ9c4AzRE0V1OvvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/_P8jt3Y65hJ9c4AzRE0V1OvvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'oswald_dI-qzxlKVQA6TUC5RKSb34X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/dI-qzxlKVQA6TUC5RKSb34X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/dI-qzxlKVQA6TUC5RKSb34X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'oswald_bH7276GfdCjMjApa_dkG6ZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/oswald/v10/bH7276GfdCjMjApa_dkG6ZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/bH7276GfdCjMjApa_dkG6ZBw1xU1rKptJj_0jans920.woff2'
    },
    'ptsans_fhNmDCnjccoUYyU4ZASaLVKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/fhNmDCnjccoUYyU4ZASaLVKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/fhNmDCnjccoUYyU4ZASaLVKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'ptsans_BJVWev7_auVaQ__OU8Qih1KPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/BJVWev7_auVaQ__OU8Qih1KPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/BJVWev7_auVaQ__OU8Qih1KPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'ptsans_oysROHFTu1eTZ74Hcf8V-VKPGs1ZzpMvnHX-7fPOuAc.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/oysROHFTu1eTZ74Hcf8V-VKPGs1ZzpMvnHX-7fPOuAc.woff2'],
        file: 'google-fonts/oysROHFTu1eTZ74Hcf8V-VKPGs1ZzpMvnHX-7fPOuAc.woff2'
    },
    'ptsans_CWlc_g68BGYDSGdpJvpktgLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/CWlc_g68BGYDSGdpJvpktgLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/CWlc_g68BGYDSGdpJvpktgLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'ptsans_kTYfCWJhlldPf5LnG4ZnHAsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/kTYfCWJhlldPf5LnG4ZnHAsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/kTYfCWJhlldPf5LnG4ZnHAsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptsans_g46X4VH_KHOWAAa-HpnGPgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/g46X4VH_KHOWAAa-HpnGPgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/g46X4VH_KHOWAAa-HpnGPgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptsans_hpORcvLZtemlH8gI-1S-7gsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/hpORcvLZtemlH8gI-1S-7gsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/hpORcvLZtemlH8gI-1S-7gsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptsans_0XxGQsSc1g4rdRdjJKZrNAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/0XxGQsSc1g4rdRdjJKZrNAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/0XxGQsSc1g4rdRdjJKZrNAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'ptsans_GpWpM_6S4VQLPNAQ3iWvVYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/GpWpM_6S4VQLPNAQ3iWvVYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/GpWpM_6S4VQLPNAQ3iWvVYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ptsans_7dSh6BcuqDLzS2qAASIeuoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/7dSh6BcuqDLzS2qAASIeuoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/7dSh6BcuqDLzS2qAASIeuoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ptsans_DVKQJxMmC9WF_oplMzlQqYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/DVKQJxMmC9WF_oplMzlQqYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/DVKQJxMmC9WF_oplMzlQqYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ptsans_PIPMHY90P7jtyjpXuZ2cLJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/PIPMHY90P7jtyjpXuZ2cLJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/PIPMHY90P7jtyjpXuZ2cLJBw1xU1rKptJj_0jans920.woff2'
    },
    'ptsans_lILlYDvubYemzYzN7GbLkA7aC6SjiAOpAWOKfJDfVRY.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/lILlYDvubYemzYzN7GbLkA7aC6SjiAOpAWOKfJDfVRY.woff2'],
        file: 'google-fonts/lILlYDvubYemzYzN7GbLkA7aC6SjiAOpAWOKfJDfVRY.woff2'
    },
    'ptsans_lILlYDvubYemzYzN7GbLkBdwxCXfZpKo5kWAx_74bHs.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/lILlYDvubYemzYzN7GbLkBdwxCXfZpKo5kWAx_74bHs.woff2'],
        file: 'google-fonts/lILlYDvubYemzYzN7GbLkBdwxCXfZpKo5kWAx_74bHs.woff2'
    },
    'ptsans_lILlYDvubYemzYzN7GbLkIjoYw3YTyktCCer_ilOlhE.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/lILlYDvubYemzYzN7GbLkIjoYw3YTyktCCer_ilOlhE.woff2'],
        file: 'google-fonts/lILlYDvubYemzYzN7GbLkIjoYw3YTyktCCer_ilOlhE.woff2'
    },
    'ptsans_lILlYDvubYemzYzN7GbLkBampu5_7CjHW5spxoeN3Vs.woff2': {
        urls: ['fonts.gstatic.com/s/ptsans/v8/lILlYDvubYemzYzN7GbLkBampu5_7CjHW5spxoeN3Vs.woff2'],
        file: 'google-fonts/lILlYDvubYemzYzN7GbLkBampu5_7CjHW5spxoeN3Vs.woff2'
    },
    'ptsansnarrow_UyYrYy3ltEffJV9QueSi4ZEk0SAHyDN38O8i9vCnTn4.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/UyYrYy3ltEffJV9QueSi4ZEk0SAHyDN38O8i9vCnTn4.woff2'],
        file: 'google-fonts/UyYrYy3ltEffJV9QueSi4ZEk0SAHyDN38O8i9vCnTn4.woff2'
    },
    'ptsansnarrow_UyYrYy3ltEffJV9QueSi4TBlyDWpEJYVQuuPQMv_c-4.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/UyYrYy3ltEffJV9QueSi4TBlyDWpEJYVQuuPQMv_c-4.woff2'],
        file: 'google-fonts/UyYrYy3ltEffJV9QueSi4TBlyDWpEJYVQuuPQMv_c-4.woff2'
    },
    'ptsansnarrow_UyYrYy3ltEffJV9QueSi4awvjhBeOB25B0pWmvErI1g.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/UyYrYy3ltEffJV9QueSi4awvjhBeOB25B0pWmvErI1g.woff2'],
        file: 'google-fonts/UyYrYy3ltEffJV9QueSi4awvjhBeOB25B0pWmvErI1g.woff2'
    },
    'ptsansnarrow_UyYrYy3ltEffJV9QueSi4SXGGgjhbil4nYG1ct5o924.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/UyYrYy3ltEffJV9QueSi4SXGGgjhbil4nYG1ct5o924.woff2'],
        file: 'google-fonts/UyYrYy3ltEffJV9QueSi4SXGGgjhbil4nYG1ct5o924.woff2'
    },
    'ptsansnarrow_Q_pTky3Sc3ubRibGToTAYtUWWqxCFjd5cEd_RrOHL6Y.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/Q_pTky3Sc3ubRibGToTAYtUWWqxCFjd5cEd_RrOHL6Y.woff2'],
        file: 'google-fonts/Q_pTky3Sc3ubRibGToTAYtUWWqxCFjd5cEd_RrOHL6Y.woff2'
    },
    'ptsansnarrow_Q_pTky3Sc3ubRibGToTAYupmode525gDTwNyPqZGNXY.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/Q_pTky3Sc3ubRibGToTAYupmode525gDTwNyPqZGNXY.woff2'],
        file: 'google-fonts/Q_pTky3Sc3ubRibGToTAYupmode525gDTwNyPqZGNXY.woff2'
    },
    'ptsansnarrow_Q_pTky3Sc3ubRibGToTAYtglsoc-tKu3skzGCjmMb84.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/Q_pTky3Sc3ubRibGToTAYtglsoc-tKu3skzGCjmMb84.woff2'],
        file: 'google-fonts/Q_pTky3Sc3ubRibGToTAYtglsoc-tKu3skzGCjmMb84.woff2'
    },
    'ptsansnarrow_Q_pTky3Sc3ubRibGToTAYkBqNlhjGh6uyjdvfMwxzYs.woff2': {
        urls: ['fonts.gstatic.com/s/ptsansnarrow/v7/Q_pTky3Sc3ubRibGToTAYkBqNlhjGh6uyjdvfMwxzYs.woff2'],
        file: 'google-fonts/Q_pTky3Sc3ubRibGToTAYkBqNlhjGh6uyjdvfMwxzYs.woff2'
    },
    'ptserif_5hX15RUpPERmeybVlLQEWBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/5hX15RUpPERmeybVlLQEWBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/5hX15RUpPERmeybVlLQEWBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ptserif_fU0HAfLiPHGlZhZpY6M7dBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/fU0HAfLiPHGlZhZpY6M7dBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/fU0HAfLiPHGlZhZpY6M7dBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ptserif_CPRt--GVMETgA6YEaoGitxkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/CPRt--GVMETgA6YEaoGitxkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/CPRt--GVMETgA6YEaoGitxkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ptserif_I-OtoJZa3TeyH6D9oli3iXYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/I-OtoJZa3TeyH6D9oli3iXYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/I-OtoJZa3TeyH6D9oli3iXYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'ptserif_QABk9IxT-LFTJ_dQzv7xpPZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/QABk9IxT-LFTJ_dQzv7xpPZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/QABk9IxT-LFTJ_dQzv7xpPZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'ptserif_QABk9IxT-LFTJ_dQzv7xpF4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/QABk9IxT-LFTJ_dQzv7xpF4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/QABk9IxT-LFTJ_dQzv7xpF4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'ptserif_QABk9IxT-LFTJ_dQzv7xpKE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/QABk9IxT-LFTJ_dQzv7xpKE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/QABk9IxT-LFTJ_dQzv7xpKE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'ptserif_QABk9IxT-LFTJ_dQzv7xpIgp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/QABk9IxT-LFTJ_dQzv7xpIgp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/QABk9IxT-LFTJ_dQzv7xpIgp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'ptserif_O_WhD9hODL16N4KLHLX7xQsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/O_WhD9hODL16N4KLHLX7xQsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/O_WhD9hODL16N4KLHLX7xQsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptserif_3Nwg9VzlwLXPq3fNKwVRMAsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/3Nwg9VzlwLXPq3fNKwVRMAsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/3Nwg9VzlwLXPq3fNKwVRMAsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptserif_b31S45a_TNgaBApZhTgE6AsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/b31S45a_TNgaBApZhTgE6AsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/b31S45a_TNgaBApZhTgE6AsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'ptserif_03aPdn7fFF3H6ngCgAlQzAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/03aPdn7fFF3H6ngCgAlQzAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/03aPdn7fFF3H6ngCgAlQzAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'ptserif_Foydq9xJp--nfYIx2TBz9bllaL-ufMOTUcv7jfgmuJg.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/Foydq9xJp--nfYIx2TBz9bllaL-ufMOTUcv7jfgmuJg.woff2'],
        file: 'google-fonts/Foydq9xJp--nfYIx2TBz9bllaL-ufMOTUcv7jfgmuJg.woff2'
    },
    'ptserif_Foydq9xJp--nfYIx2TBz9ZsnFT_2ovhuEig4Dh-CBQw.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/Foydq9xJp--nfYIx2TBz9ZsnFT_2ovhuEig4Dh-CBQw.woff2'],
        file: 'google-fonts/Foydq9xJp--nfYIx2TBz9ZsnFT_2ovhuEig4Dh-CBQw.woff2'
    },
    'ptserif_Foydq9xJp--nfYIx2TBz9TrEaqfC9P2pvLXik1Kbr9s.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/Foydq9xJp--nfYIx2TBz9TrEaqfC9P2pvLXik1Kbr9s.woff2'],
        file: 'google-fonts/Foydq9xJp--nfYIx2TBz9TrEaqfC9P2pvLXik1Kbr9s.woff2'
    },
    'ptserif_Foydq9xJp--nfYIx2TBz9WaVI6zN22yiurzcBKxPjFE.woff2': {
        urls: ['fonts.gstatic.com/s/ptserif/v8/Foydq9xJp--nfYIx2TBz9WaVI6zN22yiurzcBKxPjFE.woff2'],
        file: 'google-fonts/Foydq9xJp--nfYIx2TBz9WaVI6zN22yiurzcBKxPjFE.woff2'
    },
    'poiretone_cKr_e199f0xMkxMkRbEJXwsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/poiretone/v4/cKr_e199f0xMkxMkRbEJXwsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/cKr_e199f0xMkxMkRbEJXwsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'poiretone_3Annd_XP-99FcGbOpm6fVAsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/poiretone/v4/3Annd_XP-99FcGbOpm6fVAsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/3Annd_XP-99FcGbOpm6fVAsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'poiretone_HrI4ZJpJ3Fh0wa5ofYMK8QzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/poiretone/v4/HrI4ZJpJ3Fh0wa5ofYMK8QzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/HrI4ZJpJ3Fh0wa5ofYMK8QzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_RJMlAoFXXQEzZoMSUteGWJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/RJMlAoFXXQEzZoMSUteGWJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/RJMlAoFXXQEzZoMSUteGWJBw1xU1rKptJj_0jans920.woff2'
    },
    'raleway_8KhZd3VQBtXTAznvKjw-kwzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/8KhZd3VQBtXTAznvKjw-kwzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/8KhZd3VQBtXTAznvKjw-kwzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_-_Ctzj9b56b8RgXW8FAriQzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/-_Ctzj9b56b8RgXW8FAriQzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/-_Ctzj9b56b8RgXW8FAriQzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_QAUlVt1jXOgQavlW5wEfxQLUuEpTyoUstqEm5AMlJo4.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/QAUlVt1jXOgQavlW5wEfxQLUuEpTyoUstqEm5AMlJo4.woff2'],
        file: 'google-fonts/QAUlVt1jXOgQavlW5wEfxQLUuEpTyoUstqEm5AMlJo4.woff2'
    },
    'raleway_CcKI4k9un7TZVWzRVT-T8wzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/CcKI4k9un7TZVWzRVT-T8wzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/CcKI4k9un7TZVWzRVT-T8wzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_xkvoNo9fC8O2RDydKj12bwzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/xkvoNo9fC8O2RDydKj12bwzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/xkvoNo9fC8O2RDydKj12bwzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_JbtMzqLaYbbbCL9X6EvaIwzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/JbtMzqLaYbbbCL9X6EvaIwzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/JbtMzqLaYbbbCL9X6EvaIwzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_1ImRNPx4870-D9a1EBUdPAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/1ImRNPx4870-D9a1EBUdPAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/1ImRNPx4870-D9a1EBUdPAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'raleway_PKCRbVvRfd5n7BTjtGiFZAzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/raleway/v9/PKCRbVvRfd5n7BTjtGiFZAzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/PKCRbVvRfd5n7BTjtGiFZAzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'roboto_ty9dfvLAziwdqQ2dHoyjphkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/ty9dfvLAziwdqQ2dHoyjphkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/ty9dfvLAziwdqQ2dHoyjphkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_frNV30OaYdlFRtH2VnZZdhkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/frNV30OaYdlFRtH2VnZZdhkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/frNV30OaYdlFRtH2VnZZdhkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_gwVJDERN2Amz39wrSoZ7FxkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/gwVJDERN2Amz39wrSoZ7FxkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/gwVJDERN2Amz39wrSoZ7FxkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_aZMswpodYeVhtRvuABJWvBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/aZMswpodYeVhtRvuABJWvBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/aZMswpodYeVhtRvuABJWvBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_VvXUGKZXbHtX_S_VCTLpGhkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/VvXUGKZXbHtX_S_VCTLpGhkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/VvXUGKZXbHtX_S_VCTLpGhkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_e7MeVAyvogMqFwwl61PKhBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/e7MeVAyvogMqFwwl61PKhBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/e7MeVAyvogMqFwwl61PKhBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_2tsd397wLxj96qwHyNIkxHYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/2tsd397wLxj96qwHyNIkxHYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/2tsd397wLxj96qwHyNIkxHYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'roboto_0eC6fl06luXEYWpBSJvXCIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/0eC6fl06luXEYWpBSJvXCIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/0eC6fl06luXEYWpBSJvXCIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_Fl4y0QdOxyyTHEGMXX8kcYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/Fl4y0QdOxyyTHEGMXX8kcYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/Fl4y0QdOxyyTHEGMXX8kcYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_-L14Jk06m6pUHB-5mXQQnYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/-L14Jk06m6pUHB-5mXQQnYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/-L14Jk06m6pUHB-5mXQQnYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_I3S1wsgSg9YCurV6PUkTOYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/I3S1wsgSg9YCurV6PUkTOYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/I3S1wsgSg9YCurV6PUkTOYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_NYDWBdD4gIq26G5XYbHsFIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/NYDWBdD4gIq26G5XYbHsFIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/NYDWBdD4gIq26G5XYbHsFIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_Pru33qjShpZSmG3z6VYwnYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/Pru33qjShpZSmG3z6VYwnYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/Pru33qjShpZSmG3z6VYwnYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_Hgo13k-tfSpn0qi1SFdUfZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/Hgo13k-tfSpn0qi1SFdUfZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/Hgo13k-tfSpn0qi1SFdUfZBw1xU1rKptJj_0jans920.woff2'
    },
    'roboto_sTdaA6j0Psb920Vjv-mrzH-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/sTdaA6j0Psb920Vjv-mrzH-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/sTdaA6j0Psb920Vjv-mrzH-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto_uYECMKoHcO9x1wdmbyHIm3-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/uYECMKoHcO9x1wdmbyHIm3-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/uYECMKoHcO9x1wdmbyHIm3-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto_tnj4SB6DNbdaQnsM8CFqBX-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/tnj4SB6DNbdaQnsM8CFqBX-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/tnj4SB6DNbdaQnsM8CFqBX-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto__VYFx-s824kXq_Ul2BHqYH-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/_VYFx-s824kXq_Ul2BHqYH-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/_VYFx-s824kXq_Ul2BHqYH-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto_NJ4vxlgWwWbEsv18dAhqnn-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/NJ4vxlgWwWbEsv18dAhqnn-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/NJ4vxlgWwWbEsv18dAhqnn-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto_Ks_cVxiCiwUWVsFWFA3Bjn-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/Ks_cVxiCiwUWVsFWFA3Bjn-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/Ks_cVxiCiwUWVsFWFA3Bjn-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'roboto_oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'roboto_ZLqKeelYbATG60EpZBSDy4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/ZLqKeelYbATG60EpZBSDy4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/ZLqKeelYbATG60EpZBSDy4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_oHi30kwQWvpCWqAhzHcCSIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/oHi30kwQWvpCWqAhzHcCSIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/oHi30kwQWvpCWqAhzHcCSIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_rGvHdJnr2l75qb0YND9NyIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/rGvHdJnr2l75qb0YND9NyIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/rGvHdJnr2l75qb0YND9NyIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_mx9Uck6uB63VIKFYnEMXrYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/mx9Uck6uB63VIKFYnEMXrYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/mx9Uck6uB63VIKFYnEMXrYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_mbmhprMH69Zi6eEPBYVFhYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/mbmhprMH69Zi6eEPBYVFhYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/mbmhprMH69Zi6eEPBYVFhYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_oOeFwZNlrTefzLYmlVV1UIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/oOeFwZNlrTefzLYmlVV1UIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/oOeFwZNlrTefzLYmlVV1UIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2'
    },
    'roboto_77FXFjRbGzN4aCrSFhlh3oX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/77FXFjRbGzN4aCrSFhlh3oX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/77FXFjRbGzN4aCrSFhlh3oX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_isZ-wbCXNKAbnjo6_TwHToX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/isZ-wbCXNKAbnjo6_TwHToX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/isZ-wbCXNKAbnjo6_TwHToX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_UX6i4JxQDm3fVTc1CPuwqoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/UX6i4JxQDm3fVTc1CPuwqoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/UX6i4JxQDm3fVTc1CPuwqoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_jSN2CGVDbcVyCnfJfjSdfIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/jSN2CGVDbcVyCnfJfjSdfIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/jSN2CGVDbcVyCnfJfjSdfIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_PwZc-YbIL414wB9rB1IAPYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/PwZc-YbIL414wB9rB1IAPYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/PwZc-YbIL414wB9rB1IAPYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_97uahxiqZRoncBaCEI3aW4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/97uahxiqZRoncBaCEI3aW4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/97uahxiqZRoncBaCEI3aW4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2'
    },
    'roboto_s7gftie1JANC-QmDJvMWZoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/s7gftie1JANC-QmDJvMWZoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/s7gftie1JANC-QmDJvMWZoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_3Y_xCyt7TNunMGg0Et2pnoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/3Y_xCyt7TNunMGg0Et2pnoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/3Y_xCyt7TNunMGg0Et2pnoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_WeQRRE07FDkIrr29oHQgHIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/WeQRRE07FDkIrr29oHQgHIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/WeQRRE07FDkIrr29oHQgHIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_jyIYROCkJM3gZ4KV00YXOIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/jyIYROCkJM3gZ4KV00YXOIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/jyIYROCkJM3gZ4KV00YXOIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_phsu-QZXz1JBv0PbFoPmEIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/phsu-QZXz1JBv0PbFoPmEIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/phsu-QZXz1JBv0PbFoPmEIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_9_7S_tWeGDh5Pq3u05RVkoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/9_7S_tWeGDh5Pq3u05RVkoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/9_7S_tWeGDh5Pq3u05RVkoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'roboto_mnpfi9pxYH-Go5UiibESIpBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/mnpfi9pxYH-Go5UiibESIpBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/mnpfi9pxYH-Go5UiibESIpBw1xU1rKptJj_0jans920.woff2'
    },
    'roboto_1DbO0RvWEevroPvEzA5brgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/1DbO0RvWEevroPvEzA5brgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/1DbO0RvWEevroPvEzA5brgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_5z9jpDJQqVE5bmkRqplJfgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/5z9jpDJQqVE5bmkRqplJfgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/5z9jpDJQqVE5bmkRqplJfgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_cueeGLWq_s1uoQgOf76TFgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/cueeGLWq_s1uoQgOf76TFgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/cueeGLWq_s1uoQgOf76TFgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_yTs8gw1HdasCzJ-B_iUwzQsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/yTs8gw1HdasCzJ-B_iUwzQsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/yTs8gw1HdasCzJ-B_iUwzQsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_gLfmBATgABwy0zMVv-qqhgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/gLfmBATgABwy0zMVv-qqhgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/gLfmBATgABwy0zMVv-qqhgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_dzxs_VxZUhdM2mEBkNa8sgsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/dzxs_VxZUhdM2mEBkNa8sgsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/dzxs_VxZUhdM2mEBkNa8sgsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'roboto_12mE4jfMSBTmg-81EiS-YQzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/12mE4jfMSBTmg-81EiS-YQzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/12mE4jfMSBTmg-81EiS-YQzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at_ZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at_ZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at_ZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at14sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at14sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at14sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at1BW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at1BW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at1BW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0atwt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0atwt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0atwt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at9DiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at9DiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at9DiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at6E8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at6E8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at6E8kM4xWR1_1bYURRojRGc.woff2'
    },
    'roboto_7m8l7TlFO-S3VkhHuR0at4gp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/7m8l7TlFO-S3VkhHuR0at4gp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/7m8l7TlFO-S3VkhHuR0at4gp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'roboto_WxrXJa0C3KdtC7lMafG4dRkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/WxrXJa0C3KdtC7lMafG4dRkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/WxrXJa0C3KdtC7lMafG4dRkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_OpXUqTo0UgQQhGj_SFdLWBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OpXUqTo0UgQQhGj_SFdLWBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/OpXUqTo0UgQQhGj_SFdLWBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_1hZf02POANh32k2VkgEoUBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/1hZf02POANh32k2VkgEoUBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/1hZf02POANh32k2VkgEoUBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_cDKhRaXnQTOVbaoxwdOr9xkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/cDKhRaXnQTOVbaoxwdOr9xkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/cDKhRaXnQTOVbaoxwdOr9xkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_K23cxWVTrIFD6DJsEVi07RkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/K23cxWVTrIFD6DJsEVi07RkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/K23cxWVTrIFD6DJsEVi07RkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_vSzulfKSK0LLjjfeaxcREhkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/vSzulfKSK0LLjjfeaxcREhkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/vSzulfKSK0LLjjfeaxcREhkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'roboto_vPcynSL0qHq_6dX7lKVByXYhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/vPcynSL0qHq_6dX7lKVByXYhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/vPcynSL0qHq_6dX7lKVByXYhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0fZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0fZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0fZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0V4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0V4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0V4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0VBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0VBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0VBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0Qt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0Qt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0Qt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0dDiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0dDiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0dDiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0aE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0aE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0aE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'roboto_OLffGBTaF0XFOW1gnuHF0Ygp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/OLffGBTaF0XFOW1gnuHF0Ygp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/OLffGBTaF0XFOW1gnuHF0Ygp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC_ZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC_ZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC_ZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC14sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC14sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC14sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC1BW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC1BW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC1BW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcCwt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcCwt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcCwt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC9DiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC9DiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC9DiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC6E8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC6E8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC6E8kM4xWR1_1bYURRojRGc.woff2'
    },
    'roboto_t6Nd4cfPRhZP44Q5QAjcC4gp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/t6Nd4cfPRhZP44Q5QAjcC4gp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/t6Nd4cfPRhZP44Q5QAjcC4gp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpfZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpfZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpfZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpV4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpV4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpV4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpVBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpVBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpVBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpQt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpQt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpQt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpdDiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpdDiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpdDiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpaE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpaE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpaE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'roboto_bmC0pGMXrhphrZJmniIZpYgp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/roboto/v15/bmC0pGMXrhphrZJmniIZpYgp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/bmC0pGMXrhphrZJmniIZpYgp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nFVSrcc0PghHf9qMZsyNJkz2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nFVSrcc0PghHf9qMZsyNJkz2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nFVSrcc0PghHf9qMZsyNJkz2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nPhvOq3OeDcncmG_JUglX9j2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nPhvOq3OeDcncmG_JUglX9j2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nPhvOq3OeDcncmG_JUglX9j2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nNYL0wkDYJdCinibQo0odb32Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nNYL0wkDYJdCinibQo0odb32Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nNYL0wkDYJdCinibQo0odb32Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nAXH_4GUKbrZpEK3n6JMwkL2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nAXH_4GUKbrZpEK3n6JMwkL2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nAXH_4GUKbrZpEK3n6JMwkL2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nKB_H2MGEFa8U8i2MA2qjRr2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nKB_H2MGEFa8U8i2MA2qjRr2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nKB_H2MGEFa8U8i2MA2qjRr2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nEkGkHRU10pzBW9xZ23ZxGr2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nEkGkHRU10pzBW9xZ23ZxGr2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nEkGkHRU10pzBW9xZ23ZxGr2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nCqOJfobX9lrC1wFVe9k15E.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nCqOJfobX9lrC1wFVe9k15E.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nCqOJfobX9lrC1wFVe9k15E.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsIPxuqWfQuZGbz5Rz4Zu1gk.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsIPxuqWfQuZGbz5Rz4Zu1gk.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsIPxuqWfQuZGbz5Rz4Zu1gk.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsENRpQQ4njX3CLaCqI4awdk.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsENRpQQ4njX3CLaCqI4awdk.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsENRpQQ4njX3CLaCqI4awdk.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsET2KMEyTWEzJqg9U8VS8XM.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsET2KMEyTWEzJqg9U8VS8XM.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsET2KMEyTWEzJqg9U8VS8XM.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsMH5J2QbmuFthYTFOnnSRco.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsMH5J2QbmuFthYTFOnnSRco.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsMH5J2QbmuFthYTFOnnSRco.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsDcCYxVKuOcslAgPRMZ8RJE.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsDcCYxVKuOcslAgPRMZ8RJE.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsDcCYxVKuOcslAgPRMZ8RJE.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsNKDSU5nPdoBdru70FiVyb0.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsNKDSU5nPdoBdru70FiVyb0.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsNKDSU5nPdoBdru70FiVyb0.woff2'
    },
    'robotocondensed_Zd2E9abXLFGSr9G3YK2MsH4vxAoi6d67T_UKWi0EoHQ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/Zd2E9abXLFGSr9G3YK2MsH4vxAoi6d67T_UKWi0EoHQ.woff2'],
        file: 'google-fonts/Zd2E9abXLFGSr9G3YK2MsH4vxAoi6d67T_UKWi0EoHQ.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nBYyuMfI6pbvLqniwcbLofP2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nBYyuMfI6pbvLqniwcbLofP2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nBYyuMfI6pbvLqniwcbLofP2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nIT75Viso9fCesWUO0IzDUX2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nIT75Viso9fCesWUO0IzDUX2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nIT75Viso9fCesWUO0IzDUX2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nL8EBb1YR1F8PhofwHtObrz2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nL8EBb1YR1F8PhofwHtObrz2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nL8EBb1YR1F8PhofwHtObrz2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nAro84VToOve-uw23YSmBS72Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nAro84VToOve-uw23YSmBS72Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nAro84VToOve-uw23YSmBS72Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nACS0ZgDg4kY8EFPTGlvyHP2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nACS0ZgDg4kY8EFPTGlvyHP2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nACS0ZgDg4kY8EFPTGlvyHP2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nGPMCwzADhgEiQ8LZ-01G1L2Ot9t5h1GRSTIE78Whtoh.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nGPMCwzADhgEiQ8LZ-01G1L2Ot9t5h1GRSTIE78Whtoh.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nGPMCwzADhgEiQ8LZ-01G1L2Ot9t5h1GRSTIE78Whtoh.woff2'
    },
    'robotocondensed_b9QBgL0iMZfDSpmcXcE8nPX2or14QGUHgbhSBV1Go0E.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/b9QBgL0iMZfDSpmcXcE8nPX2or14QGUHgbhSBV1Go0E.woff2'],
        file: 'google-fonts/b9QBgL0iMZfDSpmcXcE8nPX2or14QGUHgbhSBV1Go0E.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeABWARzQrKnxFaHcYHhWtNVOAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeABWARzQrKnxFaHcYHhWtNVOAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeABWARzQrKnxFaHcYHhWtNVOAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeALoB595XAUnp_0yd2Hv3nLuAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeALoB595XAUnp_0yd2Hv3nLuAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeALoB595XAUnp_0yd2Hv3nLuAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAHol3wgLMnom-Fg_O2vq6UGAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAHol3wgLMnom-Fg_O2vq6UGAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAHol3wgLMnom-Fg_O2vq6UGAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAFaI8MIWvjJEb_7o31_fSguAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAFaI8MIWvjJEb_7o31_fSguAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAFaI8MIWvjJEb_7o31_fSguAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeABtf2rfQXB_rP7MmbgatGLmAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeABtf2rfQXB_rP7MmbgatGLmAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeABtf2rfQXB_rP7MmbgatGLmAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAHpf1HD57Z5hGoBcaK5xoY-Axg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAHpf1HD57Z5hGoBcaK5xoY-Axg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAHpf1HD57Z5hGoBcaK5xoY-Axg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAL8HwCiP7DYII36AlQZXXQeglnMp3_3A8V8Ai8YosRtX.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAL8HwCiP7DYII36AlQZXXQeglnMp3_3A8V8Ai8YosRtX.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAL8HwCiP7DYII36AlQZXXQeglnMp3_3A8V8Ai8YosRtX.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJbddAa5tzErt2GRpy1oIbUz3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJbddAa5tzErt2GRpy1oIbUz3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJbddAa5tzErt2GRpy1oIbUz3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJbGolmRyAj21EwMT_eIZ7cf3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJbGolmRyAj21EwMT_eIZ7cf3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJbGolmRyAj21EwMT_eIZ7cf3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJcDQ90AUP4xoay-aKEVq5ov3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJcDQ90AUP4xoay-aKEVq5ov3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJcDQ90AUP4xoay-aKEVq5ov3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJSRBIFc7dVYZg2Pj5FA0cSX3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJSRBIFc7dVYZg2Pj5FA0cSX3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJSRBIFc7dVYZg2Pj5FA0cSX3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJdHw1WQkZiK8wh5eZKO9tyr3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJdHw1WQkZiK8wh5eZKO9tyr3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJdHw1WQkZiK8wh5eZKO9tyr3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJdAk6CpUeIePd9etbHDiLjL3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJdAk6CpUeIePd9etbHDiLjL3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJdAk6CpUeIePd9etbHDiLjL3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'robotocondensed_BP5K8ZAJv9qEbmuFp8RpJcGP5JAryr3W9Ob0znExBvs.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/BP5K8ZAJv9qEbmuFp8RpJcGP5JAryr3W9Ob0znExBvs.woff2'],
        file: 'google-fonts/BP5K8ZAJv9qEbmuFp8RpJcGP5JAryr3W9Ob0znExBvs.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeABgqylwWcylJ2w-CfjBgZ7yAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeABgqylwWcylJ2w-CfjBgZ7yAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeABgqylwWcylJ2w-CfjBgZ7yAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeACjx1lZFWT8UMf-jEunUDz-Axg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeACjx1lZFWT8UMf-jEunUDz-Axg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeACjx1lZFWT8UMf-jEunUDz-Axg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAI8qU_lT4BdpbdgXZhkEDKaAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAI8qU_lT4BdpbdgXZhkEDKaAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAI8qU_lT4BdpbdgXZhkEDKaAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAPJZ8u69X1ZI6u0Bq1WY3FqAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAPJZ8u69X1ZI6u0Bq1WY3FqAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAPJZ8u69X1ZI6u0Bq1WY3FqAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAA92UWC8GarrfOlsO0BVhoSAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAA92UWC8GarrfOlsO0BVhoSAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAA92UWC8GarrfOlsO0BVhoSAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAMVn2for1WIAtpulDRrWD0aAxg1Bnw5F8n5M1Q3pc3xZ.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAMVn2for1WIAtpulDRrWD0aAxg1Bnw5F8n5M1Q3pc3xZ.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAMVn2for1WIAtpulDRrWD0aAxg1Bnw5F8n5M1Q3pc3xZ.woff2'
    },
    'robotocondensed_mg0cGfGRUERshzBlvqxeAD80_Kjvv-UM5FLsk7nHpemglnMp3_3A8V8Ai8YosRtX.woff2': {
        urls: ['fonts.gstatic.com/s/robotocondensed/v13/mg0cGfGRUERshzBlvqxeAD80_Kjvv-UM5FLsk7nHpemglnMp3_3A8V8Ai8YosRtX.woff2'],
        file: 'google-fonts/mg0cGfGRUERshzBlvqxeAD80_Kjvv-UM5FLsk7nHpemglnMp3_3A8V8Ai8YosRtX.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgDk33lOKj8VrrOQDzFTd08I.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgDk33lOKj8VrrOQDzFTd08I.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgDk33lOKj8VrrOQDzFTd08I.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgCRwq2pY8iaQOLhk7E7z3MQ.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgCRwq2pY8iaQOLhk7E7z3MQ.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgCRwq2pY8iaQOLhk7E7z3MQ.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgK1KpwHvXV0QWt_dv_Co7sw.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgK1KpwHvXV0QWt_dv_Co7sw.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgK1KpwHvXV0QWt_dv_Co7sw.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgE5OsZPwuzdZYuBNMp4jBAU.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgE5OsZPwuzdZYuBNMp4jBAU.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgE5OsZPwuzdZYuBNMp4jBAU.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgCxfByIbZlww8-jwhlYXR1g.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgCxfByIbZlww8-jwhlYXR1g.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgCxfByIbZlww8-jwhlYXR1g.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgF19lPr_M5u0SZOsLIZJNh8.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgF19lPr_M5u0SZOsLIZJNh8.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgF19lPr_M5u0SZOsLIZJNh8.woff2'
    },
    'robotoslab_MEz38VLIFL-t46JUtkIEgNKT0E3VAiFQm6Fsw40EoXw.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/MEz38VLIFL-t46JUtkIEgNKT0E3VAiFQm6Fsw40EoXw.woff2'],
        file: 'google-fonts/MEz38VLIFL-t46JUtkIEgNKT0E3VAiFQm6Fsw40EoXw.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJUExlR2MysFCBK8OirNw2kM.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJUExlR2MysFCBK8OirNw2kM.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJUExlR2MysFCBK8OirNw2kM.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJWdsm03krrxlabhmVQFB99s.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJWdsm03krrxlabhmVQFB99s.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJWdsm03krrxlabhmVQFB99s.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJSJ0caWjaSBdV-xZbEgst_k.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJSJ0caWjaSBdV-xZbEgst_k.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJSJ0caWjaSBdV-xZbEgst_k.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJWMSHb9EAJwuSzGfuRChQzQ.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJWMSHb9EAJwuSzGfuRChQzQ.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJWMSHb9EAJwuSzGfuRChQzQ.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJepRBTtN4E2_qSPBnw6AgMc.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJepRBTtN4E2_qSPBnw6AgMc.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJepRBTtN4E2_qSPBnw6AgMc.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJdDnm4qiMZlH5rhYv_7LI2Y.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJdDnm4qiMZlH5rhYv_7LI2Y.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJdDnm4qiMZlH5rhYv_7LI2Y.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJdTIkQYohD4BpHvJ3NvbHoA.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJdTIkQYohD4BpHvJ3NvbHoA.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJdTIkQYohD4BpHvJ3NvbHoA.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37ZvZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37ZvZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37ZvZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37Zl4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37Zl4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37Zl4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37ZlBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37ZlBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37ZlBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37Zgt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37Zgt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37Zgt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37ZtDiNsR5a-9Oe_Ivpu8XWlY.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37ZtDiNsR5a-9Oe_Ivpu8XWlY.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37ZtDiNsR5a-9Oe_Ivpu8XWlY.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37ZqE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37ZqE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37ZqE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'robotoslab_y7lebkjgREBJK96VQi37Zogp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/y7lebkjgREBJK96VQi37Zogp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/y7lebkjgREBJK96VQi37Zogp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJQXaAXup5mZlfK6xRLrhsco.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJQXaAXup5mZlfK6xRLrhsco.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJQXaAXup5mZlfK6xRLrhsco.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJVx-M1I1w5OMiqnVF8xBLhU.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJVx-M1I1w5OMiqnVF8xBLhU.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJVx-M1I1w5OMiqnVF8xBLhU.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJVT7aJLK6nKpn36IMwTcMMc.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJVT7aJLK6nKpn36IMwTcMMc.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJVT7aJLK6nKpn36IMwTcMMc.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJQn6Wqxo-xwxilDXPU8chVU.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJQn6Wqxo-xwxilDXPU8chVU.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJQn6Wqxo-xwxilDXPU8chVU.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJcbIQSYZnWLaWC9QNCpTK_U.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJcbIQSYZnWLaWC9QNCpTK_U.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJcbIQSYZnWLaWC9QNCpTK_U.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJYgd9OEPUCN3AdYW0e8tat4.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJYgd9OEPUCN3AdYW0e8tat4.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJYgd9OEPUCN3AdYW0e8tat4.woff2'
    },
    'robotoslab_dazS1PrQQuCxC3iOAJFEJf79_ZuUxCigM2DespTnFaw.woff2': {
        urls: ['fonts.gstatic.com/s/robotoslab/v6/dazS1PrQQuCxC3iOAJFEJf79_ZuUxCigM2DespTnFaw.woff2'],
        file: 'google-fonts/dazS1PrQQuCxC3iOAJFEJf79_ZuUxCigM2DespTnFaw.woff2'
    },
    'slabo27px_LfR9_S_HMdQ73mwIHBRxoQsYbbCjybiHxArTLjt7FRU.woff2': {
        urls: ['fonts.gstatic.com/s/slabo27px/v3/LfR9_S_HMdQ73mwIHBRxoQsYbbCjybiHxArTLjt7FRU.woff2'],
        file: 'google-fonts/LfR9_S_HMdQ73mwIHBRxoQsYbbCjybiHxArTLjt7FRU.woff2'
    },
    'slabo27px_PuwvqkdbcqU-fCZ9Ed-b7QzyDMXhdD8sAj6OAJTFsBI.woff2': {
        urls: ['fonts.gstatic.com/s/slabo27px/v3/PuwvqkdbcqU-fCZ9Ed-b7QzyDMXhdD8sAj6OAJTFsBI.woff2'],
        file: 'google-fonts/PuwvqkdbcqU-fCZ9Ed-b7QzyDMXhdD8sAj6OAJTFsBI.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGBtvTbjs3T7OK9b50AXe70D3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGBtvTbjs3T7OK9b50AXe70D3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGBtvTbjs3T7OK9b50AXe70D3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGDvlGRZ3uCFbvUJSJFyaVCX3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGDvlGRZ3uCFbvUJSJFyaVCX3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGDvlGRZ3uCFbvUJSJFyaVCX3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGIAPdqzPmKFFIYQ-46z3JxY.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGIAPdqzPmKFFIYQ-46z3JxY.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGIAPdqzPmKFFIYQ-46z3JxY.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGCD5K6T8I4oZ1X3Xvlj_UeP3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGCD5K6T8I4oZ1X3Xvlj_UeP3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGCD5K6T8I4oZ1X3Xvlj_UeP3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGDOFnJNygIkrHciC8BWzbCz3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGDOFnJNygIkrHciC8BWzbCz3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGDOFnJNygIkrHciC8BWzbCz3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGCP2LEk6lMzYsRqr3dHFImA.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGCP2LEk6lMzYsRqr3dHFImA.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGCP2LEk6lMzYsRqr3dHFImA.woff2'
    },
    'sourcesanspro_ODelI1aHBYDBqgeIAH2zlCxe5Tewm2_XWfbGchcXw4g.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/ODelI1aHBYDBqgeIAH2zlCxe5Tewm2_XWfbGchcXw4g.woff2'],
        file: 'google-fonts/ODelI1aHBYDBqgeIAH2zlCxe5Tewm2_XWfbGchcXw4g.woff2'
    },
    'sourcesanspro_ODelI1aHBYDBqgeIAH2zlIa1YDtoarzwSXxTHggEXMw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/ODelI1aHBYDBqgeIAH2zlIa1YDtoarzwSXxTHggEXMw.woff2'],
        file: 'google-fonts/ODelI1aHBYDBqgeIAH2zlIa1YDtoarzwSXxTHggEXMw.woff2'
    },
    'sourcesanspro_ODelI1aHBYDBqgeIAH2zlJbPFduIYtoLzwST68uhz_Y.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/ODelI1aHBYDBqgeIAH2zlJbPFduIYtoLzwST68uhz_Y.woff2'],
        file: 'google-fonts/ODelI1aHBYDBqgeIAH2zlJbPFduIYtoLzwST68uhz_Y.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGMZXFz2iDKd7GJNSaxRYiSj3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGMZXFz2iDKd7GJNSaxRYiSj3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGMZXFz2iDKd7GJNSaxRYiSj3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGKyGJhAh-RE0BxGcd_izyev3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGKyGJhAh-RE0BxGcd_izyev3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGKyGJhAh-RE0BxGcd_izyev3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGMzFoXZ-Kj537nB_-9jJhlA.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGMzFoXZ-Kj537nB_-9jJhlA.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGMzFoXZ-Kj537nB_-9jJhlA.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGMms7UHsIbjUxEJqIwog-i_3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGMms7UHsIbjUxEJqIwog-i_3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGMms7UHsIbjUxEJqIwog-i_3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGO4s1Ux4PuImWPk5fSr6HPL3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGO4s1Ux4PuImWPk5fSr6HPL3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGO4s1Ux4PuImWPk5fSr6HPL3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGJkF8H8ye47wsfpWywda8og.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGJkF8H8ye47wsfpWywda8og.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGJkF8H8ye47wsfpWywda8og.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGDCgBLtsnrdK1Wb_YMpk1Ez3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGDCgBLtsnrdK1Wb_YMpk1Ez3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGDCgBLtsnrdK1Wb_YMpk1Ez3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGKfQKEmnUd3GHgKOgaFw3O33rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGKfQKEmnUd3GHgKOgaFw3O33rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGKfQKEmnUd3GHgKOgaFw3O33rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_toadOcfmlt9b38dHJxOBGIq-Fb0zf838trI74uojZQY.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/toadOcfmlt9b38dHJxOBGIq-Fb0zf838trI74uojZQY.woff2'],
        file: 'google-fonts/toadOcfmlt9b38dHJxOBGIq-Fb0zf838trI74uojZQY.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6HrrPK-X2CVck6oRtpE0Ze0U24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6HrrPK-X2CVck6oRtpE0Ze0U24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6HrrPK-X2CVck6oRtpE0Ze0U24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6AVQ7_spPtgmpD0WsmkG12kU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6AVQ7_spPtgmpD0WsmkG12kU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6AVQ7_spPtgmpD0WsmkG12kU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6KwWwkY55OPAcpsgnrG5el_3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6KwWwkY55OPAcpsgnrG5el_3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6KwWwkY55OPAcpsgnrG5el_3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6B_gmbEOuTnFVLOcZ03JXzUU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6B_gmbEOuTnFVLOcZ03JXzUU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6B_gmbEOuTnFVLOcZ03JXzUU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6I592LlB3Spcld5cOzjZxycU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6I592LlB3Spcld5cOzjZxycU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6I592LlB3Spcld5cOzjZxycU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6KWfmYpLTwMIZXVESxMi2BP3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6KWfmYpLTwMIZXVESxMi2BP3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6KWfmYpLTwMIZXVESxMi2BP3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_M2Jd71oPJhLKp0zdtTvoM-hx0s8EczIZ6Z1k6LZjTLo.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/M2Jd71oPJhLKp0zdtTvoM-hx0s8EczIZ6Z1k6LZjTLo.woff2'],
        file: 'google-fonts/M2Jd71oPJhLKp0zdtTvoM-hx0s8EczIZ6Z1k6LZjTLo.woff2'
    },
    'sourcesanspro_M2Jd71oPJhLKp0zdtTvoMyVjDpjOAxwEYJFCET2nD1s.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/M2Jd71oPJhLKp0zdtTvoMyVjDpjOAxwEYJFCET2nD1s.woff2'],
        file: 'google-fonts/M2Jd71oPJhLKp0zdtTvoMyVjDpjOAxwEYJFCET2nD1s.woff2'
    },
    'sourcesanspro_M2Jd71oPJhLKp0zdtTvoM2Sl3jWJ3D9poyJPMfASioc.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/M2Jd71oPJhLKp0zdtTvoM2Sl3jWJ3D9poyJPMfASioc.woff2'],
        file: 'google-fonts/M2Jd71oPJhLKp0zdtTvoM2Sl3jWJ3D9poyJPMfASioc.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6O0_5fr73lDnMnLTNvHFLLgU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6O0_5fr73lDnMnLTNvHFLLgU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6O0_5fr73lDnMnLTNvHFLLgU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6FJb469ExK4t7Ej8F0pF-7kU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6FJb469ExK4t7Ej8F0pF-7kU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6FJb469ExK4t7Ej8F0pF-7kU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6FuRfpT8-4D6FEAtfkspckX3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6FuRfpT8-4D6FEAtfkspckX3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6FuRfpT8-4D6FEAtfkspckX3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6BIH5AMGdfkCfzO-3kW1eBkU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6BIH5AMGdfkCfzO-3kW1eBkU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6BIH5AMGdfkCfzO-3kW1eBkU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6DxmxCZT8kOrXNPkfBESV6YU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6DxmxCZT8kOrXNPkfBESV6YU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6DxmxCZT8kOrXNPkfBESV6YU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6H0cQ2LOPDPk8GfVMt0MqYH3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6H0cQ2LOPDPk8GfVMt0MqYH3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6H0cQ2LOPDPk8GfVMt0MqYH3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6Cdo2FcJU5lnxhFuvRqmE7EU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6Cdo2FcJU5lnxhFuvRqmE7EU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6Cdo2FcJU5lnxhFuvRqmE7EU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6I4KtbziG5G4MV5yM-AMBaIU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6I4KtbziG5G4MV5yM-AMBaIU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6I4KtbziG5G4MV5yM-AMBaIU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'sourcesanspro_fpTVHK8qsXbIeTHTrnQH6Ekie17uDcARvvg0QA3ZZLH3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/sourcesanspro/v9/fpTVHK8qsXbIeTHTrnQH6Ekie17uDcARvvg0QA3ZZLH3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/fpTVHK8qsXbIeTHTrnQH6Ekie17uDcARvvg0QA3ZZLH3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wprzS7C564OTp_INgXTr8EAGg.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wprzS7C564OTp_INgXTr8EAGg.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wprzS7C564OTp_INgXTr8EAGg.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wprwncwICprNeqbmuPE2HfhOU.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wprwncwICprNeqbmuPE2HfhOU.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wprwncwICprNeqbmuPE2HfhOU.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr30ibtJ3ueB9Z81J478WEJQ.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr30ibtJ3ueB9Z81J478WEJQ.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr30ibtJ3ueB9Z81J478WEJQ.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr6YfJ4wTnNoNUCmOpdh16Tg.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr6YfJ4wTnNoNUCmOpdh16Tg.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr6YfJ4wTnNoNUCmOpdh16Tg.woff2'
    },
    'titilliumweb_7XUFZ5tgS-tD6QamInJTcSGR3J8a2Jm30YJvJ3tIMOY.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/7XUFZ5tgS-tD6QamInJTcSGR3J8a2Jm30YJvJ3tIMOY.woff2'],
        file: 'google-fonts/7XUFZ5tgS-tD6QamInJTcSGR3J8a2Jm30YJvJ3tIMOY.woff2'
    },
    'titilliumweb_7XUFZ5tgS-tD6QamInJTceHuglUR2dhBxWD-q_ehMME.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/7XUFZ5tgS-tD6QamInJTceHuglUR2dhBxWD-q_ehMME.woff2'],
        file: 'google-fonts/7XUFZ5tgS-tD6QamInJTceHuglUR2dhBxWD-q_ehMME.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr1Tcxd1fGlbIJMCb5Y260Wk.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr1Tcxd1fGlbIJMCb5Y260Wk.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr1Tcxd1fGlbIJMCb5Y260Wk.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr6d1JQt-lS5nD-1TJX2NNl0.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr6d1JQt-lS5nD-1TJX2NNl0.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr6d1JQt-lS5nD-1TJX2NNl0.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr6nZAMwsGZpiGJKtVINElMQ.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr6nZAMwsGZpiGJKtVINElMQ.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr6nZAMwsGZpiGJKtVINElMQ.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr8hG3LOB74UqS1hPmWaAxzQ.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr8hG3LOB74UqS1hPmWaAxzQ.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr8hG3LOB74UqS1hPmWaAxzQ.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpry6ppOJQXOpn8IlQzTbo2Ns.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpry6ppOJQXOpn8IlQzTbo2Ns.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpry6ppOJQXOpn8IlQzTbo2Ns.woff2'
    },
    'titilliumweb_anMUvcNT0H1YN4FII8wpr38V1Ceyva9e1TrsMaWAC_w.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/anMUvcNT0H1YN4FII8wpr38V1Ceyva9e1TrsMaWAC_w.woff2'],
        file: 'google-fonts/anMUvcNT0H1YN4FII8wpr38V1Ceyva9e1TrsMaWAC_w.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPlJE2ff-A43GlZDxz8FPlfj3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPlJE2ff-A43GlZDxz8FPlfj3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPlJE2ff-A43GlZDxz8FPlfj3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPhd7TTgBBEGVxkjmQgbPAyw.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPhd7TTgBBEGVxkjmQgbPAyw.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPhd7TTgBBEGVxkjmQgbPAyw.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPiOhBaFVoVDc-z8-DYP2cCb3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPiOhBaFVoVDc-z8-DYP2cCb3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPiOhBaFVoVDc-z8-DYP2cCb3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPkb38SFW3SGHxd5c_83r5xk.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPkb38SFW3SGHxd5c_83r5xk.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPkb38SFW3SGHxd5c_83r5xk.woff2'
    },
    'titilliumweb_r9OmwyQxrgzUAhaLET_KOyohs_GVCV93aZwGb7eT-mc.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/r9OmwyQxrgzUAhaLET_KOyohs_GVCV93aZwGb7eT-mc.woff2'],
        file: 'google-fonts/r9OmwyQxrgzUAhaLET_KOyohs_GVCV93aZwGb7eT-mc.woff2'
    },
    'titilliumweb_r9OmwyQxrgzUAhaLET_KO04Sq3N3sm-tF9FpL8sHob4.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/r9OmwyQxrgzUAhaLET_KO04Sq3N3sm-tF9FpL8sHob4.woff2'],
        file: 'google-fonts/r9OmwyQxrgzUAhaLET_KO04Sq3N3sm-tF9FpL8sHob4.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPgHWXvJEMqz2JvmyFwzXZKX3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPgHWXvJEMqz2JvmyFwzXZKX3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPgHWXvJEMqz2JvmyFwzXZKX3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPubnHKM7EA09T6nhONWaMpo.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPubnHKM7EA09T6nhONWaMpo.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPubnHKM7EA09T6nhONWaMpo.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPrllv97p_r9FmS3SWdZzB6_3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPrllv97p_r9FmS3SWdZzB6_3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPrllv97p_r9FmS3SWdZzB6_3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'titilliumweb_RZunN20OBmkvrU7sA4GPPipre1WS4Xml-pRMufJH74k.woff2': {
        urls: ['fonts.gstatic.com/s/titilliumweb/v4/RZunN20OBmkvrU7sA4GPPipre1WS4Xml-pRMufJH74k.woff2'],
        file: 'google-fonts/RZunN20OBmkvrU7sA4GPPipre1WS4Xml-pRMufJH74k.woff2'
    },
    'ubuntu_X_EdMnknKUltk57alVVbV4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/X_EdMnknKUltk57alVVbV4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/X_EdMnknKUltk57alVVbV4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_nBF2d6Y3AbOwfkBM-9HcWIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/nBF2d6Y3AbOwfkBM-9HcWIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/nBF2d6Y3AbOwfkBM-9HcWIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_CdlIlwqST01WNAKqZbtZkoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/CdlIlwqST01WNAKqZbtZkoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/CdlIlwqST01WNAKqZbtZkoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_7k0RmqCN8EFxqS6sChuRzYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/7k0RmqCN8EFxqS6sChuRzYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/7k0RmqCN8EFxqS6sChuRzYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_WtcvfJHWXKxx4x0kuS1koYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/WtcvfJHWXKxx4x0kuS1koYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/WtcvfJHWXKxx4x0kuS1koYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu__aijTyevf54tkVDLy-dlnJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/_aijTyevf54tkVDLy-dlnJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/_aijTyevf54tkVDLy-dlnJBw1xU1rKptJj_0jans920.woff2'
    },
    'ubuntu_BxfrwvhZBmVnDwajjdTQeH-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/BxfrwvhZBmVnDwajjdTQeH-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/BxfrwvhZBmVnDwajjdTQeH-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'ubuntu_rOHfGaogav5XpJHYhB_YZ3-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/rOHfGaogav5XpJHYhB_YZ3-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/rOHfGaogav5XpJHYhB_YZ3-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'ubuntu_zwDIfh8KEInP4WYoM7h0b3-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/zwDIfh8KEInP4WYoM7h0b3-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/zwDIfh8KEInP4WYoM7h0b3-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'ubuntu_BgwOR-U84B6EluzUITbpkH-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/BgwOR-U84B6EluzUITbpkH-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/BgwOR-U84B6EluzUITbpkH-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'ubuntu_Zcmru5bcP_p_TwCNg-F3DH-_kf6ByYO6CLYdB4HQE-Y.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/Zcmru5bcP_p_TwCNg-F3DH-_kf6ByYO6CLYdB4HQE-Y.woff2'],
        file: 'google-fonts/Zcmru5bcP_p_TwCNg-F3DH-_kf6ByYO6CLYdB4HQE-Y.woff2'
    },
    'ubuntu_zvCUQcxqeoKhyOlbifSAaevvDin1pK8aKteLpeZ5c0A.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/zvCUQcxqeoKhyOlbifSAaevvDin1pK8aKteLpeZ5c0A.woff2'],
        file: 'google-fonts/zvCUQcxqeoKhyOlbifSAaevvDin1pK8aKteLpeZ5c0A.woff2'
    },
    'ubuntu_MLKvhAbswThSVACnSTWCp4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/MLKvhAbswThSVACnSTWCp4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/MLKvhAbswThSVACnSTWCp4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_IiMFELcoPB-OzGzq14k4eoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/IiMFELcoPB-OzGzq14k4eoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/IiMFELcoPB-OzGzq14k4eoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_H2j4_4xA-HIuoc_A3BIwVIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/H2j4_4xA-HIuoc_A3BIwVIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/H2j4_4xA-HIuoc_A3BIwVIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_EtSRPnpS3nIR-zKYiR-sDIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/EtSRPnpS3nIR-zKYiR-sDIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/EtSRPnpS3nIR-zKYiR-sDIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_gMhvhm-nVj1086DvGgmzB4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/gMhvhm-nVj1086DvGgmzB4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/gMhvhm-nVj1086DvGgmzB4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_OsJ2DjdpjqFRVUSto6IffJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OsJ2DjdpjqFRVUSto6IffJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/OsJ2DjdpjqFRVUSto6IffJBw1xU1rKptJj_0jans920.woff2'
    },
    'ubuntu_oxrPYIm05JrY_0rFIEQ_oYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/oxrPYIm05JrY_0rFIEQ_oYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/oxrPYIm05JrY_0rFIEQ_oYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_4z2U46_RRLOfkoHsWJG3v4X0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/4z2U46_RRLOfkoHsWJG3v4X0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/4z2U46_RRLOfkoHsWJG3v4X0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_2vaWVxeAxHVkFcnCBCQCyYX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/2vaWVxeAxHVkFcnCBCQCyYX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/2vaWVxeAxHVkFcnCBCQCyYX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_M-Ii49WH_TYYnOjQyLgTMIX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/M-Ii49WH_TYYnOjQyLgTMIX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/M-Ii49WH_TYYnOjQyLgTMIX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_nsLtvfQoT-rVwGTHHnkeJoX0hVgzZQUfRDuZrPvH3D8.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/nsLtvfQoT-rVwGTHHnkeJoX0hVgzZQUfRDuZrPvH3D8.woff2'],
        file: 'google-fonts/nsLtvfQoT-rVwGTHHnkeJoX0hVgzZQUfRDuZrPvH3D8.woff2'
    },
    'ubuntu_0ihfXUL2emPh0ROJezvraJBw1xU1rKptJj_0jans920.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/0ihfXUL2emPh0ROJezvraJBw1xU1rKptJj_0jans920.woff2'],
        file: 'google-fonts/0ihfXUL2emPh0ROJezvraJBw1xU1rKptJj_0jans920.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6VvZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6VvZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6VvZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6Vl4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6Vl4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6Vl4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6VlBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6VlBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6VlBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6Vgt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6Vgt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6Vgt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6VqE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6VqE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6VqE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'ubuntu_DZ_YjBPqZ88vcZCcIXm6Vogp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/DZ_YjBPqZ88vcZCcIXm6Vogp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/DZ_YjBPqZ88vcZCcIXm6Vogp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'ubuntu_w3OQMu9Ox3bN1d9i3mbh2xkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/w3OQMu9Ox3bN1d9i3mbh2xkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/w3OQMu9Ox3bN1d9i3mbh2xkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ubuntu_LYvzNpa5ecqVXi8cf4pj-hkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/LYvzNpa5ecqVXi8cf4pj-hkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/LYvzNpa5ecqVXi8cf4pj-hkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ubuntu_T0N0BD55aMuIijZeoZ4TJBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/T0N0BD55aMuIijZeoZ4TJBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/T0N0BD55aMuIijZeoZ4TJBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ubuntu_RunG4-izX6wYOuWLUJmsihkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/RunG4-izX6wYOuWLUJmsihkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/RunG4-izX6wYOuWLUJmsihkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ubuntu_IZYv9ktJI5s8uIr0hWnbSBkAz4rYn47Zy2rvigWQf6w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/IZYv9ktJI5s8uIr0hWnbSBkAz4rYn47Zy2rvigWQf6w.woff2'],
        file: 'google-fonts/IZYv9ktJI5s8uIr0hWnbSBkAz4rYn47Zy2rvigWQf6w.woff2'
    },
    'ubuntu_WB6rgjTg_oRfj6mlXZJbb3YhjbSpvc47ee6xR_80Hnw.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/WB6rgjTg_oRfj6mlXZJbb3YhjbSpvc47ee6xR_80Hnw.woff2'],
        file: 'google-fonts/WB6rgjTg_oRfj6mlXZJbb3YhjbSpvc47ee6xR_80Hnw.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwvZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwvZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwvZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwl4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwl4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwl4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwlBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwlBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwlBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwgt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwgt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwgt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwqE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwqE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwqE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'ubuntu_ohKfORL_YnhBMzkCPoIqwogp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/ohKfORL_YnhBMzkCPoIqwogp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/ohKfORL_YnhBMzkCPoIqwogp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7fZraR2Tg8w2lzm7kLNL0-w.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7fZraR2Tg8w2lzm7kLNL0-w.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7fZraR2Tg8w2lzm7kLNL0-w.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7V4sYYdJg5dU2qzJEVSuta0.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7V4sYYdJg5dU2qzJEVSuta0.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7V4sYYdJg5dU2qzJEVSuta0.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7VBW26QxpSj-_ZKm_xT4hWw.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7VBW26QxpSj-_ZKm_xT4hWw.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7VBW26QxpSj-_ZKm_xT4hWw.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7Qt_Rm691LTebKfY2ZkKSmI.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7Qt_Rm691LTebKfY2ZkKSmI.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7Qt_Rm691LTebKfY2ZkKSmI.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7aE8kM4xWR1_1bYURRojRGc.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7aE8kM4xWR1_1bYURRojRGc.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7aE8kM4xWR1_1bYURRojRGc.woff2'
    },
    'ubuntu_OMD20Sg9RTs7sUORCEN-7Ygp9Q8gbYrhqGlRav_IXfk.woff2': {
        urls: ['fonts.gstatic.com/s/ubuntu/v8/OMD20Sg9RTs7sUORCEN-7Ygp9Q8gbYrhqGlRav_IXfk.woff2'],
        file: 'google-fonts/OMD20Sg9RTs7sUORCEN-7Ygp9Q8gbYrhqGlRav_IXfk.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRbvQMs1fw8fEQY4hjSRsy20U24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRbvQMs1fw8fEQY4hjSRsy20U24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRbvQMs1fw8fEQY4hjSRsy20U24FapfJwyacJ6xNu5rm9.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRYuLSQHnHW2U4NkxJ--PfJX3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRYuLSQHnHW2U4NkxJ--PfJX3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRYuLSQHnHW2U4NkxJ--PfJX3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRaRGoYQ12OX6Zk_h61clj9kU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRaRGoYQ12OX6Zk_h61clj9kU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRaRGoYQ12OX6Zk_h61clj9kU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRQu-MN34z13_ekgfqZIJiYv3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRQu-MN34z13_ekgfqZIJiYv3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRQu-MN34z13_ekgfqZIJiYv3rGVtsTkPsbDajuO5ueQw.woff2'
    },
    'yanonekaffeesatz_YDAoLskQQ5MOAgvHUQCcLaa0P60JZGaCMFbL3N9v4H0.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/YDAoLskQQ5MOAgvHUQCcLaa0P60JZGaCMFbL3N9v4H0.woff2'],
        file: 'google-fonts/YDAoLskQQ5MOAgvHUQCcLaa0P60JZGaCMFbL3N9v4H0.woff2'
    },
    'yanonekaffeesatz_YDAoLskQQ5MOAgvHUQCcLWjF_m7mVnhXExjNED3rUtY.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/YDAoLskQQ5MOAgvHUQCcLWjF_m7mVnhXExjNED3rUtY.woff2'],
        file: 'google-fonts/YDAoLskQQ5MOAgvHUQCcLWjF_m7mVnhXExjNED3rUtY.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRRX-JRbUdQPdhHf_PancrjIU24FapfJwyacJ6xNu5rm9.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRRX-JRbUdQPdhHf_PancrjIU24FapfJwyacJ6xNu5rm9.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRRX-JRbUdQPdhHf_PancrjIU24FapfJwyacJ6xNu5rm9.woff2'
    },
    'yanonekaffeesatz_We_iSDqttE3etzfdfhuPRWOaRr2aRL0G9SOCibVUDmr3rGVtsTkPsbDajuO5ueQw.woff2': {
        urls: ['fonts.gstatic.com/s/yanonekaffeesatz/v7/We_iSDqttE3etzfdfhuPRWOaRr2aRL0G9SOCibVUDmr3rGVtsTkPsbDajuO5ueQw.woff2'],
        file: 'google-fonts/We_iSDqttE3etzfdfhuPRWOaRr2aRL0G9SOCibVUDmr3rGVtsTkPsbDajuO5ueQw.woff2'
    }
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var helpers_1 = __webpack_require__(1);
var STORAGE_KEY = 'stats';
var stats = {
    tabStats: {},
    allStats: {
        count: 0,
        libs: {}
    }
};
if (localStorage.getItem(STORAGE_KEY)) {
    stats = JSON.parse(localStorage.getItem(STORAGE_KEY));
}
console.log('Stats:', stats);
var hasLib = function (entry, lib) {
    return entry.libs.indexOf(lib) > -1;
};
var doesNotHaveLib = helpers_1.not(hasLib);
var addLib = function (entry, lib) {
    return entry.libs.push(lib);
};
var increaseCount = function (counter) {
    return counter.count += 1;
};
var getPageEntry = function (stats, pageURI) {
    return stats.tabStats[pageURI];
};
var hasPageEntry = function (stats, pageURI) {
    return stats.tabStats[pageURI] !== undefined;
};
var doesNotHavePageEntry = helpers_1.not(hasPageEntry);
var createPageEntry = function (stats, pageURI) {
    return stats.tabStats[pageURI] = {
        count: 0,
        libs: []
    };
};
var getTotalEntry = function (stats, lib) {
    return stats.allStats.libs[lib];
};
var hasTotalEntry = function (stats, lib) {
    return stats.allStats.libs[lib] !== undefined;
};
var doesNotHaveTotalEntry = helpers_1.not(hasTotalEntry);
var createTotalEntry = function (stats, lib) {
    return stats.allStats.libs[lib] = {
        count: 0
    };
};
var trackPageHit = function (stats, pageURI, lib) {
    if (doesNotHavePageEntry(stats, pageURI))
        createPageEntry(stats, pageURI);
    var entry = getPageEntry(stats, pageURI);
    addLib(entry, lib);
    increaseCount(entry);
};
var trackTotalHit = function (stats, lib) {
    if (doesNotHaveTotalEntry(stats, lib))
        createTotalEntry(stats, lib);
    var entry = getTotalEntry(stats, lib);
    increaseCount(entry);
};
exports.addBoost = function (tabId, parsedURL) {
    chrome.tabs.get(tabId, function (tab) {
        // .url requires "tabs" permission
        var pageURI = helpers_1.getUriFromTab(tab);
        var lib = parsedURL.library;
        trackPageHit(stats, pageURI, lib);
        trackTotalHit(stats, lib);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    });
};
exports.getPageStats = function (tabId, fn) {
    return chrome.tabs.get(tabId, function (tab) {
        var pageURI = helpers_1.getUriFromTab(tab);
        fn(getPageEntry(stats, pageURI));
    });
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var reg_config_1 = __webpack_require__(9);
var requestInterceptor_1 = __webpack_require__(0);
var configSyntax_1 = __webpack_require__(2);
var helpers_1 = __webpack_require__(1);
var keys = Object.keys(reg_config_1.versions);
var regExps = {};
// prebuild regexps
keys.forEach(function (key) { return regExps[key] = new RegExp(reg_config_1.versions[key].pattern); });
console.log('regexps in regcheck ', regExps);
function regCheck(normalizedUrl, tabId) {
    if (normalizedUrl.isExtension) {
        return;
    }
    var url = normalizedUrl.uri;
    //	console.log('reg check', url)
    var matchedKeys = keys.filter(matchUrl(url));
    var versionedKeys = matchedKeys.filter(withVersions);
    var unversionedKeys = matchedKeys.filter(helpers_1.not(withVersions));
    var substitutedVersionedUrls = versionedKeys.map(extractVersion(url))
        .filter(hasExtractedVersion)
        .map(extractedVersion)
        .filter(hasDefinedSubstitution)
        .map(substitute(url));
    var substitutedUnversionedUrls = unversionedKeys.map(substituteUnversioned(url));
    var newUrls = substitutedVersionedUrls.concat(substitutedUnversionedUrls);
    if (newUrls.length > 0) {
        normalizedUrl.boostedBy = 'reg';
        return requestInterceptor_1.redirect(newUrls[0], tabId, normalizedUrl);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
}
exports.regCheck = regCheck;
;
var matchUrl = function (url) {
    return function (key) {
        return regExps[key].test(url);
    };
};
var withVersions = function (key) {
    return reg_config_1.versions[key].versions !== undefined;
};
var extractVersion = function (url) {
    return function (key) { return [key, regExps[key].exec(url)]; };
};
var hasExtractedVersion = function (keyVersionMatch) {
    var versionMatch = keyVersionMatch[keyVersionMatch.length - 1];
    return (versionMatch != null ? versionMatch.length : undefined) > 1;
};
var extractedVersion = function (keyVersionMatch) {
    var key = keyVersionMatch[0];
    var versionMatch = keyVersionMatch[1];
    //const [key, versionMatch] = Array.from(keyVersionMatch);
    return [key, versionMatch[1]];
};
var hasDefinedSubstitution = function (keyVersion) {
    var key = keyVersion[0];
    var version = keyVersion[1];
    return reg_config_1.versions[key].versions.indexOf(version > -1);
};
var substitute = function (url) {
    return function (keyVersion) {
        var key = keyVersion[0];
        var version = keyVersion[1];
        return reg_config_1.versions[key].file.replace(configSyntax_1.VERSION_TAG, version);
    };
};
var substituteUnversioned = function (url) {
    return function (key) { return reg_config_1.versions[key].file; };
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var semver = '\\s*[v=]*\\s*([0-9]+\\.[0-9]+\\.[0-9]+(-[0-9]+-?)?([a-zA-Z-+][a-zA-Z0-9-.:]*)?)';
exports.versions = {
    // wordpress-specific pattern
    'wordpress-specific jquery': {
        pattern: "jquery.js\\?ver=" + semver,
        file: 'jquery/$version$/jquery.min.js'
    },
    // wordpress-specific pattern
    'wordpress-specific jquery-migrate': {
        pattern: "jquery-migrate.min.js\\?ver=" + semver,
        versions: [
            '1.2.1'
        ],
        file: 'jquery-migrate/$version$/jquery-migrate.min.js'
    },
    'jquery-migrate w/o version': {
        pattern: 'jquery-migrate.min.js',
        file: 'jquery-migrate/1.2.1/jquery-migrate.min.js'
    },
    'jquery-migrate w version': {
        pattern: "jquery-migrate-" + semver + ".min.js",
        file: 'jquery-migrate/1.2.1/jquery-migrate.min.js'
    },
    'jquery': {
        pattern: "jquery-" + semver + ".min.js$",
        versions: [
            '2.2.2',
            '2.2.1',
            '2.2.0',
            '2.1.4',
            '2.1.3',
            '2.1.2',
            '2.1.1',
            '2.1.0',
            '2.0.3',
            '2.0.2',
            '2.0.1',
            '2.0.0',
            '1.11.3',
            '1.11.2',
            '1.11.1',
            '1.11.0',
            '1.10.2',
            '1.10.1',
            '1.10.0',
            '1.9.1',
            '1.9.0',
            '1.8.3',
            '1.8.2',
            '1.8.1',
            '1.8.0',
            '1.7.2',
            '1.7.1',
            '1.7.0',
            '1.6.4',
            '1.6.3',
            '1.6.2',
            '1.6.1',
            '1.6.0',
            '1.5.2',
            '1.5.1',
            '1.5.0',
            '1.4.4',
            '1.4.3',
            '1.4.2',
            '1.4.1'
        ],
        file: 'jquery/$version$/jquery.min.js'
    }
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var requestInterceptor_1 = __webpack_require__(0);
// todo import real filters
var blockList = {
    'bla.com': true
};
var isInBlocklist = function (host) {
    return blockList[host];
};
exports.check = function (parsedURL, tabId) {
    if (parsedURL.isExtension)
        return;
    //host totally matches the MSVP entry
    if (isInBlocklist(parsedURL.host)) {
        parsedURL.boostedBy = 'msvp';
        return requestInterceptor_1.block(tabId, parsedURL);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

var helpers_1 = __webpack_require__(1);
//const getUri = require('./helpers').getUriFromTab;
exports.load = function () {
    var state = null;
    if (localStorage["state"]) {
        state = JSON.parse(localStorage["state"]);
    }
    if (state == null) {
        state = {};
    }
    state.get = function (tabId, cb) {
        return chrome.tabs.get(tabId, function (tab) {
            var id = helpers_1.getUriFromTab(tab);
            var pageConfig = state[id] || { id: id };
            return cb(pageConfig);
        });
    };
    state.forHost = function (host) { return state[host]; };
    state.sync = function (pageConfig) {
        state[pageConfig.id] = pageConfig;
        localStorage["state"] = JSON.stringify(this);
        return this;
    };
    return state;
};


/***/ })
/******/ ]);