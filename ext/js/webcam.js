localstream = null;
cancelXhr = false;
captureButton = document.getElementById('capture');
player = document.getElementById('vid');
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
if (navigator.webkitGetUserMedia!=null) {

    var options = { 
        video:true, 
        audio:false 
    };  
    navigator.webkitGetUserMedia(options, 
        function(stream) { 
            vid.src = window.webkitURL.createObjectURL(stream);
            localstream = stream;
            vid.play();
            console.log("streaming");
        }, 
        function(e) { 
        console.log("background error : " + e);
        }); 
} 
 captureButton.addEventListener('click', () => {
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
    canvasToDataURL = canvas.toDataURL();
    $('#topText').html('uploading <a href="#" id=a_cancel>Cancel</a>').find('#a_cancel').click(function(){
        cancelXhr = true;
    });

			
			//var url= screenshot.url;
			var options= localStorage['options'];
    hr = $.ajax({
        url:'https://www.openscreenshot.com/upload3.asp',
        type:'post',
        data:{
            type:'png',
            title:"from my webcam",
            description:"From my webcam",
           // imageUrl:url,
            options:localStorage.options,
            data:canvasToDataURL
            //service:service
            },
            complete: function (a,b,c) {
                            if(cancelXhr) {
                                $('#topText').html('Canceled!'); return;
                            }    
                            /* Fixing the vulnerable that discovered by Google */
                            var response = a.responseText.replace(/^\s+|\s+$/g,"");  // remove trailing white space
                            if (/"/.test(response) || />/.test(response) || /</.test(response) || /'/.test(response) || response.indexOf("http:") != 0 ) {
                                $("#topText").html('Please try again in some minutes. We are working to solve this issue.');
                            } else {
                                if(cancelXhr) {
                                    return;
                                }
                                response = response.split(',');
                                imageURL = response[0];
                                onlineUrl = imageURL;
                                imageDelete = response[1];
                                chrome.runtime.sendMessage({action: "imageUrlCreated",url:imageURL});
                                
                            }
       
                            }
                        })
    

  });