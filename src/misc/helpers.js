"use strict";
exports.__esModule = true;
var url_1 = require("./url");
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
