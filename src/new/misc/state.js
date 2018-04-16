/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
"use strict";
var helpers_1 = require("./helpers");
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
