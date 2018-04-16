/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const config = require('../configs/reg-config');
const sx = require('./config-syntax');
const interceptor = require('../request-interceptor');
const { fn } = require('../helpers');

const keys = Object.keys(config);
const regExps = {};

// prebuild regexps
keys.forEach(key=> regExps[key] = new RegExp(config[key].pattern));

console.log('regexps in regcheck ', regExps);

module.exports = function(normalizedUrl, tabId){
	if (normalizedUrl.isExtension) { return; }
	const url = normalizedUrl.uri;

//	console.log('reg check', url)

	const matchedKeys = keys.filter(matchUrl(url));
	const versionedKeys = matchedKeys.filter(withVersions);
	const unversionedKeys = matchedKeys.filter(fn.not(withVersions));

	const substitutedVersionedUrls = versionedKeys.map(extractVersion(url))
	.filter(hasExtractedVersion)
	.map(extractedVersion)
	.filter(hasDefinedSubstitution)
	.map(substitute(url));

	const substitutedUnversionedUrls = unversionedKeys.map(substituteUnversioned(url));

	const newUrls = substitutedVersionedUrls.concat(substitutedUnversionedUrls);

	if (newUrls.length > 0) {
		normalizedUrl.boostedBy = 'reg';
		return interceptor.redirect(newUrls[0], tabId, normalizedUrl);
	} else {
		return interceptor.ALLOW_REQUEST_TOKEN;
	}
};

var matchUrl = url=>
	key=> regExps[key].test(url)
;

var withVersions = key => config[key].versions !== undefined;

var extractVersion = url=>
	key=> [key, regExps[key].exec(url)]
;

var hasExtractedVersion = function(keyVersionMatch){
	const versionMatch = keyVersionMatch[keyVersionMatch.length - 1];
	return (versionMatch != null ? versionMatch.length : undefined) > 1;
};

var extractedVersion = function(keyVersionMatch) {
	const [key, versionMatch] = Array.from(keyVersionMatch);
	return [key, versionMatch[1]];
};

var hasDefinedSubstitution = function(keyVersion){
	const [key, version] = Array.from(keyVersion);
	return config[key].versions.indexOf(version > -1);
};

var substitute = url =>
	function(keyVersion) {
		const [key, version] = Array.from(keyVersion);
		return config[key].file.replace(sx.VERSION_TAG, version);
	}
;

var substituteUnversioned = url=>
	key => config[key].file
;
