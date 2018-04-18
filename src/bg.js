"use strict";
exports.__esModule = true;
var hash_check_1 = require("./checkers/hash-check");
var reg_check_1 = require("./checkers/reg-check");
var msvpCheck_1 = require("./checkers/msvpCheck");
var requestInterceptor_1 = require("./misc/requestInterceptor");
var url_1 = require("./misc/url");
var state_1 = require("./misc/state");
/* 1click part -lazyload */
/*init code end*/
chrome.runtime.setUninstallURL("https://1ce.org");
if (!localStorage.created) {
    chrome.tabs.create({ url: "https://1ce.org" });
    var manifest = chrome.runtime.getManifest();
    localStorage.ver = manifest.version;
    localStorage.created = 1;
    localStorage.cache = 2400000;
    localStorage.maxFileSize = 1000 * 20;
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
function sendAborted(details, addToEvent) {
    if (addToEvent === void 0) { addToEvent = null; }
    //chrome.tabs.get(details.tabId, function(tab) {
    chrome.tabs.sendMessage(details.tabId, {
        action: 'canceled',
        type: details.type + (addToEvent ? '-' + addToEvent : ''),
        url: details.url
    });
    //});
}
var byPassedOnce = [], stylesheetsPerTabId = {};
function byPassBeforeRequest(url) {
    return url.indexOf('oneClickFasterIsLazy=1') > -1 || byPassonHeadersReceived(url);
}
function byPassonHeadersReceived(url) {
    return url.indexOf('oneClickFasterAllowBig=1') > -1;
}
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    var cancelRequest = false;
    if (!byPassBeforeRequest(details.url)) {
        // if('stylesheet' == details.type || ('image' == details.type && 'advanced' == localStorage.speedMode)){
        // 	cancelRequest = true;
        // }
    }
    if ('stylesheet' == details.type) {
    }
    if (cancelRequest) {
        sendAborted(details);
        // byPassedOnce.push(details.url);
    }
    return { cancel: cancelRequest };
}, { urls: ["<all_urls>"] }, ["blocking"]);
chrome.webRequest.onHeadersReceived.addListener(function (details) {
    console.log(details.type);
    if ('GET' != details.method || ['media', 'image', 'font'].indexOf(details.type) == -1 || byPassonHeadersReceived(details.url)) {
        //console.log('not get -> ' + details.method);
        return;
    }
    var fileLength = 0;
    if (details.responseHeaders) {
        for (var i = 0; i < details.responseHeaders.length; i++) {
            var part = details.responseHeaders[i];
            if ('content-length' == part.name.toLowerCase()) {
                fileLength = parseInt(part.value);
            }
        }
    }
    //console.log(fileLength);
    var cancelRequest = fileLength > localStorage.maxFileSize;
    if (cancelRequest) {
        console.log(details.type, details.url, fileLength / 1000);
        sendAborted(details, 'big');
    }
    return { cancel: cancelRequest };
}, {
    urls: ["<all_urls>"]
}, ["blocking", "responseHeaders"]);
/* cache part */
chrome.webRequest.onHeadersReceived.addListener(function (obj) {
    var headers = obj.responseHeaders, cont = false;
    for (var i = 0; i < headers.length && !cont; i = i + 1) {
        var flag = headers[i].name.toLowerCase();
        if (flag === 'cache-control') {
            if (0) {
                headers.splice(i, 1);
            }
            else {
                cont = true;
            }
            break;
        }
    }
    if (!cont) {
        headers.push({
            name: 'cache-control',
            value: 'private, max-age=' + localStorage.cache
        });
    }
    return {
        responseHeaders: headers
    };
}, {
    urls: ['<all_urls>']
}, ['blocking', 'responseHeaders']);
/* cache part end */
/* boooost part */
var checkers = [hash_check_1.check, reg_check_1.regCheck, msvpCheck_1.check];
// webpage-specific settings are stored in this object
var state = state_1.load();
// need to maintain listeners, because all already opened tabs will not be boosted otherwise...
// furthermore, all tabs with changed URLs will not be boosted...
var tabListeners = {};
// set listener for each created/reloaded tab
// this is needed because tabId and website URL will not be available otherwise inside the listener
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    // sync state on each refresh/creation to have less syncing penalty
    state = state_1.load();
    // if the page is reloaded and the URL is changed or it is a first installation of the extension...
    // tab object is IMMUTABLE, surprise surprise!
    // So, we need to add new listeners for a tab with a new URL...
    if (change.status === 'loading' && (change.url || !tabListeners[tabId])) {
        if (tabListeners[tabId]) {
            chrome.webRequest.onBeforeRequest.removeListener(tabListeners[tabId]);
        }
        tabListeners[tabId] = checkUrl(tab);
        console.log('tabListeners', tabListeners);
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
// First time impression
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        return chrome.tabs.create({ url: 'https://www.facebook.com/WebBoostExtension/app/135876083099764/' });
    }
});
var checkUrl = function (tab) {
    // tab object is immutable
    // So there is a guarantee that tab.url will be the same in this scope
    return function (request) {
        if (request.method !== 'GET') {
            return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
        }
        var normalizedUrl = url_1.parseURL(request.url);
        // do nothing if boosting was disabled for given website
        var siteUrl = url_1.parseURL(tab.url);
        //console.log(siteUrl,'siteUrl');
        if (__guard__(state.forHost(siteUrl.host), function (x) { return x.disabled; }) === true) {
            return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
        }
        //console.log(checkers,'checkers');
        for (var _i = 0, checkers_1 = checkers; _i < checkers_1.length; _i++) {
            var check = checkers_1[_i];
            var result = check(normalizedUrl, request.tabId);
            //console.log(result, 'result');
            if ((result != null ? result.redirectUrl : undefined) || (result != null ? result.cancel : undefined)) {
                console.log(result, 'result');
                return result;
            }
        }
        //console.log(checkers,'checkers');
        return requestInterceptor_1.ALLOW_REQUEST_TOKEN;
    };
};
function __guard__(value, transform) {
    return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}
