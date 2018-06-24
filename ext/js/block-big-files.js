/* 1click part -lazyload */
/*init code end*/

function getQueryVariable(url) {
    var query = url.split('?');
    if(query.length>1){
        var vars = query[1].split('&'),
            args = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            args[pair[0]]  = decodeURIComponent(pair[1]);
            // if (decodeURIComponent(pair[0]) == variable) {
            // }
        }
        return args;
    }
    else{
        return {};
    }
    //console.log('Query variable %s not found', variable);
}
parseURL = function (url) {
    var splitted = url.split('://');
    var schema = splitted[0], path = splitted[1];
    var result = {
        schema: schema,
        uri: path.replace(/\?.+$/, ''),
        isExtension: false,
        host: '',
        queryParams : getQueryVariable(url),
        library: ''
    };
    result.isExtension = result.schema === 'chrome-extension';
    var parsedLibrary = result.uri.split('/');
    var host = parsedLibrary[0];
    result.host = host;
    result.library = parsedLibrary[parsedLibrary.length-1];
    return result;
};
if (!localStorage.getItem('globalThrottleLevel')) {

    localStorage.setItem('maxFileSizeNormal', localStorage.getItem('maxFileSizeNormal') ?localStorage.getItem('maxFileSizeNormal') : 30 * 1000);
    localStorage.setItem('maxFileSizeAdvanced', localStorage.getItem('maxFileSizeAdvanced') ?localStorage.getItem('maxFileSizeAdvanced') : 50 * 1000);
    localStorage.setItem('cacheNormal', localStorage.getItem('cacheNormal') ?localStorage.getItem('cacheNormal') : 240 * 1000);
    localStorage.setItem('cacheAdvanced', localStorage.getItem('cacheAdvanced') ?localStorage.getItem('cacheAdvanced') : 480 * 1000);
    localStorage.setItem('globalThrottleLevel',1000);
}
var neededPerm = {permissions: ["tabs","webRequest","webRequestBlocking"],origins:["<all_urls>"]};
chrome.permissions.contains(neededPerm,function(status){
        if(status){
            runAfterPermissions();
        }  
});

var domains = getDomains(), globalLevel = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action && 'permissionsSet' == request.action) {
       runAfterPermissions();
    }
    if (request.action && 'getDomains' == request.action) {
       var domains = getDomains();
       sendResponse(domains);
    }
    if (request.action && 'domainUpdated' == request.action) {
        setDomain(request.domain, request.level)
    }
    if (request.action && 'getGlobalThrottleLevel' == request.action) {
        sendResponse(getGlobalThrottleLevel());
    }
    if (request.action && 'setGlobalThrottleLevel' == request.action) {
        //console.log(request.value)
        setGlobalThrottleLevel(request.value)
    }
});
function sendAborted(details, addToEvent) {
    if (addToEvent === void 0) { addToEvent = null; }
    //chrome.tabs.get(details.tabId, function(tab) {
    chrome.tabs.sendMessage(details.tabId, {
        action: 'canceled',
        type: details.type + (addToEvent ? '-' + addToEvent : ''),
        exacType: details.exacType,
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

function sizeCheckCallback(details) {
    if ('GET' != details.method){
        return { cancel: false };

    }
    // else if(!details.initiator){
    //     console.log('not initiator', details);
    //     return { cancel: false };
    // } 
    else if(['media', 'image', 'font'].indexOf(details.type) == -1){
        //console.log('not type');
        return { cancel: false };
    }
    else if(byPassonHeadersReceived(details.url)) {
        //console.log('byPassonHeadersReceived');
        return { cancel: false };
    }
    var normalizedUrl = parseURL(details.initiator ? details.initiator : details.url), 
        fileLength = 0, 
        fileType = '',
        requestLevel = normalizedUrl && normalizedUrl.queryParams['1clickFasterLevel'] ? normalizedUrl.queryParams['1clickFasterLevel'] : 
            ( 'undefined' != typeof domains[normalizedUrl.host]  ? domains[normalizedUrl.host] : getGlobalThrottleLevel());
    requestLevel = Number(requestLevel);
    // if(normalizedUrl.queryParams && normalizedUrl.queryParams){
    //     console.log('normalizedUrl.queryParams',normalizedUrl, requestLevel);
    // }
    //console.log('details.initiator', details.initiator);
    
    if (requestLevel === 0) {
        //console.log('not normalizedUrl -> ' , normalizedUrl, details.initiator);
        return { cancel: false };
    }
    //console.log('got to here!!!!', details.responseHeaders);
    if (details.responseHeaders) {
        for (var i = 0; i < details.responseHeaders.length; i++) {
            var part = details.responseHeaders[i];
            if ('content-length' == part.name.toLowerCase()) {
                fileLength = parseInt(part.value);
            }
            else if ('content-type' == part.name.toLowerCase()) {
                fileType = part.value;
            }
        }
    }
    //console.log(fileLength, 'fileLength');
    var fileMax = 0;
    if (requestLevel) {
        fileMax = requestLevel == 2000 ? localStorage.maxFileSizeAdvanced : localStorage.maxFileSizeNormal;
    }
    else {
        fileMax = globalLevel == 2000 ? localStorage.maxFileSizeAdvanced : localStorage.maxFileSizeNormal;
    }
    var cancelRequest = fileLength > fileMax;
    //console.log(details.type, details.url, fileLength /1000, fileMax);
    if (cancelRequest) {
        details.exacType = fileType;
        //console.log(details)
        sendAborted(details, 'big');
    }
    return { cancel: cancelRequest };
}
/* cache part */
function runAfterPermissions(){

    chrome.webRequest.onHeadersReceived.addListener(function (obj) {
        //console.log(obj);
        var sizeCheck = sizeCheckCallback(obj);
        if (sizeCheck.cancel) {
            return sizeCheck;
        }

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
        if (sizeCheck.cancel) {
            return sizeCheck;
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
}

chrome.tabs.onCreated.addListener(function(tab){
    injectToTab(tab);
  });
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    injectToTab(tab);
  });


function injectToTab(tab){
    //if tab.url exits, we have permissions
    if(tab.url && /https?:\/\//.test(tab.url)){
        chrome.tabs.executeScript(tab.id, {file:"js/conf-client.js", runAt: "document_start",allFrames:true});
        var normalizedUrl = parseURL(tab.url);
        //console.log(normalizedUrl.host, domains[normalizedUrl.uri])
        if ( ('undefined' != domains[normalizedUrl.host] && domains[normalizedUrl.host] == 2000 ) || getGlobalThrottleLevel()==2000) {
            chrome.tabs.executeScript(tab.id, {file:"js/lozad.js",runAt: "document_start"});
        }
        chrome.tabs.executeScript(tab.id, {file:"js/script.js", runAt: "document_start"});
    }
}