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

/*function sliderToFunction(value){
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
}*/



var query = { active: true, currentWindow: true },
    callbackSearch = function(tabs) {
        var currentTab = tabs[0],
            domain = extractHostname(currentTab.url),
            currentSliderDiv = document.getElementById('current'),
            globalSliderDiv = document.getElementById('global');
       
        getCurrnetThrottleLevel(domain, function(currentThrottleLevel){
            currentSlider =  noUiSlider.create(currentSliderDiv, {
                start: [ currentThrottleLevel ],
                step: 1000,
                range: {
                    'min': [ 0 ],
                    'max': [ 2000 ]
                }
            });
            currentSlider.on('change', function(){
                setCurrnetThrottleLevel(domain,Number(currentSlider.get()));
                
            });
            //console.log(currentSlider)
        });

        getGlobalThrottleLevel(function(globalThrottleLevel){
            globalSlider = noUiSlider.create( globalSliderDiv, {
                start: [ globalThrottleLevel ],
                step: 1000,
                range: {
                    'min': [  1000 ],
                    'max': [ 2000 ]
                }
            });
            globalSlider.on('change', function(){
                setGlobalThrottleLevel(Number(globalSlider.get()));
            });
            //console.log(globalSlider, globalThrottleLevel);
        });


        
        //console.log({currentThrottleLevel:currentThrottleLevel, globalThrottleLevel:globalThrottleLevel})
        document.getElementById('site-domain').innerText = domain;
        
       
    }

document.getElementById('current-disable').innerText = chrome.i18n.getMessage('disable_in_this_site');
document.getElementById('current-normal').innerText = chrome.i18n.getMessage('normal_features');
document.getElementById('current-advanced').innerText = chrome.i18n.getMessage('advanced_features');
document.getElementById('global-normal').innerText = chrome.i18n.getMessage('normal_features');
document.getElementById('global-advanced').innerText = chrome.i18n.getMessage('advanced_features');
document.getElementById('global-title').innerText = chrome.i18n.getMessage('global_title');
document.getElementById('current-title').innerText = chrome.i18n.getMessage('current_title');
var neededPerm = {permissions: ["tabs","webRequest","storage","webRequestBlocking"],origins:["<all_urls>"]};
chrome.permissions.contains(neededPerm,function(status){
        if(status){
            afterPermissions();
        }  
        else{
            var explain = document.createElement('div'),
                butt = document.createElement('button');
            explain.innerText = chrome.i18n.getMessage('permission_explain');
            butt.innerText = chrome.i18n.getMessage('permission_button');
            explain.classList.add('show-always');
            butt.classList.add('show-always');
            butt.classList.add('as-link');
            butt.type = 'button';
            butt.onclick = function(){
                chrome.permissions.request(neededPerm, function (granted) {
                    if(granted){
                        document.body.classList.remove('hide-all');
                        document.removeChild(explain);
                        document.removeChild(butt);
                    }
                    else{
                        explain.innerText = chrome.i18n.getMessage('permission_without');
                    }
                });
            }
            document.body.classList.add('hide-all');
            document.body.appendChild(explain);
            document.body.appendChild(butt);
        }
})

function afterPermissions(){
    chrome.tabs.query(query, callbackSearch);
}


