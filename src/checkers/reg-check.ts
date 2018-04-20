

import {versions as config} from '../configs/reg-config';  
import {redirect, ALLOW_REQUEST_TOKEN, block} from '../misc/requestInterceptor';  
import {URL_QUERY_TAG, NAME_TAG, VERSION_TAG} from './configSyntax';  
import {not as fNot} from '../misc/helpers';  

interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
    from<T>(arrayLike: ArrayLike<T>): Array<T>;
}

const keys = Object.keys(config);
const regExps:any = {};

// prebuild regexps
keys.forEach(key=> regExps[key] = new RegExp(config[key].pattern));

//console.log('regexps in regcheck ', regExps);

export function regCheck(normalizedUrl:any, tabId:number){
	if (normalizedUrl.isExtension) { return; }
	const url = normalizedUrl.uri;

//	console.log('reg check', url)

	const matchedKeys = keys.filter(matchUrl(url));
	const versionedKeys = matchedKeys.filter(withVersions);
	const unversionedKeys = matchedKeys.filter(fNot(withVersions));

	const substitutedVersionedUrls = versionedKeys.map(extractVersion(url))
	.filter(hasExtractedVersion)
	.map(extractedVersion)
	.filter(hasDefinedSubstitution)
	.map(substitute(url));

	const substitutedUnversionedUrls = unversionedKeys.map(substituteUnversioned(url));

	const newUrls = substitutedVersionedUrls.concat(substitutedUnversionedUrls);

	if (newUrls.length > 0) {
		normalizedUrl.boostedBy = 'reg';
		return redirect(newUrls[0], tabId, normalizedUrl);
	} else {
		return ALLOW_REQUEST_TOKEN;
	}
};

var matchUrl = function(url:any){
	return function(key:string){
		return regExps[key].test(url)
	};
}

var withVersions = function(key:string){
	return  config[key].versions !== undefined;
}

var extractVersion =function( url:string){
	return function(key:string){return [key, regExps[key].exec(url)];}
}

var hasExtractedVersion = function(keyVersionMatch:any){
	const versionMatch = keyVersionMatch[keyVersionMatch.length - 1];
	return (versionMatch != null ? versionMatch.length : undefined) > 1;
};

var extractedVersion = function(keyVersionMatch:any) {
	const key = keyVersionMatch[0];
	const versionMatch = keyVersionMatch[1];
	//const [key, versionMatch] = Array.from(keyVersionMatch);
	return [key, versionMatch[1]];
};

var hasDefinedSubstitution = function(keyVersion:any){
	const key = keyVersion[0];
	const version = keyVersion[1];
	return config[key].versions.indexOf(version > -1);
};

var substitute = function(url:any){
	return function(keyVersion:any) {
		const key = keyVersion[0];
		const version = keyVersion[1];
		return config[key].file.replace(VERSION_TAG, version);
	}
};

var substituteUnversioned = function(url:any){
	return function(key:any){return config[key].file}
}
