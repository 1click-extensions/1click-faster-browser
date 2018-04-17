"use strict";
var hash_check_1 = require("./checkers/hash-check");
var reg_check_1 = require("./checkers/reg-check");
var msvpCheck_1 = require("./checkers/msvpCheck");
var requestInterceptor_1 = require("./misc/requestInterceptor");
var url_1 = require("./misc/url");
var state_1 = require("./misc/state");
var checkers = [hash_check_1.check, reg_check_1.regCheck, msvpCheck_1.check];
// webpage-specific settings are stored in this object
var state = state_1.load();
// need to maintain listeners, because all already opened tabs will not be boosted otherwise...
// furthermore, all tabs with changed URLs will not be boosted...
var tabListeners = {};
// set listener for each created/reloaded tab
// this is needed because tabId and website URL will not be available otherwise inside the listener
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    // sync state on each refresh/creation to have less syncing penalty
    state = state_1.load();
    // if the page is reloaded and the URL is changed or it is a first installation of the extension...
    // tab object is IMMUTABLE, surprise surprise!
    // So, we need to add new listeners for a tab with a new URL...
    if ((change.status === 'loading') && (change.url || !tabListeners[tabId])) {
        if (tabListeners[tabId]) {
            chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
        }
        tabListeners[tabId] = checkUrl(tab);
        return chrome.webRequest.onBeforeRequest.addListener(checkUrl, {
            urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*'],
            tabId: tab.id
        }, ["blocking"]);
    }
});
// cleanup all those listeners
chrome.tabs.onRemoved.addListener(function (tabId, removeObj) {
    chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
    return tabListeners[tabId] = null;
});
// First time impression
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        return chrome.tabs.create({ url: 'https://www.facebook.com/WebBoostExtension/app/135876083099764/' });
    }
});
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
