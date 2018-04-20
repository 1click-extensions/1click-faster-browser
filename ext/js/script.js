//var domains = getDomains(),
var level;    
//console.log(domains, level, location.hostname);

fasterTool = {
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
        console.log(url);
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
        console.log('fasterTool.lozad.observe();');
        fasterTool.lozad.observe('[one-click-lazy="lozad"]');
        fasterTool.lozad.observe('.lozad');

    },
    markImgAsCanceled :function(url){
        var images = document.querySelectorAll('img[src]');
        images.forEach(function(img){
            //console.log(img,url);
            if(img.src == url){
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
        })
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
    bindClick: function(elm, type, callback){
        var div = document.createElement('div');
        div.innerHTML = '<div style="position: relative!important;height: 0!important;overflow: visible!important;z-index: 9999999999999!important;">' + 
                '<a href="#" style="position: absolute!important;z-index: 9999999999999!important;top: 0px!important;background: #fff!important;color: #000!important;text-decoration:underline!important">' + 
                'Show '+ type + '</a></div>';
        var link = div.querySelector('a');
        
        
        var clickEventCallback = function(e){
            console.log(e)
            e.preventDefault();
            callback();
            link.removeEventListener('click', clickEventCallback);
            link.remove();
            return false;
        }
        link.addEventListener('click', clickEventCallback);
        console.log(div, div.querySelector('div'))
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
console.log('getCurrnetThrottleLevel',getCurrnetThrottleLevel);
getCurrnetThrottleLevel(location.hostname, function(levelFromData){
    level = levelFromData;
    console.log(level, 'level');
    if(level){
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


