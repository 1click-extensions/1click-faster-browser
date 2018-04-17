"use strict";
exports.__esModule = true;
var requestInterceptor_1 = require("../misc/requestInterceptor");
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
