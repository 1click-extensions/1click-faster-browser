/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Stats} from './misc/stats';
import {check as hashCheck} from './checkers/hash-check';
import { regCheck} from './checkers/reg-check';
import {check as msvpCheck} from './checkers/msvpCheck';
import {redirect} from './misc/requestInterceptor';
import {block} from './misc/requestInterceptor';
import {ALLOW_REQUEST_TOKEN} from './misc/requestInterceptor';


import {parseURL as parseUrl} from './misc/url';
import {load as loadState} from './misc/state';


const checkers = [hashCheck, regCheck, msvpCheck];

// webpage-specific settings are stored in this object
let state = loadState();

// need to maintain listeners, because all already opened tabs will not be boosted otherwise...
// furthermore, all tabs with changed URLs will not be boosted...
 const tabListeners = {};

// set listener for each created/reloaded tab
// this is needed because tabId and website URL will not be available otherwise inside the listener
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	// sync state on each refresh/creation to have less syncing penalty
	state = loadState();

	// if the page is reloaded and the URL is changed or it is a first installation of the extension...
	// tab object is IMMUTABLE, surprise surprise!
	// So, we need to add new listeners for a tab with a new URL...
	if ((change.status === 'loading') && (change.url || !tabListeners[tabId])) {
		if (tabListeners[tabId]) {
			chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
		}

		tabListeners[tabId] = checkUrl(tab);
		return chrome.webRequest.onBeforeRequest.addListener(
			checkUrl, {
			urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*'],
			tabId: tab.id
		},
			["blocking"]
		);
	}
});

// cleanup all those listeners
chrome.tabs.onRemoved.addListener(function(tabId, removeObj) {
	chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
	return tabListeners[tabId] = null;
});


// First time impression
chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		return chrome.tabs.create({url: 'https://www.facebook.com/WebBoostExtension/app/135876083099764/'});
	}});

const checkUrl = function(request :any){
	if (request.method !== 'GET') { return ALLOW_REQUEST_TOKEN; }

	const normalizedUrl = parseUrl(request.url);

	// do nothing if boosting was disabled for given website
	const siteUrl = parseUrl(request.initiator);
	if (__guard__(state.forHost(siteUrl.host), function(x:any){return  x.disabled}) === true) { return ALLOW_REQUEST_TOKEN; }

	for (let check of checkers) {
		const result = check(normalizedUrl, request.tabId);
		if ((result != null ? result.redirectUrl : undefined) || (result != null ? result.cancel : undefined)) { return result; }
	}

	return ALLOW_REQUEST_TOKEN;
}

function __guard__(value:any, transform:Function) {
return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}


// chrome.webRequest.onBeforeRequest.addListener(
// 	checkUrl, {
// 	urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*']
// },
// 	["blocking"]
// );
