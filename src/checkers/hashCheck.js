"use strict";
var requestInterceptor_1 = require("../misc/requestInterceptor");
var requestInterceptor_2 = require("../misc/requestInterceptor");
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
