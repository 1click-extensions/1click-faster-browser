"use strict";
var requestInterceptor_1 = require("../misc/requestInterceptor");
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
