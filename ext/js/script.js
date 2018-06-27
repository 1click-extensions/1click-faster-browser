//var domains = getDomains(),
var level,fasterTool;    
if('undefined' == typeof fasterTool){
    console.log(location.hostname);

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
            watchImgs : function(childElement, print){
                childElement.setAttribute('chookoo', new Date().getTime());
                childElement.chookoo = new Date().getTime();
                if(print){
                    console.log(childElement)
                }
                if( (childElement.src && !/data:/.test(src)) || childElement.srcset){
                    childElement.src = fasterTool.fixUrl(childElement.src, '1clickFasterLevel', level);
                    childElement.srcset = fasterTool.fixSrcset(childElement.src, '1clickFasterLevel', level);
                    //console.log(childElement.src, childElement, 'childElement.src, childElement');
                    if( 2000 == level){
                        var src = childElement.src,
                            srcset = childElement.srcset;
                        //console.log('srcset srcset ', srcset, fasterTool.fixUrlLazy(srcset));
                        if(!childElement.getAttribute('data-src')){
                            childElement.setAttribute('data-src', fasterTool.fixUrlLazy(src));
                            //childElement.setAttribute('data-srcset', fasterTool.fixSrcsetLazy(src));
                        }
                        childElement.setAttribute('one-click-lazy', 'lozad');
                        childElement.removeAttribute('src');
                        childElement.removeAttribute('srcset');
                        childElement.src = fasterTool.imgPlaceHolderImg;
                        //childElement.srcset = fasterTool.imgPlaceHolderImg;
                        //console.log(childElement,childElement.getAttribute('one-click-lazy'));
                        fasterTool.startTimeout();
                        childElement.classList.add('lozad');
                        childElement.addEventListener('click', function(){
                            fasterTool.lozad.triggerLoad(childElement);
                        });
                    }
                }
            },
            callback : function(mutationsList) {
                for(var mutation of mutationsList) {
                    if (mutation.type == 'childList') {
                        mutation.addedNodes.forEach(function(childElement){
                            if('IMG' == childElement.nodeName ){
                                fasterTool.observe.watchImgs(childElement);
                            }
                            else if('STYLE' == childElement.nodeName || ("LINK"  == childElement.nodeName && 'stylesheet' == childElement.getAttribute('rel'))){
                                var urlAttr = 'STYLE' == childElement.nodeName ? 'src' : 'href';
                                if(childElement[urlAttr]){
                                    if(!childElement.getAttribute('media')){
                                        //console.log(childElement,'childElement');
                                        childElement.setAttribute('media','none');
                                        childElement.addEventListener('load', function(){
                                            //console.log(this);
                                            this.setAttribute('media','all');
                                        });
                                    }
                                    // style[urlAttr] = fasterTool.fixUrlLazy(style[urlAttr]);
                                    // found = true;
                                }
                            }
                            else{
                                //console.log(childElement, childElement.getElementsByTagName);
                                if(childElement.getElementsByTagName){

                                    var imgs = childElement.getElementsByTagName('img');
                                    //console.log(imgs.length,'imgs.length');
                                    for(let img of imgs){
                                        fasterTool.observe.watchImgs(img);
                                    }
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
        startTimeout : function(){
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
        // addUrlToAllowed : function(url, callback){
        //     chrome.runtime.sendMessage({action: "addUrlToAllowed", url:url}, callback);
        // },
        markImgAsCanceled :function(url){
            var images = document.querySelectorAll('img[src]');
            var found = false;
            images.forEach(function(img){
                //console.log(img,url);
                if(img.src == url || (img.srcset && img.srcset.indexOf(url) > -1)){
                    found = true;
                    //console.log('found!!!!', img);
                    
                    fasterTool.switchSrcs(img,url, function(){
                        if(level ===0){
                            img.src = img.getAttribute('one-click-src');
                            img.srcset = img.getAttribute('one-click-srcset');
                        }
                        else{   
                            img.src = fasterTool.imgPlaceHolderImg;
                            if(img.srcset){
                                img.srcset = fasterTool.imgPlaceHolderImg;
                            }
                        }

                    });
                    if(level){
                        var linkWrp = fasterTool.bindClick(img, 'image', function(){
                            var fixedSrc =  img.getAttribute('one-click-src'),
                                fixedSrcset = img.getAttribute('one-click-srcset');
                            if(fixedSrc){
                                img.src = fixedSrc;
                                img.removeAttribute('one-click-src');
                            }
                            if(fixedSrcset){
                                img.srcset = fixedSrcset;
                                img.removeAttribute('one-click-srcset');
                            }
                        });
                        //console.log(linkWrp,'linkWrp');
                        img.parentElement.insertBefore(linkWrp, img);
                    }
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
                            if(['button','a', 'input'].indexOf(type) > -1 || 0 === level){
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
                                    //console.log(this.parentElement, this)
                                    this.parentElement.style['background-image'] = "url('" + url + "?oneClickFasterAllowBig=1')";
                                    //link.removeEventListener('click', clickEventCallback);
                                    this.parentElement.removeChild(this);
                                    return false;
                                });
                            }
                        }
                    }
                    
                    
                }
            }
        },
        markMediaAsCanceled :function(type, url){
            var mediaSources = document.querySelectorAll(type + ', source');
            //console.log(mediaSources);
            mediaSources.forEach(function(mediaSource){
                //console.log(mediaSource.src);
                if(mediaSource.src == url){
                    var wrpElm = mediaSource.nodeName == 'source' ?  mediaSource.parentElement :  mediaSource;
                    fasterTool.switchSrcs(mediaSource,url, function(){
                        wrpElm.style['background'] = 'url("' + fasterTool.videoPlaceHolderImg + '") center no-repeat';
                    });
                    var linkWrp = fasterTool.bindClick(mediaSource, type, function(){
                        var fixedSrc =  mediaSource.getAttribute('one-click-src');
                        if(fixedSrc){
                            mediaSource.src = fixedSrc;
                            wrpElm.load();
                            wrpElm.style['background'] = '';
                        }
                        mediaSource.removeAttribute('one-click-src');
                    });
                    wrpElm.parentElement.insertBefore(linkWrp, wrpElm);
                }
            });
        },
        switchSrcs: function (img,url, after){
            var fixedSrc = fasterTool.fixUrlBig(img.src);
            if(img.srcset){
                var fixedSrcset = fasterTool.fixSrcsetBig(img.srcset);
                img.setAttribute('one-click-srcset', fixedSrcset );
            }
           
            img.setAttribute('one-click-src', fixedSrc );
            after();

        },
        getLinkHtml: function(type){
            return '<a href="#" style="position: absolute!important;z-index: 9999999999999!important;top: 0px!important;background: #fff!important;color: #000!important;text-decoration:underline!important">' + 
            'Load ' + type + '</a>';
        },
        getLinkElm: function(type){
            var div = document.createElement('div');
            div.innerHTML = '<a href="#" style="position: absolute!important;z-index: 9999999999999!important;top: 0px!important;background: #fff!important;color: #000!important;text-decoration:underline!important">' + 
            'Load '+ type + '</a>';
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
        fixSrcsetBig : function(url){
            return fasterTool.fixSrcset(url, 'oneClickFasterAllowBig');
        },
        fixSrcsetLazy : function(url){
            return fasterTool.fixSrcset(url, 'oneClickFasterIsLazy');
        },
        fixSrcset : function(url, fixType, value){
            value = 'undefined' != typeof value ? value : '1';
            urlSplitted = url.split(',');
            var newUrl = [];
            for(let urlPart of urlSplitted){
                urlPartSplitted = urlPart.trim().split(' ');
                urlPartSplitted[0] = fasterTool.fixUrl(urlPartSplitted[0], fixType, value);
                newUrl.push(urlPartSplitted.join( ' ' ));
            }

            return newUrl.join(',');
        },
        fixUrlBig : function(url){
            return fasterTool.fixUrl(url, 'oneClickFasterAllowBig');
        },
        fixUrl : function(url, add, addValue){
            addValue = 'undefined' != typeof addValue ? addValue : '1'
            var hasQuestionMark = url.indexOf('?') > -1;
            return url + (!hasQuestionMark ? '?' : '&') + add + '=' + addValue;
        },
        lazyLoadUrls:[],
        lozad: 'undefined' != typeof lozad ? lozad() : null,
        imgPlaceHolderImg: chrome.runtime.getURL('images/image-placeholder.png') ,
        videoPlaceHolderImg: chrome.runtime.getURL('images/video-placeholder.png') 
        }
        //console.log('getCurrnetThrottleLevel',getCurrnetThrottleLevel);
        getCurrnetThrottleLevel(location.hostname, function(levelFromData){
        level = levelFromData;
        if(1||level){
            //console.log(level, 'level');
            fasterTool.observe.start();
        }
        });



    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.action){
              case 'canceled':
              //console.log(request);
              switch(request.type){
                case 'image':
                    //fasterTool.markImgAsLazyLoad(request.url);
                    break;
                case 'image-big':
                  fasterTool.markImgAsCanceled(request.url);
                  break;
                case 'media-big':
                    var exacType = request.exacType ? request.exacType : 'video';
                    exacType = exacType.split('/')[0];
                    //console.log(exacType, request.url);
                    fasterTool.markMediaAsCanceled(exacType, request.url);
                    break;
                case 'stylesheet':
                    fasterTool.addLazyAttr(request.url);
                    break;
                }
                break;
          }
        });
}


