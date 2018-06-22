//var domains = getDomains(),
var level;    
//console.log(domains, level, location.hostname);

fasterTool = {
    couldHaveBg : ["body","div","a","section","header","span","img","h1","h2","h3","h4","h5","h6","form","input","p","ul","li","nav","article","video","figure","footer","button"],
    observe: {
        start : function(){
            var targetNode = document,
                config = { childList: true,  subtree: true }
             // Create an observer instance linked to the callback function
            fasterTool.observe.observer = new MutationObserver(fasterTool.observe.callback);
    
            // Start observing the target node for configured mutations
            fasterTool.observe.observer.observe(targetNode, config);
    
            // Later, you can stop observing
            //observer.disconnect();
        },
        callback : function(mutationsList) {
            for(var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    mutation.addedNodes.forEach(function(childElment){
                        if('IMG' == childElment.nodeName && 2000 == level){
                            if(childElment.src && !/data:/.test(src)){
                                var src = childElment.src;
                                childElment.setAttribute('data-src', fasterTool.fixUrlLazy(src));
                                childElment.setAttribute('one-click-lazy', 'lozad');
                                childElment.removeAttribute('src');
                                childElment.src = fasterTool.imgPlaceHolderImg;
                                //console.log(childElment,childElment.getAttribute('one-click-lazy'));
                                fasterTool.startTimeout();
                                childElment.classList.add('lozad');
                                childElment.addEventListener('click', function(){
                                    fasterTool.lozad.triggerLoad(childElment);
                                });
                            }
                        }
                        else if('STYLE' == childElment.nodeName || ("LINK"  == childElment.nodeName && 'stylesheet' == childElment.getAttribute('rel'))){
                            var urlAttr = 'STYLE' == childElment.nodeName ? 'src' : 'href';
                            if(childElment[urlAttr]){
                                if(!childElment.getAttribute('media')){
                                    //console.log(childElment,'childElment');
                                    childElment.setAttribute('media','none');
                                    childElment.addEventListener('load', function(){
                                        //console.log(this);
                                        this.setAttribute('media','all');
                                    });
                                }
                                // style[urlAttr] = fasterTool.fixUrlLazy(style[urlAttr]);
                                // found = true;
                            }
                        }
                    });
                }
            }
        }
    },
    
    addLazyAttr: function(url){
        
        var styles = document.querySelectorAll('style,link[rel=stylesheet]'),
            found = false;
        //console.log(url);
        styles.forEach(function(style){
            //console.log(style,url);
            var urlAttr = 'STYLE' == style.nodeName ? 'src' : 'href';
            if(style[urlAttr] == url){
                style.setAttribute('lazyload',1);
                style[urlAttr] = fasterTool.fixUrlLazy(style[urlAttr]);
                found = true;
            }
        });
        if(!found){
            setTimeout(function(){
                fasterTool.addLazyAttr(url);  
            },30);
        }
    },
    markImgAsLazyLoad :function(url){
        fasterTool.lazyLoadUrls.push(url);
        fasterTool.startTimeout();

    },
    startTimeout(){
        clearTimeout(fasterTool.lazyImagesTimeout);
        fasterTool.lazyImagesTimeout = setTimeout(fasterTool.lazyTimeoutCallback, 500);
    },
    lazyTimeoutCallback: function(){
        // var images = document.querySelectorAll('img[src]');
        // images.forEach(function(img){
        //     //console.log(fasterTool.lazyLoadUrls)
        //     if(fasterTool.lazyLoadUrls.indexOf(img.src) > -1){
        //         fasterTool.lazyLoadUrls = fasterTool.lazyLoadUrls.splice(fasterTool.lazyLoadUrls.indexOf(img.src),1);
        //         img.setAttribute('data-src', fasterTool.fixUrlLazy(img.src));
        //         //img.src = fasterTool.imgPlaceHolderImg;
        //         img.classList.add('lozad');
        //     }
        // });
        // //console.log('not found!!',fasterTool.lazyLoadUrls )
        // fasterTool.lazyLoadUrls = [];
        //console.log('fasterTool.lozad.observe();');
        fasterTool.lozad.observe('[one-click-lazy="lozad"]');
        fasterTool.lozad.observe('.lozad');

    },
    markImgAsCanceled :function(url){
        var images = document.querySelectorAll('img[src]');
        var found = false;
        images.forEach(function(img){
            //console.log(img,url);
            if(img.src == url){
                found = true;
                //console.log('found!!!!', img);
                fasterTool.switchSrcs(img,url, function(){
                    img.src = fasterTool.imgPlaceHolderImg;
                });
                var linkWrp = fasterTool.bindClick(img, 'image', function(){
                    var fixedSrc =  img.getAttribute('one-click-src');
                    if(fixedSrc){
                        img.src = fixedSrc;
                    }
                    img.removeAttribute('one-click-src');
                });
                //console.log(linkWrp,'linkWrp');
                img.parentElement.insertBefore(linkWrp, img);
            }
        });
        if(!found){
            //console.log('not found!!!!', url);
            allDoms = document.querySelectorAll('*');
            for(let xDom of allDoms){
                var type = xDom.nodeName.toLowerCase();
                if(fasterTool.couldHaveBg.indexOf(type) > -1){
                    var sty = getComputedStyle(xDom);
                    if(sty['background-image'] && 'none' != sty['background-image']){
                        //console.log(xDom, sty['background-image'],url,  sty['background-image'].indexOf(url));
                    }
                    if(sty['background-image'] && sty['background-image'].indexOf(url) > -1){
                        //console.log('in!!!!!!!!!!!!!!!!' ,xDom,sty['background-image'],url,  sty['background-image'].indexOf(url));
                        if(['button','a', 'input'].indexOf(type) > -1){
                            xDom.style['background-image'] = "url('" + url + "?oneClickFasterAllowBig=1')";
                        }
                        else{
                            xDom.style['background-image'] = fasterTool.imgPlaceHolderImg;
                            var link = fasterTool.getLinkElm('image');
                            xDom.insertBefore(link,  xDom.firstChild);
                            if(sty.position == 'static'){
                                xDom.style.position = "relative";
                            }
                            link.addEventListener('click', function(e){
                                //console.log(e)
                                e.preventDefault();
                                xDom.style['background-image'] = "url('" + url + "?oneClickFasterAllowBig=1')";
                                //link.removeEventListener('click', clickEventCallback);
                                xDom.removeChild(link);
                                return false;
                            });
                        }
                    }
                }
                
                
            }
        }
    },
    markVideoAsCanceled :function(url){
        var videoSources = document.querySelectorAll('video source');
        videoSources.forEach(function(videoSource){
            //console.log(img,url);
            if(videoSource.src == url){
                fasterTool.switchSrcs(videoSource,url, function(){
                    videoSource.parentElement.style['background'] = 'url("' + fasterTool.videoPlaceHolderImg + '") center no-repeat';
                });
                var linkWrp = fasterTool.bindClick(videoSource, 'video', function(){
                    var fixedSrc =  videoSource.getAttribute('one-click-src');
                    if(fixedSrc){
                        videoSource.src = fixedSrc;
                        videoSource.parentElement.load();
                        videoSource.parentElement.style['background'] = '';
                    }
                    videoSource.removeAttribute('one-click-src');
                });
                videoSource.parentElement.parentElement.insertBefore(linkWrp, videoSource.parentElement);
            }
        });
    },
    switchSrcs: function (img,url, after){
        var fixedSrc = fasterTool.fixUrlBig(img.src);
       
        img.setAttribute('one-click-src', fixedSrc );
        after();

    },
    getLinkHtml: function(type){
        return '<a href="#" style="position: absolute!important;z-index: 9999999999999!important;top: 0px!important;background: #fff!important;color: #000!important;text-decoration:underline!important">' + 
        'Show ' + type + '</a>';
    },
    getLinkElm: function(type){
        var div = document.createElement('div');
        div.innerHTML = '<a href="#" style="position: absolute!important;z-index: 9999999999999!important;top: 0px!important;background: #fff!important;color: #000!important;text-decoration:underline!important">' + 
        'Show '+ type + '</a>';
        return div.querySelector('a');
    },
    bindClick: function(elm, type, callback){
        var div = document.createElement('div');
        div.innerHTML = '<div style="position: relative!important;height: 0!important;overflow: visible!important;z-index: 9999999999999!important;">'
        + fasterTool.getLinkHtml(type) + '</div>';
        //console.log(div, div.querySelector('a'));
        var link = div.querySelector('a');
        
        
        var clickEventCallback = function(e){
            //console.log(e)
            e.preventDefault();
            callback();
            link.removeEventListener('click', clickEventCallback);
            link.remove();
            return false;
        }
        link.addEventListener('click', clickEventCallback);
        //console.log(div, div.querySelector('div'))
        return div.querySelector('div');
    },
    fixUrlLazy : function(url){
        return fasterTool.fixUrl(url, 'oneClickFasterIsLazy');
    },
    fixUrlBig : function(url){
        return fasterTool.fixUrl(url, 'oneClickFasterAllowBig');
    },
    fixUrl : function(url, add){
        var hasQuestionMark = url.indexOf('?') > -1;
        return url + (!hasQuestionMark ? '?' : '&') + add + '=1'
    },
    lazyLoadUrls:[],
    lozad: lozad(),
    imgPlaceHolderImg: chrome.runtime.getURL('images/image-placeholder.png') ,
    videoPlaceHolderImg: chrome.runtime.getURL('images/video-placeholder.png') 
}
//console.log('getCurrnetThrottleLevel',getCurrnetThrottleLevel);
getCurrnetThrottleLevel(location.hostname, function(levelFromData){
    level = levelFromData;
    if(level){
        //console.log(level, 'level');
        fasterTool.observe.start();
    }
});



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      switch(request.action){
          case 'canceled':
          //console.log(request.type);
          switch(request.type){
            case 'image':
                //fasterTool.markImgAsLazyLoad(request.url);
                break;
            case 'image-big':
              fasterTool.markImgAsCanceled(request.url);
              break;
            case 'media-big':
                fasterTool.markVideoAsCanceled(request.url);
                break;
            case 'stylesheet':
                fasterTool.addLazyAttr(request.url);
                break;
            }
            break;
      }
    });


