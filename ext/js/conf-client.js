function getGlobalThrottleLevel(callback){
    chrome.runtime.sendMessage({action: "getGlobalThrottleLevel"},function(globalThrottleLevel){
        console.log(globalThrottleLevel, 'globalThrottleLevel');
        callback(globalThrottleLevel ? Number( globalThrottleLevel ): 1000);
    });
//    return localStorage.globalThrottleLevel ? Number(localStorage.globalThrottleLevel) : 1000;
}
function setGlobalThrottleLevel(value){
    chrome.runtime.sendMessage({action: 'setGlobalThrottleLevel',value:value});
//    return localStorage.globalThrottleLevel = value;
}

function getDomains(callback){
    chrome.runtime.sendMessage({action: "getDomains"},function(domains){
        if(!domains){
            domains = {};
        }
        callback(domains);
    });

}
function setCurrnetThrottleLevel(domain, level){
    chrome.runtime.sendMessage({action: "domainUpdated",domain:domain, level:level});
}

function getCurrnetThrottleLevel(domain, callback){
    //console.log('callbak', callback);
    getDomains(function(domains){
        //console.log(domains, domain);
        if(domains && 'undefined' != typeof domains[domain] ){
            callback(domains[domain]);
        }
        else{
            getGlobalThrottleLevel(callback);
        }
    })
}