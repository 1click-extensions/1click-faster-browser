
import {Stats} from './misc/stats';
import {check as hashCheck} from './checkers/hash-check';
import { regCheck} from './checkers/reg-check';
import {check as msvpCheck} from './checkers/msvpCheck';
import {redirect} from './misc/requestInterceptor';
import {block} from './misc/requestInterceptor';
import {ALLOW_REQUEST_TOKEN} from './misc/requestInterceptor';


import {parseURL as parseUrl} from './misc/url';
import {load as loadState} from './misc/state';
import WebResponseHeadersDetails = chrome.webRequest.WebResponseHeadersDetails;

interface WebResponseHeadersDetailsNew extends WebResponseHeadersDetails{
	initiator:string;
}
/* 1click part -lazyload */

/*init code end*/
chrome.runtime.setUninstallURL("https://1ce.org");

if (!localStorage.created) {
  chrome.tabs.create({ url: "https://1ce.org" });
  var manifest = chrome.runtime.getManifest();
  localStorage.ver = manifest.version;
  localStorage.created = 1;
	localStorage.maxFileSizeNormal = 30 *1000;
	localStorage.maxFileSizeAdvanced = 50 *1000;
	localStorage.cacheNormal = 240 * 1000;
	localStorage.cacheAdvanced = 480 * 1000;
  (<any>window).setGlobalThrottleLevel(1000);
}
/*init code start*/


// styleSheetsAdmin  = {
//   addStylesheet: function(details){
//     styleSheetsAdmin.addInitiator(details.initiator);
//     if(!styleSheetsAdmin.data[details.initiator][details.url]){
//       styleSheetsAdmin.data[details.initiator][details.url] = {
//         time : new Date().getTime()
//       };
//     }
//   },
//   addInitiator: function(initiator){
//     if('undefined' == typeof styleSheetsAdmin.data.initiator){
//       styleSheetsAdmin.data[initiator] = {};
//     }
//   },
//   getByUrlAndInitiator: function(initiator, url, callback){
//     styleString = styleSheetsAdmin.getDeep(styleSheetsAdmin,'data.' + initiator + '.' + url +'.data');
//     if(styleString){
//       callback(string);
//     }
//     else{
//       styleSheetsAdmin.ajax(url, function(data){
//         styleSheetsAdmin.addInitiator(details.initiator);
//         styleSheetsAdmin.data[initiator][url] = {
//           time : new Date().getTime(),
//           data: data
//         }
//         callback(data);
//       });
//     }
//   },
//   getAllUrlsByInitiator: function(initiator){
//     var urls = [];
//     if(styleSheetsAdmin.data[initiator]){
//       styleSheetsAdmin.data[initiator].forEach(function(url, key) {
//         urls.push(key);
//       });
//     }
//     return urls;
//   },
//   getAllCssByInitiator: function(initiator, callback){
//     var urls = styleSheetsAdmin.getAllUrlsByInitiator(initiator),
//         urlsLength = urls.length,
//         found = 0,
//         styleStringAll = '';
//     urls.forEach(function(url) {
//       styleSheetsAdmin.getByUrlAndInitiator(initiator, url, function(data){
//         found++;
//         styleStringAll += "\n" + data;
//         if(found == styleStringAll ){
//           callback(styleStringAll);
//         }
//       });
//     });
//   },
//   createNewCssClass(){},
//   clearMoreThenHour : function(){},
//   ajax: function(url,callback){
//     var req = new XMLHttpRequest(); // read via XHR
//     req.open('GET', url);
//     req.onreadystatechange = function(e) {
//       if (req.readyState === 4 && req.status === 200) {
//         callback(data);
//       } else {
//         // error
//       }
//     }
//   },
//   data:{}
// };

/*
 chrome.webRequest.onCompleted.addListener(function(details){
    //console.log(details.type);
    if('main_frame' == details.type){
      console.log(details)
    }
  },{
    urls: ["<all_urls>"]
   },
   ["responseHeaders"]);*/

var domains:any = null,globalLevel = null;
	 
(<any>window).getDomains(function(data){
	domains = data;
	console.log(domains, 'domains');
});
(<any>window).getGlobalThrottleLevel(function(data){
	globalLevel = data;
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		if(request.action && 'domainsUpdated' == request.action){
			(<any>window).getDomains(function(data){
				domains = data;
				console.log(domains, 'domains');
			});
		}

	});

function sendAborted(details, addToEvent = null){
  //chrome.tabs.get(details.tabId, function(tab) {
    chrome.tabs.sendMessage(details.tabId, {
      action:'canceled',
      type:details.type + (addToEvent ? '-' + addToEvent : ''),
      url: details.url
    });
  //});
}
var byPassedOnce = [],
    stylesheetsPerTabId = {};
function byPassBeforeRequest(url){
  return url.indexOf('oneClickFasterIsLazy=1') > -1 || byPassonHeadersReceived(url);
}
function byPassonHeadersReceived(url){
  return url.indexOf('oneClickFasterAllowBig=1') > -1;
}

// chrome.webRequest.onBeforeRequest.addListener(
//     function(details) {
// 		var cancelRequest = false;
// 		if(!byPassBeforeRequest(details.url)){
// 			// if('stylesheet' == details.type || ('image' == details.type && 'advanced' == localStorage.speedMode)){
// 			// 	cancelRequest = true;
// 			// }
// 		}
//       if('stylesheet'==details.type){

