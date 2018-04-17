"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var stats_1 = require("./stats");
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
exports.ALLOW_REQUEST_TOKEN = { cancel: false };
