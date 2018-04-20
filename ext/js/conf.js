function getGlobalThrottleLevel(callback){
    chrome.storage.local.get('globalThrottleLevel', function(data) {
        //console.log(data);
        callback(data.globalThrottleLevel ? Number( data.globalThrottleLevel ): 1000);
    });
//    return localStorage.globalThrottleLevel ? Number(localStorage.globalThrottleLevel) : 1000;
}
function setGlobalThrottleLevel(value){
    chrome.storage.local.set({'globalThrottleLevel': value});
//    return localStorage.globalThrottleLevel = value;
}

function getDomains(callback){
    chrome.storage.local.get('domains', function(data) {
        //console.log(data,data.domains);
        if(!data.domains){
            data.domains = {};
        }
        callback(data.domains);
      })

}
function setCurrnetThrottleLevel(domain, level){
    getDomains(function(domains){

        domains[domain] = level;
        chrome.storage.local.set({'domains': domains});
        chrome.runtime.sendMessage({action: "domainsUpdated"});
    })
}

function getCurrnetThrottleLevel(domain, callback){
    //console.log('callbak', callback);
    getDomains(function(domains){
        if(domains && domains[domain]){
            callback(domains[domain]);
        }
        else{
            getGlobalThrottleLevel(callback);
        }
    })
}