//       }
//       if(cancelRequest){
//         sendAborted(details);
//        // byPassedOnce.push(details.url);
//       }
//       return {cancel: cancelRequest};
//     },
//     {urls: ["<all_urls>"]},
//     ["blocking"]);
// chrome.webRequest.onHeadersReceived.addListener(,{
//       urls: ["<all_urls>"]
//     },
//   ["blocking","responseHeaders"]);
function sizeCheckCallback(details:any){

	
		if('GET' != details.method || !details.initiator || ['media','image','font'].indexOf( details.type) == -1 || byPassonHeadersReceived(details.url)){
			//console.log('not get -> ' + details.method);
			return {cancel:false};
		}

			let normalizedUrl = parseUrl(details.initiator),
					fileLength = 0;
			if(domains[normalizedUrl.uri] === 0){
				return {cancel:false};
			}
			if(details.responseHeaders){
				for(var i = 0; i < details.responseHeaders.length; i++){
					var part = details.responseHeaders[i];
					if('content-length' == part.name.toLowerCase()){
						fileLength = parseInt(part.value);
					}
				}
			}
			//console.log(fileLength, 'fileLength');
			let fileMax = 0;
			if(domains[normalizedUrl.uri]){
				fileMax = domains[normalizedUrl.uri] == 2000 ?  localStorage.maxFileSizeAdvanced: localStorage.maxFileSizeNormal;
			}
			else{
				fileMax = globalLevel == 2000 ? localStorage.maxFileSizeAdvanced: localStorage.maxFileSizeNormal;
			}
			let cancelRequest = fileLength > fileMax;
			if(cancelRequest){
				//console.log(details.type, details.url, fileLength /1000);
				sendAborted(details,'big');
				
			}
			return {cancel:cancelRequest}
}

/* cache part */
chrome.webRequest.onHeadersReceived.addListener(
	function(obj) {
		let sizeCheck = sizeCheckCallback(obj);
		if(sizeCheck.cancel){
			return sizeCheck;
		}
		
		var headers = obj.responseHeaders,
		cont = false
  
	  for (var i = 0; i < headers.length && !cont; i = i + 1) {
		var flag = headers[i].name.toLowerCase()
		if (flag === 'cache-control') {
		  if (0) {
			headers.splice(i, 1)
		  } else {
			cont = true
		  }
  
		  break
		}
	  }
  
	  if (!cont) {
		headers.push({
		  name: 'cache-control',
		  value: 'private, max-age=' + localStorage.cache
		})
	  }
  
	  return {
		responseHeaders: headers
	  }
	},
	{
	  urls: ['<all_urls>']
	},
	['blocking', 'responseHeaders']
  )
/* cache part end */


/* boooost part */
let checkers = [hashCheck, regCheck, msvpCheck];

// webpage-specific settings are stored in this object
let state = loadState();

// need to maintain listeners, because all already opened tabs will not be boosted otherwise...
// furthermore, all tabs with changed URLs will not be boosted...
let tabListeners:any = {};

// set listener for each created/reloaded tab
// this is needed because tabId and website URL will not be available otherwise inside the listener
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
	// sync state on each refresh/creation to have less syncing penalty
	state = loadState();

	// if the page is reloaded and the URL is changed or it is a first installation of the extension...
	// tab object is IMMUTABLE, surprise surprise!
	// So, we need to add new listeners for a tab with a new URL...
	if (change.status === 'loading' && (change.url || !tabListeners[tabId])) {
		if (tabListeners[tabId]) {
			chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
		}

		tabListeners[tabId] = checkUrl(tab);
		console.log('tabListeners',tabListeners);
		return chrome.webRequest.onBeforeRequest.addListener(tabListeners[tabId], {
			urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*'],
			tabId: tab.id
		}, ["blocking"]);
	}
});

// cleanup all those listeners
chrome.tabs.onRemoved.addListener(function (tabId, removeObj) {
	chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
	return tabListeners[tabId] = null;
});


var checkUrl = function(tab:any){
// tab object is immutable
// So there is a guarantee that tab.url will be the same in this scope
return function (request:any) {
	if (request.method !== 'GET') {
		return ALLOW_REQUEST_TOKEN;
	}

	let normalizedUrl = parseUrl(request.url);

	// do nothing if boosting was disabled for given website
	let siteUrl = parseUrl(tab.url);
	//console.log(siteUrl,'siteUrl');
	if (__guard__(state.forHost(siteUrl.host),function( x: any){return x.disabled}) === true) {
		return ALLOW_REQUEST_TOKEN;
	}
	//console.log(checkers,'checkers');
	for (let check of checkers) {
		let result = check(normalizedUrl, request.tabId);
		//console.log(result, 'result');
		if ((result != null ? result.redirectUrl : undefined) || (result != null ? result.cancel : undefined)) {
			console.log(result, 'result');
			return result;
		}
	}
	//console.log(checkers,'checkers');
	return ALLOW_REQUEST_TOKEN;
	};
}
function __guard__(value:any, transform:any) {
	return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}
