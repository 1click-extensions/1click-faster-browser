"use strict";
var hash_config_1 = require("../configs/hash-config");
var requestInterceptor_1 = require("../misc/requestInterceptor");
var configSyntax_1 = require("./configSyntax");
var comparisonHash = {};
var keys = Object.keys(hash_config_1.versions);
function check(normalizedUrl, tabId) {
    if (normalizedUrl.isExtension) {
        return;
    }
    var checkUrl = normalizedUrl.uri;
    // console.log('hash check', checkUrl)
    // url totally match the library + version + cdn address
    console.log('comparisonHash', comparisonHash);
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
