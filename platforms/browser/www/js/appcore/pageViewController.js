var pageViewController = function(sb, input){
	var thisIsMobileDevice = true, storyEditorInitialized=false, albumContainerJS=null, storyEditHappening = false, documentEditHappening = false, userLogoStarted = false, placeHolderContainer=sb.dom.find("#jstemplate-pageViewController-placeHolderContainer").html(), relPathIn = input.relPath, appname=input.appname, streamSize = input.streamSize, newStream = null, storyItemControllerPublish = true, logoutAttempt=0, appOnPause = false;
	
	function _enableBigScreenFeatures(){
		sb.dom.find(".bigScreenItem").show();
	}
	
	function _setFontSize75EM(){
		sb.dom.find(this).css("font-size", "0.75em");
	}
	function _setFontSize1EM(){
		sb.dom.find(this).css("font-size", "1em");
	}
	
	function _setFontSize2EM(){
		sb.dom.find(this).css("font-size", "2em");
	}
	function _enableMobileScreenFeatures(){
		sb.dom.find('body').css('font-size', 'large');
		sb.dom.find('.storyItemBody').each(_setFontSize2EM);
		sb.dom.find('.storyItemFooter').each(_setFontSize2EM);
		sb.dom.find("#GContacts").css("font-size", "2em");
	}
	function _ShowStream(data){
		console.log('data received..' + JSON.stringify(data));
		sb.dom.find('#message').html(data);
	}

	function _toggleFullScreenEvent(e){
		var picturePanel = sb.dom.find('#picturePanel');
		if(sb.dom.find(this).hasClass('fullScreenEnabled')){
			
			picturePanel.removeClass('fullScreenPicturePanel');

			picturePanel.find('#pictureList').removeClass('fullScreenPictureList');

			picturePanel.find('.slideShowPicture').each(function(){
				sb.dom.find(this).removeClass('fullScreenPicture');
			});
			
			sb.dom.find('.subContainer').removeClass('fullScreenSubContainer');
			
			_initializePicturePresentation();			
			sb.dom.find(this).removeClass('fullScreenEnabled');					
		}else{
			picturePanel.addClass('fullScreenPicturePanel');

			picturePanel.find('#pictureList').addClass('fullScreenPictureList');

			picturePanel.find('.slideShowPicture').each(function(){
				sb.dom.find(this).addClass('fullScreenPicture');
			});
			
			sb.dom.find('.subContainer').addClass('fullScreenSubContainer');
			
			_initializePicturePresentation();			
			sb.dom.find(this).addClass('fullScreenEnabled');					
		}

	}
	
	   function addStoryItemToView(storyItem){
		   var storyItemHtml = tmpl("template-storyTemplate", storyItem);	   
		   sb.dom.find("#mainContainer").find("#storiesDiv").append(sb.utilities.htmlDecode(storyItemHtml));
			if(storyItem.storyDocumentPageId){
	   		   sb.dom.find("#mainContainer").find("#storiesDiv").find("#storyItem-"+storyItem.storyDocumentPageId).find('a').each(_setAnchorClickEvent);
			   if(!storyItemControllerPublish){
				   Core.publish("newStoryAdded", {storyItemDivId: "#storyItem-"+storyItem.storyDocumentPageId});
				}
		   }
		   if(storyItem.storyPictures && storyItem.storyPictures.length == 1){
				sb.dom.find("#mainContainer").find("#storiesDiv").find("#storyItem-"+storyItem.storyDocumentPageId).find('.materialboxed').materialbox();
			}
	   }
	   
	function processPageInformation(snippetResponse){
		try{
		   var pageListHtml = tmpl("template-documentItemList", snippetResponse);
		   sb.dom.find("#rightPanel").find("#documentPageList").html(sb.utilities.htmlDecode(pageListHtml));
		   if(sb.utilities.isUserLoggedIn()){
			   var showWriteToButton = false;
			   var firstDocToPost = true;
			   if(sb.dom.find('#createStoryHeaderDiv').find('#createStoryDocument').length == 0){
			    	sb.dom.wrap('<select>').attr({'name':'select-choice-1','id':'createStoryDocument','data-native-menu':'false', 'class':'browser-default cd'}).appendTo('#createStoryHeaderDiv');
			   }
				var optionHtml = null;
				
			   for(var i=0; i < snippetResponse.documentListResponse.documentItemList.length; i++){		
					  if(snippetResponse.documentListResponse.documentItemList[i].acceptPosts){
						if(firstDocToPost){
							optionHtml = sb.dom.wrap('<option>').attr({'value':snippetResponse.documentListResponse.documentItemList[i].documentId}).attr({'selected':'selected'}).html(snippetResponse.documentListResponse.documentItemList[i].documentTitle);
						firstDocToPost = false;
						}else{
							optionHtml = sb.dom.wrap('<option>').attr({'value':snippetResponse.documentListResponse.documentItemList[i].documentId}).html(snippetResponse.documentListResponse.documentItemList[i].documentTitle);
						}
						optionHtml.appendTo(sb.dom.find("#createStoryDocument"));
						showWriteToButton = true;
					  } 
			   }
			   if(showWriteToButton){
				    sb.dom.find("#createStoryDocument").selectmenu();
					sb.dom.find("#newMessageButton").fadeIn();
					sb.dom.find("#submitButtonForm").removeClass('nd');
					sb.dom.find("#attachPictures").removeClass('nd');
					sb.dom.find("#removePictures").removeClass('nd'); 					
				}else{
					sb.dom.find("#createStoryDocument").html("Currently no sections accept user posts.");				
				}
				if(sb.utilities.isUserLoggedIn()){
					sb.dom.find("#loginRegisterButton").fadeOut();   
					sb.dom.find("#guestWelcome").fadeOut(); 					
				}
		   }else{
				sb.dom.find("#loginRegisterButton").fadeIn();   
				sb.dom.find("#guestWelcome").fadeIn();   
				sb.dom.find("#eulaModal").modal('open');
			}
		}catch(e){
			alert('process page info pvc ' + e);	
		}
	}
	
	function _setAnchorClickEvent(){
		
		sb.dom.find(this).tap(_anchorClickEvent);		
	}
	    
	 function closeOverlay() {
	        sb.dom.find('.subContainer').first().animate({
	            top : '-=300',
	            opacity : 0
	        }, 600, function() {
	            sb.dom.find('#overlay-shade').fadeOut(300);
	            sb.dom.find(this).css('display','none');
	        });
	    }
		
		function _containerBackButtonClicked(e){
		   closeOverlay();		
		   sb.dom.find(this).parents('.subContainer').slideUp();
		   sb.dom.find(this).parents('.subContainer').remove();
		   var nextContainer = sb.dom.find('.container').first();		   
/*		   var nextContainerScrollTop = nextContainer.attr("data-scroll-top");
		   if(nextContainerScrollTop){
			   alert('have scroll top ' + nextContainerScrollTop);
			   nextContainer.scrollTop(nextContainerScrollTop);
		   }*/
		   nextContainer.show();
	   }
	   
		function _containerBackButtonClickedV2(e){		   
		   closeOverlay();		
		   sb.dom.find('.containers').find('.subContainer').first().slideUp();
		   sb.dom.find('.containers').find('.subContainer').first().remove();
		   if(sb.dom.find('.containers').find('.subContainer').length == 0){
				sb.dom.find(this).hide();  
				//sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');
		   }
		   if(sb.dom.find('.containers').find('.subContainer').length > 0){
			   var nextContainer = sb.dom.find('.subContainer').first();		   
	/*		   var nextContainerScrollTop = nextContainer.attr("data-scroll-top");
			   if(nextContainerScrollTop){
				   alert('have scroll top ' + nextContainerScrollTop);
				   nextContainer.scrollTop(nextContainerScrollTop);
			   }*/
			   nextContainer.show();
		   }
	   }	   

	    function openOverlay() {
	        var overLayDiv = sb.dom.find('.subContainer').first();	        
	        if (sb.dom.find('#overlay-shade').length == 0)
	            sb.dom.find('#containerDiv').prepend('<div id="overlay-shade"></div>');

	        sb.dom.find('#overlay-shade').fadeTo(300, 0.6, function() {
	            var props = {
	                oLayWidth       : overLayDiv.width(),
	                scrTop          : sb.dom.find('.appBody').scrollTop(),
	                viewPortWidth   : sb.dom.find(window).width()
	            };

	            var leftPos = (props.viewPortWidth - props.oLayWidth) / 2;

	            overLayDiv
	                .css({
	                    display : 'block',
	                    opacity : 0,
	                    top : props.scrTop
	                })
	                .animate({	                    
	                    opacity : 1
	                }, 600);
	        });
	    }
		
    	function _containerCloseButtonClicked(e){
		   closeOverlay();
		   sb.dom.find('.appHeader').find('#containerBackButton').hide();
		   var subContainerList = sb.dom.find('.subContainer');
		   for(var i= subContainerList.length - 1; i >=0 ; i--){
			  sb.dom.find(subContainerList[i]).slideUp();
			  sb.dom.find(subContainerList[i]).remove();			  
		   }
		   var nextContainer = sb.dom.find('.container').first();		   
		   /*var nextContainerScrollTop = nextContainer.attr("data-scroll-top");
		   if(nextContainerScrollTop){
			   nextContainer.scrollTop(nextContainerScrollTop);
		   }*/
		   nextContainer.show();			
		}
		
		
		function _moreStoriesResponseReceived(snippetResponse){

		   
		   if(snippetResponse != null){
			   sb.dom.find('#containerDiv').find('.container').first().find("#storiesDivPage").find("#storiesDiv").find('.preloader-wrapper').remove();
			   sb.dom.find('#containerDiv').find('.container').first().find("#storiesDivPage").find("#storiesDiv").append(snippetResponse);
			   var lastPageCount = sb.dom.find("#lastStoryPageCount").html();
			   sb.dom.find('#containerDiv').find('.container').first().find("#getMoreStoriesForPageButton").attr('data-attrib-lastPageNumber', lastPageCount);
			   if(lastPageCount == 1){
				   sb.dom.find('#containerDiv').find('.container').first().find('#documentPagination').hide();
				   sb.dom.find('#containerDiv').find('.container').first().find("#storiesDivPage").find("#storiesDiv").append(sb.dom.find("#jstemplate-noMoreStories").html());
				   sb.dom.find('#containerDiv').find('.container').first().find('#getMoreStoriesButton').html(sb.dom.find("#jstemplate-noMoreStories").html());
				   sb.dom.find('#containerDiv').find('.container').first().find('#getMoreStoriesButton').attr('enabled', false);
			   }
			   if(lastPageCount == 0){
				   sb.dom.find('#containerDiv').find('.container').first().find('#documentPagination').hide();				   
			   }			   
		   }else{
			   sb.dom.find('#containerDiv').find('.container').first().find("#storiesDivPage").find("#storiesDiv").find('.spinner-layer').remove();
			   sb.dom.find('#containerDiv').find('.container').first().find('#getMoreStoriesButton').html(sb.dom.find("#noMoreStories").html());
			  	sb.dom.find('#containerDiv').find('.container').first().find('#getMoreStoriesButton').attr('enabled', false);
		   }
	   		   
	   			
			
		}
		
	function _moreStoriesButtonClickEvent(e){
		var snippetUrl = sb.dom.find(this).attr('data-snippet-url');
		console.log('anchor click ');
		if(snippetUrl){
				   e.preventDefault();
				   var lastPageCount = sb.dom.find(this).attr('data-attrib-lastPageNumber');
				   var pageCountToGet = sb.dom.find('#pageCountSelect').val();				   
				   snippetUrl = snippetUrl + '&lastPageNumber=' + lastPageCount + '&pageCount=' + pageCountToGet;
				   sb.dom.find("#storiesDiv").append(sb.dom.find("#jstemplate-materialize-spinner").html());
				   sb.utilities.get(snippetUrl,null,_moreStoriesResponseReceived);
				   sb.dom.find('#lastStoryPageCount').remove();
		}else{
			console.log('now view snippet url has been set');
		}
			
	}
	
	
	   function _snippetResponseReceived(snippetResponse){
    		sb.dom.find("#loading-modal").modal('close');
		   if(snippetResponse != null){
			   try{
				snippetResponse = snippetResponse.trim();

			   sb.dom.find('.placeHolderContainer').remove();
			   sb.dom.find('#containerDiv').prepend(snippetResponse);
			   sb.dom.find('#containerDiv').find('.container').first().find('.containerBackButton').show();
			   sb.dom.find('#containerDiv').find('.container').first().find('.containerBackButton').bind('click', _containerBackButtonClickedV2);
			   sb.dom.find('#containerDiv').find('.container').first().find('.containerCloseButton').show();
			   sb.dom.find('#containerDiv').find('.container').first().find('.containerCloseButton').bind('click', _containerCloseButtonClicked);		
			   sb.dom.find('#containerDiv').find('.container').first().find('.CommentsSummary').removeClass('yui3-button');
			   sb.dom.find('#containerDiv').find('.container').first().find('.RepliesSummary').removeClass('yui3-button');
			   sb.dom.find('#containerDiv').find('.container').first().find('.HighlightSummary').removeClass('yui3-button');
			   sb.dom.find('#containerDiv').find('.container').first().find('.ViewSummary').removeClass('yui3-button');
			   sb.dom.find('#containerDiv').find('.container').first().find('.ShareSummary').removeClass('yui3-button');
			   sb.dom.find('#containerDiv').find('.container').first().find('.WhatsAppShare').removeClass('yui3-button');
			   sb.dom.find('.container').first().find('.storyItemBody').show();			   
			   sb.dom.find('.appHeader').find('#containerBackButton').show();
			   sb.dom.find('#containerDiv').find('.container').first().find('#getMoreStoriesForPageButton').click(_moreStoriesButtonClickEvent);
			   sb.dom.find('#containerDiv').find('.container').first().find('#documentPagination').show();	
			   sb.dom.find('#containerDiv').find('.container').first().find('#pageCountSelect').material_select();
			   openOverlay();
			   }
			   catch(error){
					alert('exception ' + error);   
				}
		   }else{
			   sb.dom.find('.placeHolderContainer').remove();
			   sb.dom.find(this).parents('.subContainer').slideUp();
			   sb.dom.find(this).parents('.subContainer').remove();
			   sb.dom.find('.container').first().show();			   
			   Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
		   }
	   		   
	   }

	   function _hideContainer(){
		   sb.dom.find(this).hide();
	   }

	function _anchorClickEvent(e){
		try{			
			var snippetUrl = sb.dom.find(this).attr('data-snippet-url');

			if(snippetUrl){
						sb.dom.find("#loading-modal").modal('open');				
					   e.preventDefault();
					   sb.dom.find('.subContainer').each(_hideContainer);
					   //sb.dom.find('#containerDiv').prepend(placeHolderContainer);		
					   //alert(sb.dom.find('#containerDiv').scrollTop());
					   //alert(sb.dom.find(this).scrollTo(0, 0));
					   //window.scrollTo(0, 0);
					   
					   var xhrRequest  = sb.utilities.get(snippetUrl,null,_snippetResponseReceived);
			}
			sb.dom.find("#rightPanel").panel("close");
		}catch(err){
			updateFooterMessage(err);	
		}
	}
	
	function _newStoryAddedToView(message){
		try{		
		var storyItemNode =sb.dom.find(message.storyItemDivId);
		scrollListContainer=storyItemNode.find('#scrollListContainer');
		sb.dom.find(message.storyItemDivId).find('.toggleFullScreen').on('click',_toggleFullScreenEvent);
	   	sb.dom.find(message.storyItemDivId).find('a').each(_setAnchorClickEvent);
		setTimeout(_initializePicturePresentation, 1500);
		}catch(err){
			console.log(err);
		}
	}
	

	function _loadMainPage(snippetResponse){
		   if(snippetResponse != null && snippetResponse.antahRequestStatus == "SUCCESS"){	
			   updateFooterMessage("");
			   sb.dom.find('#containerDiv').find("#mainContainer").find("#storiesDiv").html("");
			   if(snippetResponse.streamResponse && snippetResponse.streamResponse.storyItemList && snippetResponse.streamResponse.storyItemList.length > 0){
				   sb.utilities.setUserStream(snippetResponse.streamResponse);
					for(var i =0; i<snippetResponse.streamResponse.storyItemList.length;i++){
						try{
						addStoryItemToView(snippetResponse.streamResponse.storyItemList[i]);
						
						}catch(e){
							updateFooterMessage('problem loading story ' + snippetResponse.streamResponse.storyItemList[i].storyDocumentPageId + " " + e);
						}							
					} 
					if(storyItemControllerPublish){
						storyItemControllerPublish = false;
					Core.publish("startStoryItemController", {appname: appname, lastUpdatedStreamDate: snippetResponse.streamResponse.storyItemList[snippetResponse.streamResponse.storyItemList.length-1].storyTimeStampStringFormat, sseDetails: snippetResponse.sseHostDetails});
					}
				}else{
					updateFooterMessage("No Stories Received");
				}
			   if(snippetResponse.documentListResponse && snippetResponse.documentListResponse.documentItemList && snippetResponse.documentListResponse.documentItemList.length > 0){
						try{
						processPageInformation(snippetResponse);
						
						}catch(e){
							updateFooterMessage('problem loading page ' + snippetResponse.streamResponse.storyItemList[i].storyDocumentPageId + " " + e);
						}
				}else{
					updateFooterMessage("No Pages Received");
				}
			   sb.dom.find("#rightPanel").find("#documentPageList").find('a').each(_setAnchorClickEvent);			
			   sb.dom.find('#containerDiv').find('#mainContainer').find('div').first().removeClass('subContainer');
   			   sb.dom.find('#containerDiv').find('#mainContainer').find('div').first().removeClass('container');
			   sb.dom.find('#containerDiv').find('#mainContainer').find('div').first().find('.containerHeader').remove();
			   sb.dom.find("#storiesDivTrailer").find("#showMore").show();
			if(sb.dom.find('.grid').length > 0){
				var gridList = sb.dom.find('.grid');
				setTimeout(function(){gridList.each(_enableGrid)}, 5000);
			}
			sb.dom.find('.toggleFullScreen').on('click',_toggleFullScreenEvent);
			sb.dom.find('.timeago').timeago();
			if(sb.utilities.isUserLoggedIn() && !userLogoStarted){
				Core.publish('startUserLogo', null);	
				userLogoStarted = true;
			}
			sb.utilities.postV2('communityMembership?mediaType=json', {communityName: appname}, _communityMembershipInfo);
			
		   }else{
			   updateFooterMessage("There was a problem loading the Page. Please try again after some time. " + snippetResponse.antahResponseMessage);
			}
	}
	
	function _parseCommunityInfoOwner(key, value){
		try{
		sb.dom.find("#foundingMembers").append(tmpl("jstemplate-member-item", value));
		}catch(e){
			alert(e);
		}
	}
	function _parseCommunityInfoContributor(key, value){
		try{
		sb.dom.find("#contributors").append(tmpl("jstemplate-member-item", value));
		}catch(e){
			alert(e);	
		}		
	}
	function _parseCommunityInfoSubscriber(key, value){
		try{
		sb.dom.find("#subscribers").append(tmpl("jstemplate-member-item", value));
		}catch(e){			
			alert(e);	
		}			
	}
	function _setToggleEvent(e){
		sb.dom.find(this).find('.memberPages').slideToggle();	
	}
	
	function _setFocusEvent(e){
		sb.dom.find(this).find('.memberPages').slideUp();
	}
	function _setTapEvent(e){
		sb.dom.find(this).bind('click', _setToggleEvent);
		sb.dom.find(this).focusout(_setFocusEvent);
	}
	
	function _communityMembershipInfo(data){
		
		if(data.status == 'SUCCESS'){
			sb.dom.find("#foundingMembers").html("");
			sb.utilities.each(data.ownerManagerSummaries, _parseCommunityInfoOwner);
			sb.dom.find("#contributors").html("");			
			sb.utilities.each(data.contributorSummaries, _parseCommunityInfoContributor);
			sb.dom.find("#subscribers").html("");			
			sb.utilities.each(data.subscriberSummaries, _parseCommunityInfoSubscriber);
			sb.dom.find('.communityMemberDiv').find('a').each(_setAnchorClickEvent);
		}
	}
	
	function _communityMembershipFailure(request, errorMessage, errorObj){
		alert('_communityMembershipFailure ' + JSON.stringify(request));
	}

	function _enableGrid(){
			sb.dom.find(this).masonry({
				itemSelector: '.grid-item',
				percentPosition: true,
				columnWidth: 250
			});	
	}
	function updateFooterMessage(msg){
		document.getElementById("message1").innerHTML = msg;
	}
	
	function _loadAppTemplates(){
		sb.dom.find('body').append(sb.dom.find(this));
	}
	
	function _triggerMainPageRequest(){
	
			updateFooterMessage("Proceeding after check login status");
			var snippetUrl = null;
			var data = null;
			snippetUrl = relPathIn+"appView?mediaType=json";
			if(sb.utilities.isUserLoggedIn()){
				//Core.publish('startUserLogo', null);				
				var userData = sb.utilities.getUserInfo();				
				data = {username: userData.username, appname: appname, streamSize: streamSize};
			}else{
			   data = {appname: appname, streamSize: streamSize};				
			}
			appendFooterMessage("Getting data stream");
			sb.utilities.postV2(snippetUrl, data, _loadMainPage, _reloadAppPage);
	}
	
	function _gameLoadStart(event){
	
	}
	function _gameClickEvent(e){
		try{
		e.preventDefault();
		var url = sb.dom.find(this).attr('href');
		var gameRef = null
		if(device.platform == 'Android'){
			gameRef = cordova.InAppBrowser.open(url, '_self', 'location=no');
		}else{
			gameRef = cordova.InAppBrowser.open(url, '_system', 'location=no');
		}
		gameRef.addEventListener('loadstart', function(event){
			 if (event.url.match("close")) {
				 gameRef.close();
				 gameRef = null;
			 }	
			 if (event.url.match("shareMyScore")) {
				 gameRef.close();
				 gameRef = null;
				 var gameDetails = event.url.split("?")[1];
				 var gameAttributes = gameDetails.split("&");
				 var score = gameAttributes[0].split("=")[1];
				 var game = gameAttributes[1].split("=")[1];
				 if(sb.utilities.isUserLoggedIn()){
					 Core.publish('shareScore', {score: score, game: game});
				 }else{
					alert("Please login to share score with " + input.appname);	 
				}
			 }			 
		});
		}catch(e){
			alert(e);	
		}
	}
	
	function _setGameClickEvent(){
		sb.dom.find(this).click(_gameClickEvent);		
	}
	function _loadAppPage(appPage){
		   if(appPage != null){	
			   
   			   try{
				if(sb.dom.find("meta[name='_csrf']").length > 0){
					sb.dom.find("meta[name='_csrf']").remove();
	    			sb.dom.find("meta[name='_csrf_header']").remove();
					Materialize.toast('a) Establishing connection with Palkar Server ', 2000);
				}
 			    sb.dom.find('#containerDiv').find("#mainContainer").find("#storiesDiv").html(appPage + "Device ID " + device.uuid);
				var token = sb.dom.find("meta[name='_csrf']").attr("content");
				var header = sb.dom.find("meta[name='_csrf_header']").attr("content");
			
				var tokenHtml =  '<meta name="_csrf" content="'+token+'"/>';
				var headerHtml =  '<meta name="_csrf_header" content="'+header+'"/>';

				sb.dom.find('#message1').html("Received App Page " + token);
				sb.dom.find('#containerDiv').find("#mainContainer").find("#storiesDiv").find('script').each(_loadAppTemplates);
				sb.dom.find('head').prepend(tokenHtml);
				sb.dom.find('head').prepend(headerHtml);
				
				sb.dom.find('#gameContainer').html(sb.dom.find('#template-games').html());
				sb.dom.find('#gameContainer').find('a').each(_setGameClickEvent);
				sb.utilities.getUserStream();
				
					if(sb.utilities.isUserLoggedIn()){
						_triggerMainPageRequest();
						appendFooterMessage("User Info Not Null");						
					}else{
						appendFooterMessage("User Info Null");
						setTimeout(function(){_triggerMainPageRequest()}, 2000);
					}
			   }catch(error){
					alert('error while logging in ' + error);   
				}
   
		   }else{
			   sb.dom.find('#message1').html("There was a problem loading the Page. Please try again after some time.");
			}
	}
	function _errorStartController(request, errorMessage, errorObj){
		alert('There was a problem loading your profile. Please restart App to fix it.');
		document.getElementById("message1").innerHTML = JSON.stringify(request) + " " + JSON.stringify(errorObj);
	}
	
	function _leftPanelButtonClickEvent(e){
		if(sb.dom.find('.subContainer').length > 0){
			sb.dom.find('#leftPanel').panel({disabled: true});
			_containerCloseButtonClicked(e);
		}else{
			sb.dom.find('#leftPanel').panel({disabled: false});
		}
	}
		
	function _reloadAppPage(request, errorObj, errorMessage){
		if(request.status == '401'){
			alert("Your Login has expired.");
			document.getElementById("message1").innerHTML = "Your Login has expired.";
			sb.utilities.setUserInfo('guest', null, null, null);
		}
		try{
			document.getElementById("message1").innerHTML = "Requesting new CSRF Token " + JSON.stringify(request);
			if(sb.dom.find('meta[name=_csrf]').length > 0){
			sb.dom.find('meta[name=_csrf]').remove();
			sb.dom.find('meta[name=_csrf_header]').remove();		
			Materialize.toast('Establishing connection with Host ', 2000);
			}
			var appPageUrl = relPathIn + "appPage/"+appname+"/"+input.appVersion+"/"+device.platform+"/"+input.appmaintitle+"/"+input.appextendedtitle+"?mediaType=text";
			sb.utilities.appGet(appPageUrl,_loadAppPage,_errorStartController);
		}catch(e){
				alert(e);	
		}
	}
	
	function _socialShareSuccess(result){
		console.log("Story Published To Social Media");	
	}

	function _socialShareError(msg){
		alert(msg);	
	}
	function _inviteFriendsToAppSocial(e){
		e.preventDefault();
		try{
			sb.dom.find('#loading-modal').modal('open');
						var options = {
							url: input.appleAppStoreUrl,
							chooserTitle: "Invite Friends To " + input.appname
						};
							options.message = "Join Palkar App today and connect with over 1 million Sourashtrians world wide.. \n\n Apple iPhone/iPod/iPad " + input.appleAppStoreUrl + "\n\n Android Smart Phone " +  input.androidAppStoreUrl;
							options.subject = "Hi, join Palkar App";

						window.plugins.socialsharing.shareWithOptions(options, _socialShareSuccess, _socialShareError);		
						options = null;
			sb.dom.find('#loading-modal').modal('close');
		}catch(e){
			alert(e);	
		}
	}
	
	
	function _startControllerV2(){
		try{
			var screenHeight = sb.dom.find(window).height();
			sb.dom.find('.appBody').css("height", screenHeight + " px");
			document.getElementById("message1").innerHTML = "Loading "+appname+"..";
			var appPageUrl = relPathIn + "appPage/"+appname+"/"+input.appVersion+"/"+device.platform+"/"+input.appmaintitle+"/"+input.appextendedtitle+"?mediaType=text";
			sb.dom.find('#refreshPanel').on('click', _refreshButtonClick);
			sb.utilities.appGet(appPageUrl,_loadAppPage,_errorStartController);
			console.log('snippet : 2' + appPageUrl);
			sb.dom.find('.appHeader').find('#containerBackButton').on('click', _containerBackButtonClickedV2);
			sb.dom.find('.appHeader').find('#palpostr-url').on('click', _leftPanelButtonClickEvent);
			sb.dom.find('#rightPanel').removeClass('nd');
			sb.dom.find('#leftPanel').removeClass('nd');
			sb.dom.find('#mainPage').page({
				domCache: true							  
			});
			sb.dom.find('.collapsible').collapsible();
			sb.dom.find('.inviteFriendsSocial').click(_inviteFriendsToAppSocial);
		 $('.modal').modal({
			  dismissible: true, // Modal can be dismissed by clicking outside of the modal
			  opacity: .5, // Opacity of modal background
			  inDuration: 300, // Transition in duration
			  outDuration: 200, // Transition out duration
			  startingTop: '4%', // Starting top style attribute
			  endingTop: '10%', // Ending top style attribute
			  ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
				//alert("Modal Ready");
				console.log(modal, trigger);
			  },
			  complete: function() { 
			  	//alert('Closed'); 
			  } // Callback for Modal close
			}
		  );			
		}catch(error){
			alert(error);	
		}
		
	}
	
	function _refreshButtonClick(e){
			var snippetUrl = relPathIn+"appView?mediaType=json";
			var data = {appname: appname, streamSize: streamSize};
			sb.dom.find(this).find('.fa').addClass('fa-spin');
			sb.utilities.postV2(snippetUrl, data, _processNewStream, _errorProcessNewStream);
	}
	 function _initializePicturePresentation(){
		 try{
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
	   				currentNavBtn.css('background-color','#ffcc33');
	   				prevNavBtn = currentNavBtn;   				
	   			},
	   			transitionEnd: function(index, containerHandle){
	   				if(prevNavBtn != null){
	   					prevNavBtn.css('background-color','inherit');
	   	   				scrollListContainer.scrollLeft(prevNavBtn.position().left);
	   				}
	   				currentNavBtn = sb.dom.find('#scrollBar').find('#'+index);
	   				currentNavBtn.css('background-color','#ffcc33');
	   				prevNavBtn = currentNavBtn;

	   			}
	   		});
		 }catch(err){
			console.log(err);	 
		 }
	   }
	
	   function confirmExit(e){
		   console.log('confirn exit ' + storyEditHappening + " " + documentEditHappening);
		   if(storyEditHappening || documentEditHappening){
			   return sb.dom.find("#DocumentDialog-ConfirmNavigation").html();
		   }
	   }
	   
	   function _storyEditStatusUpdateMessageReceived(message){
		   console.log('story edit status ' + message.storyEditHappening);
		   storyEditHappening = message.storyEditHappening;
	   }
	   
	   function _documentEditStatusUpdateMessageReceived(message){
		   console.log('document edit status ' + message.documentEditHappening);
		   documentEditHappening = message.documentEditHappening;
	   }
	   
	function appendFooterMessage(msg){
		sb.dom.find("#message1").append("<br>"+msg);
	}

	function _pageSnippetAddedReceived(message){
   		//defaultClickReactionsDivList = sb.dom.find('.storyItemFooter');
   		//_loadPageReactionList(defaultClickReactionsDivList);
		console.log("Click Reactions Controller Snippet Added Recieved : MEssage ID " + JSON.stringify(message));
   		sb.dom.find(message.snippetId).find('.storyItem').each(
   				function(){
		   		   sb.dom.find(this).find('a').each(_setAnchorClickEvent);
				}
   		);
	}
	
	function _errorProcessNewStream(msg){
		appendFooterMessage(msg);
	}
	
	function _processNewStream(newStreamResponse){
		   if(newStreamResponse != null && newStreamResponse.antahRequestStatus == "SUCCESS"){
				_loadMainPage(newStreamResponse);
				sb.dom.find('#refreshPanel').prop('disabled', true);
				sb.dom.find('#refreshPanel').find('.fa').removeClass('fa-spin');
				sb.dom.find('#refreshPanel').hide();
		   }else{
			   _errorProcessNewStream('There was a problem getting message ' + antahResponseMessage);
			}
	}
	function _streamUpdateReceived(message){
		if(!appOnPause){
		 if(sb.dom.find('#refreshPanel').is(":disabled")){				
			 sb.dom.find('#refreshPanel').prop('disabled', false);
			 sb.dom.find('#refreshPanel').show();
		  }
		}else{
			var snippetUrl = relPathIn+"appView?mediaType=json";
			var data = {appname: appname, streamSize: streamSize};
			sb.utilities.postV2(snippetUrl, data, _processNewStream, _errorProcessNewStream);			
		}
	}
	
	function disconnectAlertDismissed(){
		;
	}
	
	function _stompClientDisconnectMessageReceived(message){
		//navigator.notification.alert('We are currently upgrading the ' + message.pageHandle + ' server. Your App may be slow or unresponsive. Please Restart the App in a few minutes to restore full set of features. See you soon!', disconnectAlertDismissed, message.pageHandle, 'Ok, Thanks');
	}
	
	function exitAppConfirm(button){
		if(button == 2){
			sb.dom.find('#saving-session-modal').modal('open');
			sb.utilities.setUserStreamToDevice();
			if(navigator.app){
				sb.utilities.setUserInfo(sb.utilities.getUserInfo().username, sb.utilities.getUserInfo().authorization, sb.utilities.getUserInfo().authorizationType, sb.utilities.getUserInfo().userDetails);	
				navigator.app.exitApp();
			}else if(navigator.device){
				sb.utilities.setUserInfo(sb.utilities.getUserInfo().username, sb.utilities.getUserInfo().authorization, sb.utilities.getUserInfo().authorizationType, sb.utilities.getUserInfo().userDetails);	
				navigator.device.exitApp();
			}else{
				sb.utilities.setUserInfo(sb.utilities.getUserInfo().username, sb.utilities.getUserInfo().authorization, sb.utilities.getUserInfo().authorizationType, sb.utilities.getUserInfo().userDetails);	
				navigator.notification.alert('Please close the App by pressing the home button on your Device', disconnectAlertDismissed, input.appname, 'Ok, Thanks');		
			}
		}else{
			logoutAttempt = logoutAttempt + 1;	
		}
	}
	
	function _deviceBackButtonClicked(e){
		var exitApp = false;
	
		if(sb.dom.find('.subContainer').length > 0){
		   e.preventDefault();
		   closeOverlay();		
		   
		   sb.dom.find('.containers').find('.subContainer').first().slideUp();
		   sb.dom.find('.containers').find('.subContainer').first().remove();
		   if(sb.dom.find('.containers').find('.subContainer').length == 0){
				sb.dom.find('#containerBackButton').hide();
				//sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');
		   }
		   if(sb.dom.find('.containers').find('.subContainer').length > 0){
			   var nextContainer = sb.dom.find('.subContainer').first();
			   nextContainer.show();
		   }			   
	   }else{
			exitApp = true;   
		}
		if(sb.dom.find('.placeHolderContainer').length > 0){
		   e.preventDefault();
		   closeOverlay();		
		   var firstSubContainer = sb.dom.find('.placeHolderContainer').first();
		   firstSubContainer.slideUp();
		   firstSubContainer.remove();
		   var nextContainer = sb.dom.find('.container').first();		   
		   nextContainer.show();
		}

		if(exitApp){
			try{					
			navigator.notification.confirm('Close the App?', exitAppConfirm, input.appname, 'Keep Browsing, Close');
			}catch(err){
				alert(err);	
			}
		}
		
	}

	function onPause(e){
		sb.utilities.setUserInfo(sb.utilities.getUserInfo().username, sb.utilities.getUserInfo().authorization, sb.utilities.getUserInfo().authorizationType, sb.utilities.getUserInfo().userDetails);	
		sb.utilities.setUserStreamToDevice();
		appOnPause = true;
		
	}
	
	function onResume(e) {
		//e.preventDefault();
		appOnPause = false;
		Core.publish('applicationResume', null);		
	}

	function _userLoginEventReceived(message){
		try{
				sb.dom.find("#storiesDivTrailer").find("#showMore").hide();
				sb.dom.find('#containerDiv').find("#mainContainer").find("#storiesDiv").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');		   
				var userData = sb.utilities.getUserInfo();
				var snippetUrl = null;
				var data = null;
				snippetUrl = relPathIn+"appView?mediaType=json";
				data = {username: userData.username, appname: appname, streamSize: streamSize};			
				sb.utilities.postV2(snippetUrl, data, _loadMainPage, _reloadAppPage);	
		}catch(err){
			alert(err);	
		}
	}
	
	function _unAuthorizedFunctionalityResponse(button){
		if(button == 1){
			try{
			sb.dom.find("#loginRegisterButtonHidden").click();
			}catch(e){alert(e);}
		}else{
			;	
		}		
	}
	function _unAuthorizedFunctionality(message){
		try{
			var unAuthHtml = sb.dom.find("#jstemplate-unAuthorizedAccessDialog").html();
			var unAuthHtmlDom = sb.dom.wrap(unAuthHtml);
			_snippetResponseReceived(unAuthHtml);
		}catch(e){
			alert(e);	
		}
	}
	
	function _setCurrentTab(currentTab){
		alert(currentTab);
	}
	function _setEffects(){
		sb.dom.find('.ui-btn').addClass("waves-effect");	
			sb.dom.find('#containerDiv').find('ul.tabs').tabs();
			sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');			
        try{
			StatusBar.show();
			StatusBar.overlaysWebView(false);
			StatusBar.styleDefault(); 
		}catch(e){
			console.log(e);	
		}
	}
	
	function _notificationItemClickReceived(message){
		try{
			sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');
			var notificationItemId = message.id.split('-')[1];
			var notificationStoryItem = sb.dom.find("#storyItem-"+notificationItemId);
			//sb.dom.find('#containerDiv').animate({scrollTop: sb.dom.find(notificationStoryItem).offset().top+100}, 200);
			if(sb.dom.find(notificationStoryItem).length > 0){
				sb.dom.find('#containerDiv').animate({scrollTop: 0}, 0);
				sb.dom.find('#mainContainer').animate({scrollTop: 0}, 0);
				sb.dom.find('#mainPage').animate({scrollTop: 0}, 0);
				sb.dom.find('#mainContainer').animate({scrollTop: sb.dom.find(notificationStoryItem).offset().top-100}, 200);
				sb.dom.find('.storyItem').removeClass('z-depth-3');
				sb.dom.find(notificationStoryItem).addClass('z-depth-3');
			}
			//sb.dom.find('#mainPage').animate({scrollTop: sb.dom.find(notificationStoryItem).offset().top}+100, 200);
		}catch(e){
			alert(e);	
		}
	}
	
	function _restartApp(data){
		sb.dom.find('#containerDiv').find('ul.tabs').tabs();
		sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');			
		//storyItemControllerPublish = true;
		userLogoStarted = false;
		try{
			//document.getElementById("message1").innerHTML = "Requesting new CSRF Token " + JSON.stringify(request);
			if(sb.dom.find('meta[name=_csrf]').length > 0){
			sb.dom.find('meta[name=_csrf]').remove();
			sb.dom.find('meta[name=_csrf_header]').remove();		
			Materialize.toast('Connecting with Host.', 2000);
			//alert('Reestablishing connection with Host ');
			}
			var appPageUrl = relPathIn + "appPage/"+appname+"/"+input.appVersion+"/"+device.platform+"/"+input.appmaintitle+"/"+input.appextendedtitle+"?mediaType=text";
			sb.utilities.appGet(appPageUrl,_loadAppPage,_errorStartController);
		}catch(e){
				alert(e);
		}		
	}
	
	function _userStreamLoadedMessageReceived(data){
		
		var userStream = sb.utilities.getUserStream();
		//alert('_userStreamLoadedMessageReceived ' + userStream.storyItemList.length);
		sb.dom.find('#containerDiv').find("#mainContainer").find("#storiesDiv").html("<div class='chip amber lighten-1 cb'>Loading. Please wait.</div>");
		try{
				for(var i =0; i<userStream.storyItemList.length;i++){
					try{
						addStoryItemToView(userStream.storyItemList[i]);
					}catch(e){
						updateFooterMessage('problem loading story ' + userStream.storyItemList[i].storyDocumentPageId + " " + e);
					}
				}
		}catch(e){
			alert(e);
		}
		
	}
	
   return{
	   init:function() {
       	try{
			console.log('starting page view controller..');
       		Core.subscribe('storyEditStatusUpdate', _storyEditStatusUpdateMessageReceived);
       		Core.subscribe('documentEditStatusUpdate', _documentEditStatusUpdateMessageReceived);
			Core.subscribe('newStoryAdded', _newStoryAddedToView);
			Core.subscribe('pageSnippetAdded', _pageSnippetAddedReceived);
			Core.subscribe('streamUpdateReceived', _streamUpdateReceived);
			Core.subscribe('userLoginEvent', _userLoginEventReceived);	
			Core.subscribe('unAuthorizedFunctionality', _unAuthorizedFunctionality);
			Core.subscribe('notificationItemClick', _notificationItemClickReceived);
			Core.subscribe('restartApp', _restartApp);
			Core.subscribe('userStreamLoaded', _userStreamLoadedMessageReceived);
			document.addEventListener("resume", onResume, false);
			document.addEventListener("pause", onPause, false);			
			document.addEventListener("backbutton", _deviceBackButtonClicked, true);
			Core.subscribe('stompClientDisconnect', _stompClientDisconnectMessageReceived);
       		window.onbeforeunload = confirmExit;
			_startControllerV2();
			_setEffects();
       	}catch(err){
			updateFooterMessage('Problem starting App..'+err);
       	}
   		
       },
   	  destroyModule:  function() {
   			sb.utilities.trace("Module destroyed");
   		}	   
     }
    };