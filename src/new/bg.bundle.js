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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var helpers_1 = __webpack_require__(1);
var stats_1 = __webpack_require__(6);
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

var url_1 = __webpack_require__(2);
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

var configSyntax_1 = __webpack_require__(5);
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hashCheck_1 = __webpack_require__(4);
var regCheck_1 = __webpack_require__(7);
var msvpCheck_1 = __webpack_require__(8);
var requestInterceptor_1 = __webpack_require__(0);
var url_1 = __webpack_require__(2);
var state_1 = __webpack_require__(9);
var checkers = [hashCheck_1.check, regCheck_1.check, msvpCheck_1.check];
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
chrome.webRequest.onBeforeRequest.addListener(checkUrl, {
    urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*']
}, ["blocking"]);
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var requestInterceptor_1 = __webpack_require__(0);
var requestInterceptor_2 = __webpack_require__(0);
// todo generate proper filter
var resourceMap = {
    "ajax.aspnetcdn.com/ajax/jQuery/jquery-1.4.1.min.js": "injectees/jquery/1.4.1/jquery.min.js"
};
var hasMappedResource = function (uri) {
    return resourceMap[uri] !== undefined;
};
exports.check = function (parsedURL, tabId) {
    if (parsedURL.isExtension)
        return;
    // url totally match the library + version + cdn address
    if (hasMappedResource(parsedURL.uri)) {
        parsedURL.boostedBy = 'hash';
        return requestInterceptor_2.redirect(resourceMap[parsedURL.uri], tabId, parsedURL);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.VERSION_TAG = /\$version\$/;
exports.NAME_TAG = /\$name\$/;
exports.URL_QUERY_TAG = /\?.+$/;


/***/ }),
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var requestInterceptor_1 = __webpack_require__(0);
// todo import real filters
var regexpMap = {
    'pattern$': 'filepath'
};
var regexps = [];
var substitutions = [];
// prebuild regexps
Object.keys(regexpMap).forEach(function (key) {
    regexps.push(new RegExp(key));
    substitutions.push(regexpMap[key]);
});
exports.check = function (parsedURL, tabId) {
    if (parsedURL.isExtension)
        return;
    var uri = parsedURL.uri;
    var substitution;
    for (var i = 0; i < regexps.length; i++) {
        if (regexps[i].test(uri)) {
            substitution = substitutions[i];
            break;
        }
    }
    if (substitution) {
        parsedURL.boostedBy = 'reg';
        requestInterceptor_1.redirect(substitution, tabId, parsedURL);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
};


/***/ }),
/* 8 */
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
/* 9 */
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