"use strict";
exports.__esModule = true;
var reg_config_1 = require("../configs/reg-config");
var requestInterceptor_1 = require("../misc/requestInterceptor");
var configSyntax_1 = require("./configSyntax");
var helpers_1 = require("../misc/helpers");
var keys = Object.keys(reg_config_1.versions);
var regExps = {};
// prebuild regexps
keys.forEach(function (key) { return regExps[key] = new RegExp(reg_config_1.versions[key].pattern); });
console.log('regexps in regcheck ', regExps);
function regCheck(normalizedUrl, tabId) {
    if (normalizedUrl.isExtension) {
        return;
    }
    var url = normalizedUrl.uri;
    //	console.log('reg check', url)
    var matchedKeys = keys.filter(matchUrl(url));
    var versionedKeys = matchedKeys.filter(withVersions);
    var unversionedKeys = matchedKeys.filter(helpers_1.not(withVersions));
    var substitutedVersionedUrls = versionedKeys.map(extractVersion(url))
        .filter(hasExtractedVersion)
        .map(extractedVersion)
        .filter(hasDefinedSubstitution)
        .map(substitute(url));
    var substitutedUnversionedUrls = unversionedKeys.map(substituteUnversioned(url));
    var newUrls = substitutedVersionedUrls.concat(substitutedUnversionedUrls);
    if (newUrls.length > 0) {
        normalizedUrl.boostedBy = 'reg';
        return requestInterceptor_1.redirect(newUrls[0], tabId, normalizedUrl);
    }
    else {
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    }
}
exports.regCheck = regCheck;
;
var matchUrl = function (url) {
    return function (key) {
        return regExps[key].test(url);
    };
};
var withVersions = function (key) {
    return reg_config_1.versions[key].versions !== undefined;
};
var extractVersion = function (url) {
    return function (key) { return [key, regExps[key].exec(url)]; };
};
var hasExtractedVersion = function (keyVersionMatch) {
    var versionMatch = keyVersionMatch[keyVersionMatch.length - 1];
    return (versionMatch != null ? versionMatch.length : undefined) > 1;
};
var extractedVersion = function (keyVersionMatch) {
    var key = keyVersionMatch[0];
    var versionMatch = keyVersionMatch[1];
    //const [key, versionMatch] = Array.from(keyVersionMatch);
    return [key, versionMatch[1]];
};
var hasDefinedSubstitution = function (keyVersion) {
    var key = keyVersion[0];
    var version = keyVersion[1];
    return reg_config_1.versions[key].versions.indexOf(version > -1);
};
var substitute = function (url) {
    return function (keyVersion) {
        var key = keyVersion[0];
        var version = keyVersion[1];
        return reg_config_1.versions[key].file.replace(configSyntax_1.VERSION_TAG, version);
    };
};
var substituteUnversioned = function (url) {
    return function (key) { return reg_config_1.versions[key].file; };
};
