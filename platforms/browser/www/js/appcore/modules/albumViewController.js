var albumViewController = function(sb, input){
	var albumContainerJS = document.getElementById(input.elemHandle), albumContainerJQ=sb.dom.find('#'+input.elemHandle), startSlide=input.startSlide, albumPrevPhotoBtn=null, albumNextPhotoBtn=null, myAlbumView=null, 
	containerHandle=input.elemHandle, pgInfo=null, pageid=null, relPathIn = input.relPath, showOnTapTimer = null;
	
	function _reInitializeSwipe(){
		
   		albumContainerJQ.find('.albumPage').css('height',$(window).height());
   		window.myAlbumView=Swipe(albumContainerJS, {
   			startSlide: startSlide,
   			auto: 3000,
   			continuous: true,
   			disableScroll: false,
   			stopPropagation: false,
   			callback: function(index, containerHandle){
   				//sb.utilities.log('callback ' + index + containerHandle);
   			},
   			transitionEnd: function(index, containerHandle){
   				//sb.utilities.log('Transition End ' + index + containerHandle);
   			}
   		});
   		
   		
	}
	
	function _notifyAndAct(input){
		if(input.antahRequestStatus == "SUCCESS"){
			window.alert("The page was deleted successfully. We will refresh album for you.");
			refreshPage();
		}else{
			window.alert("This Page could not be removed. Please try again later. ");
		}
		
	}
	
	   function refreshPage(){
		   setTimeout(sb.utilities.pageReload, 1000);
	   }
	   
	function _clickRemButton(e){
		pgInfo=e.currentTarget.id.split("-");
		pageid=pgInfo[1];
		try{
			sb.utilities.serverDelete(relPathIn+"photo/"+pageid+"?mediaType=json",null,_notifyAndAct);
		}catch(err){
			console.log(err);
			Core.publish("displayMessage",{message: "The request could not be sent to the server. Please try again later.", messageType: "alert-failure"});
		}
		
	}	
	
	   function _slideDownMediaActionPanel(){
		   sb.dom.find(this).slideDown();
	   }
	   
	   function _slideUpMediaActionPanel(){
		   sb.dom.find(this).slideUp();
	   }
	   
	function _albumWindowKeyPressEvent(e){
		var keyPressed = (e.keyCode ? e.keyCode : e.which);
		console.log(keyPressed);
		if(keyPressed == 39){
			window.myAlbumView.next();
		}else if(keyPressed == 37){
			window.myAlbumView.prev();
		}else if(keyPressed == 38){
			   var slideShowCurrentIndex=window.myAlbumView.getPos();
			   window.myAlbumView.slide(slideShowCurrentIndex, 0);
			   var mediaActionPanelList = sb.dom.find('.mediaActionPanel');	   
			   mediaActionPanelList.each(_slideUpMediaActionPanel);
			   mediaActionPanelList = null;
		}else if(keyPressed == 40){
			   var slideShowCurrentIndex=window.myAlbumView.getPos();
			   window.myAlbumView.slide(slideShowCurrentIndex, 0);
			   var mediaActionPanelList = sb.dom.find('.mediaActionPanel');	   
			   mediaActionPanelList.each(_slideDownMediaActionPanel);
			   mediaActionPanelList = null;
		}
	}
	

	function reSizeBigPictures(){
		console.log('starting resize..');
		var bigPictureList = albumContainerJQ.find('.bigpicture');
		var windowWidth = sb.dom.find(window).width();
		var windowHeight = sb.dom.find(window).height();
		
		for(var i=0; i<bigPictureList.length; i++){
			var bigpic = bigPictureList[i];
			var bigPicId = sb.dom.find(bigpic).attr("id");
			var width = sb.dom.find(bigpic).attr("id").split("-")[2];
			var height = sb.dom.find(bigpic).attr("id").split("-")[3];
			var aspectRatio = width/height;
			
			if(aspectRatio > 1){
				if(width > windowWidth){
					console.log('inside landscape..');
					var newWidth = windowWidth * 0.80;
					var newHeight = newWidth / aspectRatio;
					var newSize = newWidth.toString() + "px " + newHeight.toString() + "px";
					console.log(newSize);
					sb.dom.find(bigpic).css("background-size", newSize);
				}				
			}else{
				if(height > windowHeight){
					console.log('inside portrait..');
					var newHeight = windowHeight * 0.80;
					var newWidth = newHeight * aspectRatio;
					var newSize = newWidth.toString() + "px " + newHeight.toString() + "px";
					console.log(newSize);
					sb.dom.find(bigpic).css("background-size", newSize);
				}
			}

		}
	}
	
	function hideShowOnTopItems(){
		sb.dom.find('.showOnTap').each(function(){
			sb.dom.find(this).fadeOut();
		});
	}
	
	function showShowOnTopItems(e){
		sb.dom.find('.showOnTap').each(function(){
			sb.dom.find(this).fadeIn();
		});
		window.clearTimeout(showOnTapTimer);
		showOnTapTimer = window.setTimeout(hideShowOnTopItems, 5000);
	}
	
	function _waitAndHideShowOnTapItems(e){
		showOnTapTimer = window.setTimeout(hideShowOnTopItems, 2000);
	}
	function _startStopSlideShowClickEvent(e){
		if(sb.dom.find(this).find('.fa').hasClass('fa-pause')){
			sb.dom.find(this).find('.fa').removeClass('fa-pause');
			sb.dom.find(this).find('.fa').addClass('fa-play');
			myAlbumView.stop();
		}else if(sb.dom.find(this).find('.fa').hasClass('fa-play')){
			sb.dom.find(this).find('.fa').removeClass('fa-play');
			sb.dom.find(this).find('.fa').addClass('fa-pause');		
			myAlbumView.begin();
		}
	}
   return{
	   init:function() {
       	try{
       		albumContainerJQ.find('.albumPage').css('height',$(window).height());
       		window.myAlbumView=Swipe(albumContainerJS, 	{
       			startSlide: startSlide,
       			auto: 3000,
       			continuous: true,
       			disableScroll: false,
       			stopPropagation: false,
       			callback: function(index, containerHandle){
       				//sb.utilities.log('callback ' + index + containerHandle);
       			},
       			transitionEnd: function(index, containerHandle){
       				//sb.utilities.log('Transition End ' + index + containerHandle);
       			}
       		});
       		//sb.dom.find('.rmpic').bind('click', _clickRemButton);
       		sb.dom.find(window).bind('keyup', _albumWindowKeyPressEvent);
       		sb.dom.find(window).resize(reSizeBigPictures);
       		sb.dom.find(document).ready(_waitAndHideShowOnTapItems);
       		sb.dom.find('.albumPage').mousemove(showShowOnTopItems);
       		sb.dom.find('.ui-btn').mousedown(showShowOnTopItems);
       		sb.dom.find('#startStopSlideShow').click(_startStopSlideShowClickEvent);
       		reSizeBigPictures();
       	}catch(err){
       		sb.utilities.log("Error initializing albumViewController : " + err);
       	}
       },
   	  destroyModule:  function() { 
   			console.log(counter);
   			console.log("Module destroyed");
   		}	   
     }
    };