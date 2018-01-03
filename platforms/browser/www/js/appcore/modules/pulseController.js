var pulseController = function(sb, input){
	var relPathIn=input.relPath, inputUserName=input.inputUserName, storiesDivId = input.storiesDivId, storyJSTemplateName = input.storyJSTemplateName;

	function _showStories(data){
		try{			
		if(data.storyItemList && data.storyItemList.length > 0){	
			console.log(input.notificationPageId + "success");
			for(var i=0; i < data.storyItemList.length; i++){
				try{
				addStoryItemToView(data.storyItemList[i]);
				if(data.storyItemList[i].storyType == 'USERRELNOTIFICATION' && !data.storyItemList[i].pulseNotificationContactResponse.relatedToUser){
					Core.publish('pulseUserTileAdded', {pulseUserTileID: "pulseItemUser-"+data.storyItemList[i].pulseNotificationContactResponse.contact.username+"-panel"});
				}
				}catch(e){
					console.log('problem loading story ' + data.storyItemList[i].storyDocumentPageId + " " + e);
				}
			}			
			
			sb.dom.find(storiesDivId).css("min-height", 100*data.storyItemList.length + "px");
			lastUpdatedStreamDate = data.storyItemList[data.storyItemList.length - 1].storyTimeStampStringFormat;
			if(data.streamHasMoreStories){				
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass(" fa-spinner");
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass("fa-pulse");				
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").attr("disabled", false);
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").addClass("fa-chevron-down");
			}else{			
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").html(sb.dom.find("#jstemplate-end-of-stories").html());
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass(" fa-spinner");
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass("fa-pulse");				
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").attr("disabled", true);
				sb.dom.find(storiesDivId).find("#storiesDivTrailer").find("#showMore").find(".fa").addClass("fa-chevron-down");
			}
		}else{
			console.log("could not get notification details...");
		}
		}catch(e){
			console.log("There was a problem getting stream data..  " + e);
		}
		sb.dom.find("#lp").find("#format").show();
		sb.dom.find("#storiesDivHeader").find("#format").show();
		sb.dom.find("#storiesDivHeaderNonMobile").find("#formatNonMobile").show();
		Core.publish('renderTabs', null);
	}
	  
	   function addStoryItemToView(storyItem){
		   var storyItemHtml = tmpl(storyJSTemplateName, storyItem);	   
		   sb.dom.find(storiesDivId).append(sb.utilities.htmlDecode(storyItemHtml));
		   sb.dom.find(storiesDivId).find(".timeago").timeago();
	   }
	   
	   function _showUpdatedPulsePage(data){
		   sb.dom.find(storiesDivId).html("");
		   _showStories(data);
	   }
	   function _updatePulsePage(){
				console.log(input.notificationPageId);
	    		sb.utilities.get(relPathIn+'notificationpage.pvt/'+input.inputUserName+'?mediaType=json', null, _showUpdatedPulsePage);
	   }
	   function _newReactionAdded(data){
		   console.log('received publish for new reaction added..');
		   _updatePulsePage();
	   }
	   
   return{
	   init:function() {
       	try{
       			sb.utilities.trace('initializing module: notification controller');
	    		
	    		console.log(input.notificationPageId);
	    		if(input.notificationPageId > 0){
	    			console.log(input.notificationPageId);
		    		sb.utilities.get(relPathIn+'notificationpage.pvt/'+input.inputUserName+'?mediaType=json', _showStories);	    			
	    		}else{
	    			Core.publish('renderTabs', null);
	    		}
	    		Core.subscribe('newReactionAdded', _newReactionAdded);


       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace("Module destroyed");
   		}	   
     }
    };