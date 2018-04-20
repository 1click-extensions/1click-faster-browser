function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function sliderToFunction(value){
    var title = '';
    switch(value){
        case 0:
            title = "Disable fast mode";
            break;
        case 1000:
            title = "Normal mode";
            break;
        case 2000:
            title = "Advanced mode (things could break)";
            break;
    }
    return title;
}
function sliderFromFunction(title){
    var value = 0;
    switch(value){
        case "Disable fast mode":
            value = 0;
            break;
        case "Normal mode" :
        value = 1000;
            break;
        case "Advanced mode (things could break)":
            value = 2000;
            break;
    }
    return title;
}

function getGlobalThrottleLevel(){
    return localStorage.globalThrottleLevel ? Number(localStorage.globalThrottleLevel) : 1000;
}
function setGlobalThrottleLevel(value){
    return localStorage.globalThrottleLevel = value;
}

function getDomains(domain, level){
    var domains = localStorage.domains;
    if(!domains){
        domains = {};
    }
    else{
        domains = JSON.parse(domains);
    }
    return domains;
}
function setCurrnetThrottleLevel(domain, level){
    var domains = getDomains();
    domains[domain] = level;
    localStorage.domains = JSON.stringify(domains);
}

function getCurrnetThrottleLevel(domain){
    var domains = getDomains();
    if(domains && domains[domain]){
        return domains[domain];
    }
    else{
        return getGlobalThrottleLevel();
    }
}

var query = { active: true, currentWindow: true },
    callbackSearch = function(tabs) {
        var currentTab = tabs[0],
            domain = extractHostname(currentTab.url),
            currentThrottleLevel = getCurrnetThrottleLevel(domain),
            globalThrottleLevel = getGlobalThrottleLevel(),
            currentSliderDiv = document.getElementById('current'),
            globalSliderDiv = document.getElementById('global'),
       
        currentSlider =  noUiSlider.create(currentSliderDiv, {
            start: [ currentThrottleLevel ],
            step: 1000,
            range: {
                'min': [  0 ],
                'max': [ 2000 ]
            }
        }),
        
        globalSlider = noUiSlider.create( globalSliderDiv, {
            start: [ globalThrottleLevel ],
            step: 1000,
            range: {
                'min': [  1000 ],
                'max': [ 2000 ]
            }
        });
        console.log({currentThrottleLevel:currentThrottleLevel, globalThrottleLevel:globalThrottleLevel})
        currentSlider.on('change', function(){
            setCurrnetThrottleLevel(domain,currentSlider.get());
        });
        globalSlider.on('change', function(){
            setGlobalThrottleLevel(globalSlider.get());
        });
    }


chrome.tabs.query(query, callbackSearch);


