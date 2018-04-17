
import {versions as h} from '../configs/hash-config';  
import {redirect, ALLOW_REQUEST_TOKEN} from '../misc/requestInterceptor';  
import {URL_QUERY_TAG, NAME_TAG, VERSION_TAG} from './configSyntax';  




var comparisonHash:any = {};
const keys = Object.keys(h);

export function check(normalizedUrl:any, tabId:number){
	if (normalizedUrl.isExtension) { return; }

	const checkUrl = normalizedUrl.uri;
	// console.log('hash check', checkUrl)

	// url totally match the library + version + cdn address
	//console.log('comparisonHash',comparisonHash);
	if (comparisonHash[checkUrl]) {
		normalizedUrl.boostedBy = 'hash';
		return redirect(comparisonHash[checkUrl], tabId, normalizedUrl);
	} else {
		return ALLOW_REQUEST_TOKEN;
	}
};

// fill in comparison map
keys.forEach(function(key){
	const entry = h[key];

	if (entry.versions) {
		return entry.versions.forEach(function(version:any){
			entry.urls.forEach(function(url:any){
				const hashUrl = url.replace(VERSION_TAG, version);
				return comparisonHash[hashUrl] =
						entry.file.replace(NAME_TAG, key).replace(VERSION_TAG, version);
			})
		});

	} else {
		return entry.urls.forEach(function(url:any){
			comparisonHash[url] =
					entry.file.replace(NAME_TAG, key)
		});
	}
});

console.log('comparison hash in hash-check', comparisonHash);
