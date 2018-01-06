var storyItemController = function(sb, input){
	var relPathIn=input.relPath, textReactionShowAllButton=null, authenticatedUser=input.authenticatedUser, storyItemList=null, albumContainerJS=null, storyPage=input.storyPage, currentNavBtn=null, prevNavBtn=null, scrollListContainer=null, loginUserName=input.username, lastUpdatedStreamDate = input.lastUpdatedStreamDate, getMoreStories=input.getMoreStories, numberOfStoriesToGet=input.numberOfStoriesToGet, storiesDivId = input.storiesDivId, documentTypeToShow="ALL", contactTypeToShow="ANY", storyJSTemplateName = input.storyJSTemplateName, newestUpdatedStreamDate = input.newestUpdatedStreamDate, overRideHomeUrl = input.overRideHomeUrl, gettingNewerStories = false, lastScrollTop = sb.dom.find(window).scrollTop(), deleteUrl = null;
  
   
   function _showAlltextReactionsButtonClickEvent(){

   }
   
   function _deleteStorySuccess(deleteStoryResponse){
	   
   }
   
   function _uiButtonMouseOver(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _uiButtonMouseOut(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _showNextStoryButtonClickEvent(e){
	   var showNextStoryButton = sb.dom.find(this);
	   var buttonId = showNextStoryButton.attr('id');
	   var storyId = buttonId.split('-')[1];
	   sb.dom.find('#storyItem-'+storyId).hide();
	   Core.publish('reloadReactions', null);
	   sb.dom.find(this).parent().hide();
   }
   
   function deleteConfirm(button){
	   //alert(button);
	   if(button == 2 && deleteUrl != null){
		   
		   sb.utilities.serverDelete(deleteUrl,null,_deleteStoryTransactionSuccess);	   	   
	   }else{
			deleteUrl = null;   
			Materialize.toast('Delete Cancelled!');
	   }
	   
	
   }
   function _unSharePageButtonClickEvent(e){
		if(sb.utilities.isUserLoggedIn()){
		   var unSharePageButton = sb.dom.find(this);
		   var unSharePageButtonId = unSharePageButton.attr('id');
		   var storyId = unSharePageButtonId.split('-')[1];
		   deleteUrl = relPathIn+"Story/"+storyId+"?mediaType=json";
    	   navigator.notification.confirm('Are you sure?', deleteConfirm, 'Delete', 'Cancel, Yes Delete');		   
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
   }
   
   function _deleteStoryButtonClickEvent(e){
	   var deleteStoryButton = sb.dom.find(this);
	   var buttonId = deleteStoryButton.attr('id');
	   var storyId = buttonId.split('-')[1];
	   _deleteStoryConfirm(storyId);
   }
   
   function _deleteStoryConfirm(storyId){
		if(sb.utilities.isUserLoggedIn()){
			deleteUrl = relPathIn+"Story/"+storyId+"?mediaType=json";
    	   navigator.notification.confirm('Are you sure?', deleteConfirm, 'Delete', 'Cancel, Yes Delete');
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
   }
   function _editStoryButtonClickEvent(e){
	   var editStoryButton = sb.dom.find(this);
	   var buttonId = editStoryButton.attr('id');
	   var storyId = buttonId.split('-')[1];
	   var storyDocumentType = buttonId.split('-')[2];
	   Core.publish('editStory', {storyId: storyId, storyDocumentType: storyDocumentType});
   }
   
   function _deleteStoryTransactionSuccess(deleteStoryTransactionResponse){
	   if(deleteStoryTransactionResponse.antahRequestStatus == "SUCCESS"){		   
		   sb.dom.find('#storyItem-'+deleteStoryTransactionResponse.antahResponseMessage).each(function(){
			  sb.dom.find(this).remove();
			  Core.publish("displayMessage",{message: sb.dom.find("#StoryItemController-StoryItemDelete-Success").html(), messageType: "success"});
		   });
		   Core.publish("storyDeleted", {storyId: deleteStoryTransactionResponse.antahResponseMessage});
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
   }
   
   function _unSharePageTransactionSuccess(deleteStoryTransactionResponse){
	   if(deleteStoryTransactionResponse.antahRequestStatus == "SUCCESS"){		   
		   if(storyPage){
			   sb.utilities.pageReload();
		   }else{
			   sb.dom.find('#unSharePage-'+deleteStoryTransactionResponse.antahResponseMessage).parents('.storyItem').remove();
		   }
		   
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
   }
      
   function _resetImageUrl(){
	   var imageSrc = sb.dom.find(this).attr('src');
	   if(!imageSrc.match("^data")){
		   imageSrc = relPathIn + imageSrc;
		   sb.dom.find(this).attr('src', imageSrc);		   
	   }
   }
   
   function _setTargetBlankForAnchor(){
	   var anchorElem = sb.dom.find(this);
	   anchorElem.attr('target', '_blank');
   }
   function _correctImageUrlForStory(){
	   var storyImageList = sb.dom.find('.story').find('img');
	   storyImageList.each(_resetImageUrl);
	   
	   var storyAnchorList = sb.dom.find('.story').find('a');
	   storyAnchorList.each(_setTargetBlankForAnchor);
   }
   
   function _removeAnchor(){
	   var newElement = sb.dom.wrap("<span>"+sb.dom.find(this).html()+"</span>");
	   sb.dom.find(this).replaceWith(newElement);
   }
   
   function _removeAnchorFromStory(){
	   var anchorList = sb.dom.find(this).find('a');
	   anchorList.each(_removeAnchor);
   }
   function _removeAnchorsForStoryItems(){
	   var storyItemStoryList = sb.dom.find('.storyPreview');
	   storyItemStoryList.each(_removeAnchorFromStory);
   }
   
   
   function _showStory(e){
	   e.preventDefault();
	   var storyId=sb.dom.find(this).attr('id');
	   var storyUrl = relPathIn + "Story/" + storyId;
	   window.open(storyUrl);
   }
   
   function _storyHeaderClick(e){
	   if(!storyPage){
		   sb.dom.find(this).parent().find('.storyItemBody').slideToggle();		   
	   }
   }
   
   function _showPicturesButtonClick(e){
	   sb.dom.find(this).parent().find('.storyItemBody').slideToggle();
   }
   
   function _CommentsSummaryClick(e){
	   var storyItemBody = sb.dom.find(this).parentsUntil(this, '.storyItem').find('.storyItemBody');
	   	   storyItemBody.slideDown();
	   	   storyItemBody.find('.cmntsection').triggerHandler('click');
	   	   
   }
   
   function _RepliesSummaryClick(e){
	   var storyItemBody = sb.dom.find(this).parentsUntil(this, '.storyItem').find('.storyItemBody');
   	   storyItemBody.slideDown();
   	   storyItemBody.find('.rplysection').triggerHandler('click');
   	   
   }
   
   function _HighlightSummaryClick(e){
	   try{
	   var storyItemBody = sb.dom.find(this).parentsUntil(this, '.storyItem').find('.storyItemBody');
   	   storyItemBody.slideDown();
   	   storyItemBody.find('.clickReacMessage').triggerHandler('click');
	   }catch(err){
			  appendFooterMessage("could not get stream. " + data.antahRequestStatus); 
	   }
		
   }
   
   function _ShareSummaryClick(e){
	   var storyItemBody = sb.dom.find(this).parentsUntil(this, '.storyItem').find('.storyItemBody');
   	   storyItemBody.slideDown();
   }

   function _initializePicturePresentation(){
	   albumContainerJS = document.getElementById('pictureList');
   		window.myAlbumView=Swipe(albumContainerJS, {
   			startSlide: 0,
   			auto: 3000,
   			continuous: true,
   			disableScroll: false,
   			stopPropagation: false,
   			callback: function(index, containerHandle){
   				if(prevNavBtn != null){
   					prevNavBtn.css('background-color','inherit');
   				}
   				currentNavBtn = sb.dom.find('#scrollBar').find('#'+index);
   				currentNavBtn.css('background-color','#3299BB');
   				prevNavBtn = currentNavBtn;   				
   			},
   			transitionEnd: function(index, containerHandle){
   				if(prevNavBtn != null){
   					prevNavBtn.css('background-color','inherit');
   	   				scrollListContainer.scrollLeft(prevNavBtn.position().left);
   				}
   				currentNavBtn = sb.dom.find('#scrollBar').find('#'+index);
   				currentNavBtn.css('background-color','#3299BB');
   				prevNavBtn = currentNavBtn;

   			}
   		});				   		
   }
   
   function _listElementClick(e){
	   var elementId = sb.dom.find(this).attr('id');
	   myAlbumView.slide(elementId, 1000);
   }
   
   function _hideCaptionClicked(e){
	   sb.dom.find(this).parent().find('#captionTextArea').fadeOut();
   }
   
   function _scrollToReactionsSection(e){
	   sb.dom.find('html, body').animate(
			   {
				   scrollTop: sb.dom.find('.TxtReactionList').offset().top
			   }, 1000
	   );
   }
   
	function reSizeBigPictures(){
		var bigPictureList = sb.dom.find('.bigpicture');
		
		
		for(var i=0; i<bigPictureList.length; i++){
			var bigpic = bigPictureList[i];
			var bigPicId = sb.dom.find(bigpic).attr("id");
			var width = sb.dom.find(bigpic).attr("id").split("-")[2];
			var windowWidth = sb.dom.find(bigpic).width();

			if(width > windowWidth){
				var newWidth = windowWidth * 0.90;
				var newSize = newWidth + "px auto"; 
				sb.dom.find(bigpic).css("background-size", newSize);
			}
		}
		
		
	}
	
	function _newStoryAddedMessageReceived(message){
		
		if(storyPage){
			 sb.utilities.pageReload();
		}else{

			try{
				var storyItemNode =sb.dom.find(message.storyItemDivId);			
				//alert('_newStoryAddedMessageReceived ' + message.storyItemDivId);
				storyItemNode.find('.showPictures').bind('click', _showPicturesButtonClick);
				//storyItemNode.find('.storyItemHeader').bind('click', _storyHeaderClick);
				storyItemNode.find('.CommentsSummary').bind('click', _CommentsSummaryClick);
				console.log(storyItemNode.find('.CommentsSummary').html() + " " + storyItemNode.find('.CommentsSummary'));
				storyItemNode.find('.RepliesSummary').bind('click', _RepliesSummaryClick);
				storyItemNode.find('.HighlightSummary').bind('click', _HighlightSummaryClick);
				storyItemNode.find('.ShareSummary').bind('click', _ShareSummaryClick);
				storyItemNode.find('.deleteStory').each(_setDeleteStoryClickEvent);
				storyItemNode.find('.editStory').each(_setEditStoryClickEvent);
	    		
				storyItemNode.find('.listElement').bind('click', _listElementClick);
				storyItemNode.find('.reactionCountButton').on('click', _scrollToReactionsSection);

				storyItemNode.find('.dropdown-button').show();
				storyItemNode.find('.dropdown-button').dropdown({
				  inDuration: 300,
				  outDuration: 225,
				  constrainWidth: false, // Does not change width of dropdown to that of the activator
				  hover: true, // Activate on hover
				  gutter: 0, // Spacing from edge
				  belowOrigin: false, // Displays dropdown below the button
				  alignment: 'right', // Displays dropdown with edge aligned to the left of button
				  stopPropagation: false // Stops event propagation
				}
				);
				
				scrollListContainer=storyItemNode.find('#scrollListContainer');
				
				storyItemNode.find('#hideCaption').bind('click', _hideCaptionClicked);

				sb.dom.find('.unSharePageButton').bind('click', _unSharePageButtonClickEvent);

	    		_correctImageUrlForStory();

	    		_removeAnchorsForStoryItems();

		    		reSizeBigPictures();
		    		sb.dom.find(window).resize(reSizeBigPictures);
		    		
				}catch(err){
					console.log(err);
				}
			
		}

	}
	
	function _pageSnippetAddedReceived(message){
   		//defaultClickReactionsDivList = sb.dom.find('.storyItemFooter');
   		//_loadPageReactionList(defaultClickReactionsDivList);
		if(storyPage){
			 sb.utilities.pageReload();
		}else{
	   		sb.dom.find(message.snippetId).find('.storyItem').each(
	   				function(){	   					
	   					try{
	   						var storyItemNode =sb.dom.find(this);				
	   						storyItemNode.find('.showPictures').bind('click', _showPicturesButtonClick);
	   						//storyItemNode.find('.storyItemHeader').bind('click', _storyHeaderClick);
	   						storyItemNode.find('.CommentsSummary').bind('click', _CommentsSummaryClick);
	   						console.log(storyItemNode.find('.CommentsSummary').html() + " " + storyItemNode.find('.CommentsSummary'));
	   						storyItemNode.find('.RepliesSummary').bind('click', _RepliesSummaryClick);
	   						storyItemNode.find('.HighlightSummary').bind('click', _HighlightSummaryClick);
	   						storyItemNode.find('.ShareSummary').bind('click', _ShareSummaryClick);
	   						storyItemNode.find('.deleteStory').each(_setDeleteStoryClickEvent);
	   						storyItemNode.find('.editStory').each(_setEditStoryClickEvent);
	   			    		
	   						storyItemNode.find('.listElement').bind('click', _listElementClick);
	   						storyItemNode.find('.reactionCountButton').on('click', _scrollToReactionsSection);
	   						scrollListContainer=storyItemNode.find('#scrollListContainer');
	   						
	   						storyItemNode.find('#hideCaption').bind('click', _hideCaptionClicked);

	   						storyItemNode.find('.unSharePageButton').bind('click', _unSharePageButtonClickEvent);
				
							storyItemNode.find('.dropdown-button').show();
							storyItemNode.find('.dropdown-button').dropdown({
								  inDuration: 300,
								  outDuration: 225,
								  constrainWidth: false, // Does not change width of dropdown to that of the activator
								  hover: true, // Activate on hover
								  gutter: 0, // Spacing from edge
								  belowOrigin: false, // Displays dropdown below the button
								  alignment: 'right', // Displays dropdown with edge aligned to the left of button
								  stopPropagation: false // Stops event propagation
								}
							  );
				
	   			    		_correctImageUrlForStory();

	   			    		_removeAnchorsForStoryItems();

	   				    		reSizeBigPictures();
	   				    		sb.dom.find(window).resize(reSizeBigPictures);
	   				    		
	   						}catch(err){
	   							console.log(err);
	   						}
	   				}
	   		);
		}
	}
	
	function _showStories(data){
		
		try{			
		if(data.antahRequestStatus == "SUCCESS"){
			
			for(var i=0; i < data.streamResponse.storyItemList.length; i++){
				try{
				addStoryItemToView(data.streamResponse.storyItemList[i]);
				}catch(e){
					console.log('problem loading story ' + data.streamResponse.storyItemList[i].storyDocumentPageId + " " + e);
				}
			}
			lastUpdatedStreamDate = data.streamResponse.storyItemList[data.streamResponse.storyItemList.length - 1].storyTimeStampStringFormat;
			if(data.streamResponse.streamHasMoreStories){				
				sb.dom.find("#storiesDivTrailer").find("#showMore").html(sb.dom.find("#jstemplate-show-more-stories").html());
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass(" fa-spinner");
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass("fa-pulse");				
				sb.dom.find("#storiesDivTrailer").find("#showMore").attr("disabled", false);
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").addClass("fa-chevron-down");
			}else{			
				sb.dom.find("#storiesDivTrailer").find("#showMore").html(sb.dom.find("#jstemplate-end-of-stories").html());
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass(" fa-spinner");
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").removeClass("fa-pulse");				
				sb.dom.find("#storiesDivTrailer").find("#showMore").attr("disabled", true);
				sb.dom.find("#storiesDivTrailer").find("#showMore").find(".fa").addClass("fa-chevron-down");
			}
			sb.dom.find("#storiesDivTrailer").find("#showMore").removeClass("nd");
		}else{
			appendFooterMessage("could not get stream. " + data.antahRequestStatus);
		}
		}catch(e){
			appendFooterMesssage("There was a problem getting stream data..  " + e);
		}
		sb.dom.find("#lp").find("#format").show();
		sb.dom.find("#storiesDivHeader").find("#format").show();
		sb.dom.find("#storiesDivHeaderNonMobile").find("#formatNonMobile").show();
	}
	
	function _showNewerStories(data){	
		try{			
		if(data.txnStatus == "SUCCESS"){
			if(data.storyItemList && data.storyItemList.length > 0){
				for(var i= data.storyItemList.length - 1; i >= 0 ; i--){
					try{
					var storyItemDocumentPageId = data.storyItemList[i].storyDocumentPageId;
					var storyItemNode = sb.dom.find("#storyItem-"+storyItemDocumentPageId);
					   if(storyItemNode){
						   sb.dom.find(storyItemNode).remove();
						   prependStoryItemToView(data.storyItemList[i]);
					   }else{
						   prependStoryItemToView(data.storyItemList[i]);
					   }					
					}catch(e){
						console.log('problem loading story ' + data.storyItemList[i].storyDocumentPageId + " " + e);
					}
				}
			}
		}else{
			console.log("could not get stream. " + data.txtStatusReason);			
		}
		}catch(e){
			console.log("There was a problem getting stream data..  " + e);
		}
		newestUpdatedStreamDate = data.mostRecentStoryDate;
		sb.dom.find("#lp").find("#format").show();
		sb.dom.find("#storiesDivHeader").find("#format").show();
		sb.dom.find("#storiesDivHeaderNonMobile").find("#formatNonMobile").show();
		sb.dom.find(storiesDivId).find("#busyCog").remove();
		gettingNewerStories = false;
	}
	
	   function addStoryItemToView(storyItem){
		   
		   var storyItemHtml = tmpl("template-storyTemplate", storyItem);	   
		   sb.dom.find(storiesDivId).append(sb.utilities.htmlDecode(storyItemHtml));
		   Core.publish("newStoryAdded", {storyItemDivId: "#storyItem-"+storyItem.storyDocumentPageId});
			Core.publish('contactToolTipAdded', {divId: "#storyItem-"+storyItem.storyDocumentPageId});
	   }
	   
	   function prependStoryItemToView(storyItem){
		   var storyItemHtml = tmpl(storyJSTemplateName, storyItem);	   
		   sb.dom.find(storiesDivId).prepend(sb.utilities.htmlDecode(storyItemHtml));
		   Core.publish("newStoryAdded", {storyItemDivId: "#storyItem-"+storyItem.storyDocumentPageId});
			Core.publish('contactToolTipAdded', {divId: "#storyItem-"+storyItem.storyDocumentPageId});
	   }
	   
	   function _showAllHomePageStoriesClicked(e){
		   sb.dom.find("#storiesDiv").find(".HomeSTORY").slideToggle();
	   }
	   
	   function _showAllChapterStoriesClicked(e){
		   sb.dom.find("#storiesDiv").find(".ExclusiveSTORY").slideToggle();
	   }
	   
	   function _showAllMagazineStoriesClicked(e){
		   sb.dom.find("#storiesDiv").find(".MagazineSTORY").slideToggle();
	   }
	   
	   function _showMoreStoriesClicked(e){
		   sb.dom.find(this).attr("disabled", true);
		   sb.dom.find(this).find(".fa").removeClass("fa-chevron-down");
		   sb.dom.find(this).find(".fa").addClass(" fa-spinner");
		   sb.dom.find(this).find(".fa").addClass("fa-pulse");
		   
					if(sb.utilities.isUserLoggedIn()){
						var userData = sb.utilities.getUserInfo();				
						snippetUrl = relPathIn+"appView?mediaType=json";
						data = {username: userData.username, appname: input.appname, lastUpdatedStreamDate: lastUpdatedStreamDate, streamSize: numberOfStoriesToGet, postedBeforeAfter: "BEFORE"};
						sb.utilities.postV2(snippetUrl, data, _showStories);
					}else{
		    			sb.utilities.postV2(relPathIn+'appView?mediaType=json', {appname: input.appname, lastUpdatedStreamDate: lastUpdatedStreamDate, streamSize: numberOfStoriesToGet, postedBeforeAfter: "BEFORE"}, _showStories);
					}
	   }
	   

	   function _hideContainer(){
		   sb.dom.find(this).slideUp();
		   sb.dom.find(this).remove();
	   }
	   function _getNewStoriesMessageReceived(data){
		   _getNewerStories();
	   }
	   
	   function _setDeleteStoryClickEvent(){
		   console.log('delete story set..');
		   sb.dom.find(this).bind('click', _deleteStoryButtonClickEvent);
	   }
	   
	   function _setEditStoryClickEvent(){
		   console.log('edit story set..');
		   sb.dom.find(this).bind('click', _editStoryButtonClickEvent);
	   }
	   	   
	function appendFooterMessage(msg){
		sb.dom.find("#message1").append("<br>"+msg);
	}
	
	function _addStoryToView(response){
		if(response.txnStatus == "SUCCESS"){
			try{
			var storyItemNode = sb.dom.find("#storyItem-"+response.storyitem.storyDocumentPageId);
			if(storyItemNode){
				sb.dom.find(storyItemNode).remove();	
			}
			prependStoryItemToView(response.storyitem);
			}catch(e){
				alert(e);	
			}
		}
	}
	
	function _newStoryReceivedFromServer(message){
		sb.utilities.get(message.storyDocumentType+'/Story/'+message.storyId+'?mediaType=json',null,_addStoryToView);	
	}
	

	function _socialShareSuccess(result){
		sb.dom.find('#social-sharing-loading-modal').modal('close');
		console.log("Story Published To Social Media");	
	}

	function _socialShareError(msg){
		sb.dom.find('#social-sharing-loading-modal').modal('close');
		alert(msg);	
	}
	
	function _socialShareRichTextServerResponseReceived(storyResponse){
		
		try{
			if(storyResponse.txnStatus == "SUCCESS"){
						var options = {
							url: input.serverUrl+storyResponse.storyitem.storyDocumentType+'/Story/'+storyResponse.storyitem.storyDocumentPageId+'-true',
							chooserTitle: "Share With"
						};	
						if(storyResponse.storyitem.story){
							options.message = storyResponse.storyitem.story + "\n\n" + "Posted By " + storyResponse.storyitem.storyAuthor + "\n\n" + "Read More on " + input.appname + " app. \n\n";	
						}
						if(storyResponse.storyitem.storyTitle){
							options.subject = storyResponse.storyitem.storyTitle;	
						}
						if(storyResponse.base64PictureForSocialSharing){
							options.files = ["data:image/gif;base64,"+storyResponse.base64PictureForSocialSharing];
						}
						window.plugins.socialsharing.shareWithOptions(options, _socialShareSuccess, _socialShareError);		
						options = null;
						sb.dom.find('#social-sharing-loading-modal').modal('close');
			}else{
				alert('There was a problem retrieving content for sharing. Please try again later. ' + storyResponse.txnStatusReason);	
				sb.dom.find('#social-sharing-loading-modal').modal('close');
			}
		}catch(e){
			alert(e);	
			sb.dom.find('#social-sharing-loading-modal').modal('close');
		}
	}
	function _socialShareRichText(data){
		sb.utilities.get(data.docType+'/StoryForSocialSharing/'+data.id+'?mediaType=json',null,_socialShareRichTextServerResponseReceived);
	}
	
	function _socialShareClicked(data){
		try{
		sb.dom.find('#social-sharing-loading-modal').modal('open');
		if(data.idType == 'RICHTEXT'){
			_socialShareRichText(data);
		}else{
			alert('Sharing this media type is not supported in this version. Please install a later version of the App to share this media type.');	
		}

		
		}catch(e){
			alert(e);	
		}
	}
	function _startController(message){
		try{
				//alert('story item controller starting.');
				sb.dom.find('#storyPostContainerTab').prop('disabled', false);
				lastUpdatedStreamDate = message.lastUpdatedStreamDate;
	    		_correctImageUrlForStory();

	    		_removeAnchorsForStoryItems();
	    		sb.dom.find('.storyPreview').bind('click', _showStory);
	    		
	    		sb.dom.find('.showPictures').bind('click', _showPicturesButtonClick);
	    		//sb.dom.find('.storyItemHeader').bind('click', _storyHeaderClick);
	    		sb.dom.find('.CommentsSummary').bind('click', _CommentsSummaryClick);
	    		sb.dom.find('.RepliesSummary').bind('click', _RepliesSummaryClick);
	    		sb.dom.find('.HighlightSummary').bind('click', _HighlightSummaryClick);
	    		sb.dom.find('.ShareSummary').bind('click', _HighlightSummaryClick);
	    		
	    		sb.dom.find('.deleteStory').each(_setDeleteStoryClickEvent);
	    		sb.dom.find('.editStory').each(_setEditStoryClickEvent);
	    		sb.dom.find('#showAllHomePageStories').bind('click', _showAllHomePageStoriesClicked);
	    		sb.dom.find('#showAllChapterStories').bind('click', _showAllChapterStoriesClicked);
	    		sb.dom.find('#showAllMagazineStories').bind('click', _showAllMagazineStoriesClicked);
	    		
	    		sb.dom.find('#showAllHomePageStoriesNM').bind('click', _showAllHomePageStoriesClicked);
	    		sb.dom.find('#showAllChapterStoriesNM').bind('click', _showAllChapterStoriesClicked);
	    		sb.dom.find('#showAllMagazineStoriesNM').bind('click', _showAllMagazineStoriesClicked);
	    		sb.dom.find('.unSharePageButton').bind('click', _unSharePageButtonClickEvent);   		
	    		sb.dom.find('#storiesDivHeader').show();
	    		
				sb.dom.find("#storiesDivTrailer").find("#showMore").off("click");
	    		sb.dom.find("#storiesDivTrailer").find("#showMore").click(_showMoreStoriesClicked);
				
				sb.dom.find('.dropdown-button').show();
				sb.dom.find('.dropdown-button').dropdown({
								  inDuration: 300,
								  outDuration: 225,
								  constrainWidth: false, // Does not change width of dropdown to that of the activator
								  hover: true, // Activate on hover
								  gutter: 0, // Spacing from edge
								  belowOrigin: false, // Displays dropdown below the button
								  alignment: 'right', // Displays dropdown with edge aligned to the left of button
								  stopPropagation: false // Stops event propagation
								}
							  );
											
	    		if(storyPage){	 
		    		reSizeBigPictures();
		    		sb.dom.find(window).resize(reSizeBigPictures);
	    		}
	    		
	    		sb.dom.find('.listElement').bind('click', _listElementClick);
	    		sb.dom.find('.reactionCountButton').on('click', _scrollToReactionsSection);
	    		scrollListContainer=sb.dom.find('#scrollListContainer');
	    		
	    		sb.dom.find('#hideCaption').bind('click', _hideCaptionClicked);
	    		
	    		Core.subscribe('newStoryAdded', _newStoryAddedMessageReceived);
	    		Core.subscribe('getNewStories', _getNewStoriesMessageReceived);
	    		Core.subscribe('pageSnippetAdded', _pageSnippetAddedReceived);
				Core.subscribe('newStoryReceived', _newStoryReceivedFromServer);
				Core.subscribe('socialShare', _socialShareClicked);
	    		//alert(getMoreStories + " " + lastUpdatedStreamDate);
	    		if(getMoreStories && lastUpdatedStreamDate != "" && lastUpdatedStreamDate != null && lastUpdatedStreamDate != "null"){
					//alert('Getting more story items');
					if(sb.utilities.isUserLoggedIn()){
						var userData = sb.utilities.getUserInfo();				
						snippetUrl = relPathIn+"appView?mediaType=json";
						data = {username: userData.username, appname: input.appname, lastUpdatedStreamDate: lastUpdatedStreamDate, streamSize: numberOfStoriesToGet, postedBeforeAfter: "BEFORE"};
						sb.utilities.postV2(snippetUrl, data, _showStories);
					}else{
		    			sb.utilities.postV2(relPathIn+'appView?mediaType=json', {appname: input.appname, lastUpdatedStreamDate: lastUpdatedStreamDate, streamSize: numberOfStoriesToGet, postedBeforeAfter: "BEFORE"}, _showStories);
					}
	    		}
	    		if(lastUpdatedStreamDate != "" && lastUpdatedStreamDate != null && lastUpdatedStreamDate != "null"){
	    			sb.dom.find("#storiesDivTrailer").find("#showMore").attr("disabled", true);
	    		}
		}catch(err){
				appendFooterMessage(err);
		}
	}
   return{
	   init:function() {
       	try{
			Core.subscribe('startStoryItemController', _startController);
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace("Module destroyed");
   		}	   
     }
    };