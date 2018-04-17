"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
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
