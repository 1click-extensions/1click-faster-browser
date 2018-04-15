/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const h = require('../configs/hash-config');
const interceptor = require('../request-interceptor');
const sx = require('./config-syntax');

module.exports = function(normalizedUrl, tabId){
	if (normalizedUrl.isExtension) { return; }

	const checkUrl = normalizedUrl.uri;
	// console.log('hash check', checkUrl)

	// url totally match the library + version + cdn address
	if (comparisonHash[checkUrl]) {
		normalizedUrl.boostedBy = 'hash';
		return interceptor.redirect(comparisonHash[checkUrl], tabId, normalizedUrl);
	} else {
		return interceptor.ALLOW_REQUEST_TOKEN;
	}
};


var comparisonHash = {};
const keys = Object.keys(h);

// fill in comparison map
keys.forEach(function(key){
	const entry = h[key];

	if (entry.versions) {
		return entry.versions.forEach(version=>
			entry.urls.forEach(function(url){
				const hashUrl = url.replace(sx.VERSION_TAG, version);
				return comparisonHash[hashUrl] =
						entry.file.replace(sx.NAME_TAG, key).replace(sx.VERSION_TAG, version);
			})
		);

	} else {
		return entry.urls.forEach(url=>
			comparisonHash[url] =
					entry.file.replace(sx.NAME_TAG, key)
		);
	}
});

console.log('comparison hash in hash-check', comparisonHash);
