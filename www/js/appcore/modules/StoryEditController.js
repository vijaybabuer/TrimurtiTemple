var storyEditController = function(sb, input){
	var htmlBody = null, relPathIn=input.relPath, cancelButton=null, addPostForm=null, submitButtonForm=null, documentidBox=null, picturesDivId=null, tinyMceInstance=null,
	    subjectBox=null, messageBox=null, picturesDiv=null, createStoryHeaderDiv=null, albumForStoryID=null, addPicturesButton=null,  removePicturesButton=null, newMessageButton=null, editStoryDocumentPageId=null;
	    addPostTextAreaHandle=input.addPostTextAreaHandle, wysiwygEditorStatus=false, httpMethod="POST", thumnailhtmltemplate = null, albumcontainer = null, picturecontainer = null, storyItemTemplate = null, storiesDiv= input.storiesDiv,
	    thisIsStoryPage = input.thisIsStoryPage, storyJSTemplateName = input.storyJSTemplateName, storyEditorCloseButton = null, allowPublicTextReactionsButton = null, allowPrivateTextReactionsButton = null, allowClickReactionsButton = null, allMessagesButtonSet = null,
	    tinyMCEObject = null, storyContent = null, alertBeforeNavigatingAway = false;
   function _removePicturesClick(){
	   sb.utilities.trace('Pictures remove clicked..');
   }
   
   function _messageBoxActive(){
   		sb.utilities.trace('Message box is active..');
   }
   
   function _messageBoxInActive(){
   		sb.utilities.trace('Message box is inactive..');
   }
   
   function _pictureAddDone(targetInfo){
   		sb.utilities.trace('Picture add done..' + albumForStoryID);
   }
   
   function _hideUserLogoPanel(){
	   userLogoPanelNode.slideUp();
	   userLogoNode.removeClass("expandView");	   
   }

   function _notifyToUserLogo(message){
	  sb.utilities.trace(message);  
   }
   
   function _showUserLogoOptionsPanel(){
	   
   }
   
   function _startPictureUploadController(){
	   if(albumForStoryID == null || albumForStoryID ==  0 ){
		   Core.publish('addAlbum',{documenttype: 'PVTSTYPIC', documentname: subjectBox.val()});
	   }else{
		   Core.publish('manageStoryPictures', {documentid: albumForStoryID, documenttype: 'PVTSTYPIC', documentname: subjectBox.val()});
	   }
	   removePicturesButton.show();
   }
   
   function _receiveAlbumUpdatePublish(publishData){
	   if(publishData.documenttype == "PVTSTYPIC"){
		   if(publishData.actioncode == "ADD"){
			   albumForStoryID=publishData.documentid; 			   
			   picturesDivId="album-"+publishData.documentid+"-"+publishData.documenttype;
			   picturesDiv.attr("id",picturesDivId);
			   picturesDiv.show();
			   removePicturesButton.fadeIn();
		   }else if(publishData.actioncode == "UPDATE"){
			   //alert("New photos added for this story..");
		   }
	   }
   }
   function _showNewMessageForm(){
	  	 sb.dom.find('#containerDiv').animate({scrollTop: 0}, 200);
	  	 sb.dom.find('#mainContainer').animate({scrollTop: 0}, 200);
		 sb.dom.find('#mainPage').animate({scrollTop: 0}, 200);
		 sb.dom.find('#containerDiv').find('.tabs').tabs('select_tab', 'mainContainer');
		 
	   if(sb.utilities.isUserLoggedIn()){
	       storyContent = sb.dom.find("#storyAddController-DefaultContent").html();
		   try{
		   //_initializeWYSIWYGEditor();		   
		   }catch(err){
			   alert("There was a problem loading editor. Please try again later."+err);
		   }	   
	   htmlBody.fadeIn();

	   subjectBox.show();
	   messageBox.show();
	   messageBox.html(sb.dom.find('#template-storytemplate-Default').html());
	   try{
	   messageBox.tinymce().remove();
	   }catch(e){
		   // ignore error.
	   }
	   httpMethod="POST";	
	   sb.dom.find(".addPostTextArea").attr('contenteditable', 'true');
	   sb.dom.find(".mce-content-body").append(sb.dom.find("#storyAddController-MessageContent").html());
	   //sb.dom.find('#storyPostContainer').find('#unAuthorizedAccessDialog').hide();
	   }
   }
   
   function _showEditMessageForm(storyResponse){
	   try{
	  	 sb.dom.find('#containerDiv').animate({scrollTop: 0}, 200);
	  	 sb.dom.find('#mainContainer').animate({scrollTop: 0}, 200);
		 sb.dom.find('#mainPage').animate({scrollTop: 0}, 200);
		 sb.dom.find('#containerDiv').find('.tabs').tabs('select_tab', 'mainContainer');		   
	   storyContent = storyResponse.storyitem.story;
	   if(storyResponse.txnStatus == "SUCCESS"){
			   try{
				   
			   _initializeWYSIWYGEditor();		   
			   }catch(err){
				  alert("There was a problem loading editor. Please try again later.");
			   }
		   //messageBox.html(storyResponse.storyitem.story);
		   albumForStoryID=storyResponse.storyitem.storyPictureAlbumId;
		   editStoryDocumentPageId = storyResponse.storyitem.storyDocumentPageId;
		   subjectBox.val(storyResponse.storyitem.storyTitle);
		   
		   var allowCommentsButton = htmlBody.find("#allReactionsButtonSet").find("#allowComments");
		   allowCommentsButton.prop('checked', storyResponse.storyitem.allowPublicTextReactions);
		   
		   var allowRepliesButton = htmlBody.find("#allReactionsButtonSet").find("#allowReplies");
		   allowRepliesButton.prop('checked', storyResponse.storyitem.allowPrivateTextReactions);
		   
		   var allowClickResponseButton = htmlBody.find("#allReactionsButtonSet").find("#allowHilights");
		   allowClickResponseButton.prop('checked', storyResponse.storyitem.allowClickReactions);

			try{
			   allowCommentsButton.button("refresh");
			   allowRepliesButton.button("refresh");
			   allowClickResponseButton.button("refresh");
			}catch(error){
				console.log(error);
			}

			try{
				if(storyResponse.storyitem.storyPictures){
				   albumcontainer.attr("id", "album-"+storyResponse.storyitem.storyPictureAlbumId+"-"+storyResponse.storyitem.storyPictureAlbumTypeCd);
				   picturesDiv.show();
				   removePicturesButton.fadeIn();
					albumcontainer.prepend(sb.dom.find('#template-uploadController').html());
					picturecontainer = albumcontainer.find('.albumpictures');
				   _paintAlbumPictures(storyResponse.storyitem.storyPictures);
				}
			}catch(error){
				alert(error);
			}

		   htmlBody.fadeIn();
		   subjectBox.show();
		   messageBox.show();
		   httpMethod="PUT";
		   _closeOverlayPanel();
		   sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'storyPostContainer');
	   }else{
		   Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
	   }
	   }catch(err){
			alert(err);   
		}
   }
   
   function _initializeWYSIWYGEditorEvent(e){
	   storyContent = messageBox.html();
	 	_initializeWYSIWYGEditor();  
	 }
	function _paintAlbumPictures(mediaItemList){
		var	thumnailhtml = null;	
		picturecontainer.html("");
		for(var i=0; i<mediaItemList.length; i++){
			thumnailhtml=thumnailhtmltemplate.replace("albumpicid",mediaItemList[i].documentPageId);
			thumnailhtml=thumnailhtml.replace("albumpicid",mediaItemList[i].documentPageId);	
			thumnailhtml=thumnailhtml.replace("albumpicid",mediaItemList[i].documentPageId);
			thumnailhtml=thumnailhtml.replace("pictureurl",relPathIn+"photo/"+mediaItemList[i].documentPageId);
			picturecontainer.append(thumnailhtml);
		}
		albumcontainer.fadeIn();
		removePicturesButton.fadeIn();
	}
	
   function _showAddPhotosForm(){
	   subjectBox.val(sb.dom.find("#storyAddController-AlbumTitle").html());
	   subjectBox.val(sb.dom.find("#storyAddController-AlbumTitle").html());
	   subjectBox.val(sb.dom.find("#storyAddController-AlbumTitle").html());
	   subjectBox.val(sb.dom.find("#storyAddController-AlbumTitle").html());
	   subjectBox.show();
	   messageBox.html("");
	   messageBox.hide();
	   
	   htmlBody.fadeIn();
	   

	   
	   addPicturesButton.click();
	   httpMethod="POST";
   }
   
   function _removePicturesButtonClick(e){
	   e.preventDefault();
	   picturecontainer.addClass("ht");
	   albumForStoryID="";
	   Core.publish("displayMessage", {message: "Pictures will be removed from story. Please click Post Story button after editing the story to save.", messageType: "success"});
   }
   
   
   function _hideForm(){
	   subjectBox.val("");
	   messageBox.html("");
	   albumForStoryID=null;
	   editStoryDocumentPageId=null;
	   picturecontainer.html("");
	   enableFormSubmitting(true);
	   htmlBody.fadeOut();
	   alertBeforeNavigatingAway = false;
	   albumcontainer.attr("id","");	   
	   Core.publish('storyEditStatusUpdate', {storyEditHappening: alertBeforeNavigatingAway});
	   sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');
	   try{
		   messageBox.tinymce().remove();
	   }catch(e){
			//ignore   
	   }
   }
   
   function sendMessage(event){
	   try{
	   event.preventDefault();
	   disableFormSubmitting();
	   var inputData = addPostForm.serialize();
	   documentidBox = sb.dom.find('#createStoryDocument');
	   
	   var documentId = documentidBox.val();
	   var allowPublicTextReactions = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowComments').is(':checked');
	   var allowPrivateTextReactions = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowReplies').is(':checked');
	   var allowClickReactions = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowHilights').is(':checked');
	   sb.dom.find("#transactionStatus").html("");
	   if(documentId == "" || documentId == null || documentId == "null" || documentId == "undefined"){
		   Core.publish("displayMessage",{message: "Please choose the document to post the story to." + documentId, messageType: "alert"});
	   }else{
		   if(httpMethod=="POST"){
			   var detailsMessage = tinymce.html.Entities.encodeNumeric(messageBox.text());
														 
			   sb.utilities.postV2("shrmsg.pvt?mediaType=json",{title: subjectBox.val(), details: detailsMessage, documentId: documentidBox.val(), albumId: albumForStoryID, allowPublicTextReactions: allowPublicTextReactions, allowPrivateTextReactions: allowPrivateTextReactions, allowClickReactions: allowClickReactions}, sendMessageSuccess);
		   }else if(httpMethod=="PUT"){
			   sb.utilities.put("shrmsg.pvt?mediaType=json",{title: subjectBox.val(), details: detailsMessage, documentId: "", albumId: albumForStoryID, documentpageid: editStoryDocumentPageId, allowPublicTextReactions: allowPublicTextReactions, allowPrivateTextReactions: allowPrivateTextReactions, allowClickReactions: allowClickReactions},updateMessageSuccess);
		   }
		   alertBeforeNavigatingAway = false;
		   Core.publish('storyEditStatusUpdate', {storyEditHappening: alertBeforeNavigatingAway});
	   }

	   subjectBox.val("");
	   messageBox.html("");
	   albumcontainer.attr("id","");
	   albumForStoryID=null;
	   _hideForm();
	   }catch(err){
		   alert("Error in storyEditController: " + err);
	   }
   }
   
   function disableFormSubmitting(){
	   sb.dom.disable(submitButtonForm);
	   sb.dom.disable(subjectBox);
	   sb.dom.disable(messageBox);
	   sb.dom.disable(addPicturesButton);
	   sb.dom.disable(removePicturesButton);
	   sb.dom.find(removePicturesButton).hide();
	   sb.dom.disable(cancelButton);
   }
   
   function enableFormSubmitting(setDefaultContent){
	   sb.dom.enable(submitButtonForm);
	   sb.dom.enable(subjectBox);
	   //sb.dom.enable(messageBox);
	   sb.dom.enable(addPicturesButton);
	   sb.dom.enable(removePicturesButton);
	   sb.dom.find(htmlBody).find('.PVTSTYPIC').find('#uploadControllerPane').remove();
	   sb.dom.find(htmlBody).find('.PVTSTYPIC').attr('id', '');
		sb.dom.find("#createStory").find("#storyMedia").find('#myComp').hide();
		sb.dom.find("#createStory").find("#storyMedia").find('#webCam').hide();	   
	   sb.dom.enable(cancelButton);
	   subjectBox.removeClass("ab");
	   sb.dom.find(".addPostTextArea").attr('contenteditable', 'true');
	   try{
	   if(tinyMceInstance != null && setDefaultContent){
		   tinyMceInstance.setContent(sb.dom.find("#storyAddController-DefaultContent").html());		   
	   }
	   }catch(e){
			console.log('Ignore Error :- ' + e);   
		}
   }
   
   function refreshForm(data){
	   //sb.dom.find(htmlBody).fadeOut();
	   enableFormSubmitting(true);
	   albumForStoryID=null;
	   sb.dom.find(htmlBody).find('.PVTSTYPIC').find(".albumpictures").html("");
	   
	   if(data.antahRequestStatus=="SUCCESS"){
		   var storyItem = data.antahRestfulTxnResponse.storyitem;
		   var storyItemDocumentPageId = storyItem.storyDocumentPageId;
		   
		   if(thisIsStoryPage){
			   sb.utilities.pageReload();   
		   }else{
			   var storyItemNode = sb.dom.find("#storyItem-"+storyItemDocumentPageId);
			   if(storyItemNode){
				   sb.dom.find(storyItemNode).remove();
				   addStoryItemToView(storyItem);
			   }else{
				   addStoryItemToView(storyItem);
			   }		   
		   }
	   }

	   try{
		   messageBox.tinymce().remove();
	   }catch(e){
		 console.log('Ignor Error :- ' + e);   
	   }
	   
   }
   
   function _storyAddPublishedToServer(data){
	   console.log(JSON.stringify(data));
   }
   
   function addStoryItemToView(storyItem){
	   
	   try{
	   var storyItemHtml = tmpl(storyJSTemplateName, storyItem);
	   sb.dom.find(storiesDiv).prepend(sb.utilities.htmlDecode(storyItemHtml));
	   Core.publish("newStoryAdded", {storyItemDivId: "#storyItem-"+storyItem.storyDocumentPageId});
	   }catch(e){
			alert(e);   
		}
   }
   
   function sendMessageSuccess(data){
	   if(data.antahRequestStatus=="SUCCESS"){
		   refreshForm(data);	   
		   Materialize.toast('Thank you for Posting. Message has been posted!', 2000);
		   
	   }else{
		   //sb.dom.find(htmlBody).fadeOut();
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		   refreshForm(data)		   
	   }
   }
   
   function updateMessageSuccess(data){
	   if(data.antahRequestStatus=="SUCCESS"){
		   refreshForm(data);
		   sb.dom.find("#contentCreate").find("#showMainPageButton").click();
		   sb.dom.find('#containerDiv').find('ul.tabs').tabs('select_tab', 'mainContainer');
		   Materialize.toast('Posted!', 2000);		   
	   }else{
		   sb.dom.find("#contentCreate").find("#showMainPageButton").click();
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
	  
   }
   
   function sendMessageFailure(){
	   Core.publish("displayMessage",{message: "Message could not be sent, Server might be down. Please try again later.", messageType: "failure"});
   }
   
   function sendMessageDone(){
	   Core.publish("displayMessage",{message: "Message has been posted to server.", messageType: "alert"});
   }
   
   function _editStoryButtonClick(input){	
	   var storyId = input.storyId;
	   var storyDocumentType = input.storyDocumentType;
	   sb.dom.find(document).scrollTop();
	   sb.utilities.get(storyDocumentType+'/Story/'+storyId+'?mediaType=json',null,_showEditMessageForm);
   }
   function _initializeWYSIWYGEditor(){
	   try{
		   alertBeforeNavigatingAway = true;
		   sb.dom.find(".addPostTextArea").attr('contenteditable', 'false');
		   Core.publish('storyEditStatusUpdate', {storyEditHappening: alertBeforeNavigatingAway});
		   try{
		   messageBox.tinymce().remove();
		   }catch(err){
				console.log('ignore error:- ' + err);   
			}
		   messageBox.tinymce({
				  script_url: 'js/plugins/tinymce/js/tinymce/tinymce.min.js',
				  theme: "modern",
				  plugins: [
				              "emoticons template paste textcolor link fontawesome"
				          ],
				  toolbar1: "forecolor backcolor emoticons | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
				  menubar: false,
				  statusbar: false,
				  resize: "both",
				  paste_data_images: true,
				  height: 150,
				  entity_encoding : "numeric",
		   		  init_instance_callback: insertDefaultContent
			   });
		   	   messageBox.find('.mce-content-body ').html('<span>Add a story with the message</span>');
			   messageBox.find('.mce-statusbar').hide();			   
	   }catch(err){
		   console.log(err);
		   throw err;
	   }

	   wysiwygEditorStatus=true;
   }
   
   function insertDefaultContent(inst){
	   console.log('inside default content');
	   tinyMceInstance = inst;
	   tinyMceInstance.setContent(storyContent);
   }
   
   function _validateUrlResponse(data){
	   if(data.txnStatus == "SUCCESS"){
		   subjectBox.val(data.pageTitle);
		   var urlPostTemplate = tmpl("tmpl-urlPostTemplate", data);
		   var appendedHtml =  urlPostTemplate + messageBox.html();
		   storyContent = appendedHtml;
		   console.log('story content..' + storyContent);
		   messageBox.html(storyContent);
		   enableFormSubmitting(false);		   
	   }else{
		   enableFormSubmitting(false);
	   }

   }
   
   function _validateUrl(e){
	   var keycode = (e.keyCode ? e.keyCode : e.which);
	    
	   if(e.which == 32){
		   var subjectBoxValue = subjectBox.val();
		   var potentialUrl = subjectBoxValue.split(" ")[0];
		   var potentialUrlprotocol = potentialUrl.split("/")[0];

		   var hasDot = false;
		   if(potentialUrl.split(".").length > 1){
			   hasDot = true;
		   }

		   if(potentialUrlprotocol == 'http:' && hasDot){
			   if(potentialUrl.length > 7){
				   disableFormSubmitting();
				   sb.utilities.postV2("validateurl.pvt?mediaType=json",{url: potentialUrl},_validateUrlResponse);				   
			   }
		   }else if(potentialUrlprotocol == 'https:' && hasDot){
			   if(potentialUrl.length > 8){
				   disableFormSubmitting();
				   sb.utilities.postV2("validateurl.pvt?mediaType=json",{url: potentialUrl},_validateUrlResponse);				   
			   }
		   }
	   }
	   
	   if(keycode == 86){
		   var subjectBoxValue = subjectBox.val();
		   var potentialUrl = subjectBoxValue.split(" ")[0];
		   var potentialUrlprotocol = potentialUrl.split("/")[0];
		   var hasDot = false;
		   if(potentialUrl.split(".").length > 1){
			   hasDot = true;
		   }
		   if(potentialUrlprotocol == 'http:' && hasDot){
			   if(potentialUrl.length > 7){
				   disableFormSubmitting();
				   sb.utilities.postV2("validateurl.pvt?mediaType=json",{url: potentialUrl},_validateUrlResponse);				   
			   }
		   }	
		   if(potentialUrlprotocol == 'https:' && hasDot){
			   if(potentialUrl.length > 8){
				   disableFormSubmitting();
				   sb.utilities.postV2("validateurl.pvt?mediaType=json",{url: potentialUrl},_validateUrlResponse);				   
			   }
		   }
	   }
   }
   
   function _validateUrlPublish(data){	   
	   _showNewMessageForm();
	   if(data.url && data.url != "" ){
		   console.log('inside post ' + JSON.stringify(data));
		   subjectBox.val("Loading content from the URL. Please wait.");
		   sb.utilities.postV2("validateurl.pvt?mediaType=json", data , _validateUrlResponse);
	   }else{
		   console.log('inside else');
		   subjectBox.val("Please enter the URL you want to share. Ex: http:/" + "/www.example.com");
	   }
	   
   }
   
   function _addStoryToDocumentClickEvent(e){
	   try{
	   e.preventDefault();
	   _closeOverlayPanel();
	   var buttonID = sb.dom.find(this).attr('id');
	   var documentId = buttonID.split('-')[1];
	   htmlBody.find("#createStoryDocument").val(documentId);
	   htmlBody.find("#createStoryDocument").selectmenu("refresh");
	   _showNewMessageForm();
	   }catch(e){
			alert(e);   
		}
   }
   
   function _addAlbumToDocumentClickEvent(e){
	   
	   e.preventDefault();
	   _closeOverlayPanel();
	   var buttonID = sb.dom.find(this).attr('id');
	   var documentId = buttonID.split('-')[1];
	   htmlBody.find("#createStoryDocument").val(documentId);
	   htmlBody.find("#createStoryDocument").selectmenu("refresh");
	   _showAddPhotosForm();
   }

   function _newStoryMessageReceived(message){
	   _closeOverlayPanel();
	   _showNewMessageForm();

   }
   function _newAlbumMessageReceived(message){
	   _closeOverlayPanel();
	   _showAddPhotosForm();
   }
   function _pageSnippetAddedProcess(pageSnippetAddedMessage){
	   var pageSnippetElement = sb.dom.find(pageSnippetAddedMessage.snippetId);
	   sb.dom.find(pageSnippetElement).find(".addStoryToDocument").bind('click',_addStoryToDocumentClickEvent);
   	   sb.dom.find(pageSnippetElement).find(".addAlbumToDocument").bind('click',_addAlbumToDocumentClickEvent);
   }
   
   function _closeOverlayPanel(){
	   closeOverlay();
	   sb.dom.find('.subContainer').each(function(){
		  sb.dom.find(this).slideUp(); 
	   });
	   sb.dom.find('.subContainer').each(function(){
			  sb.dom.find(this).remove(); 
	   });
	   sb.dom.find('.container').first().show();
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
   
   function _userLoggedIn(message){
	 //  _showNewMessageForm();
	 newMessageButton.show();
	}
	
	function _shareScoreMessage(message){
		_showNewMessageForm();
		try{
		var messageText = "Can you beat my score of " + message.score + " at " + message.game + "?";
		var subjectText = sb.utilities.getUserInfo().userDetails.userAccount.userFullName + " shared a score";
		messageBox.html(messageText);
		subjectBox.val(subjectText);
		}catch(e){
			alert(e);	
		}
	}
   function _startController(){
				try{
       			//Module Initializing
				htmlBody = sb.dom.find(input.elemHandle);
				albumcontainer = htmlBody.find('.PVTSTYPIC');
				picturecontainer = albumcontainer.find(".albumpictures");
       			newMessageButton=sb.dom.find("#newMessageButton");
       			addPhotosButton=sb.dom.find("#addPhotosButton");
       			addPostForm=htmlBody.find("#addPostForm");
       			messageBox=htmlBody.find(addPostTextAreaHandle);
       			cancelButton=htmlBody.find("#cancel");
       			storyEditorCloseButton=htmlBody.find("#closeStoryEditor");
       			submitButtonForm=htmlBody.find("#submitButtonForm");
       			submitButtonForm.find('.label').html(sb.dom.find("#storyAddController-PostStory").html());
       			//cancelButton.find('.label').html(sb.dom.find("#storyAddController-Cancel").html());
	    		subjectBox=htmlBody.find('#subject');
	    		documentidBox=htmlBody.find('#createStoryDocument');
	    		picturesDiv=htmlBody.find('.PVTSTYPIC');
	    		createStoryHeaderDiv=htmlBody.find('#createStoryHeaderDiv');
	    		allMessagesButtonSet = htmlBody.find('#allMessagesButtonSet');
	    		addPicturesButton=htmlBody.find('#attachPictures');
	    		htmlBody.find("#validateUrl").click(_validateUrl);
	    		removePicturesButton=allMessagesButtonSet.find('#removePictures');
	    		thumnailhtmltemplate = sb.dom.find("#template-albumpicturethumbnail").html();
	    		//htmlBody.find('#allReactionsButtonSet').buttonset();
				//htmlBody.find("#allowComments").checkboxradio( "refresh" );
				//htmlBody.find("#allowReplies").checkboxradio( "refresh" );
				//htmlBody.find("#allowHilights").checkboxradio( "refresh" );

	    		allowPublicTextReactionsButton = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowComments');
	    		allowPrivateTextReactionsButton = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowReplies');
	    		allowClickReactionsButton = sb.dom.find('#createStory').find('#allReactionsButtonSet').find('#allowHilights');
	    		subjectBox.bind('keyup', _validateUrl);

       			//Event Setup
       			addPostForm.submit(sendMessage);       		
       			sb.dom.find("#newMessageButtonSmall").bind('click',_showNewMessageForm);
       			sb.dom.find("#addPhotosButtonSmall").bind('click',_showAddPhotosForm);
       			sb.dom.find(".addStoryToDocument").bind('click',_addStoryToDocumentClickEvent);
       			sb.dom.find(".addAlbumToDocument").bind('click',_addAlbumToDocumentClickEvent);
				sb.dom.find("#initializeRichTextEditor").click(_initializeWYSIWYGEditorEvent);
       			newMessageButton.bind('click',_showNewMessageForm);  
				//_showNewMessageForm();
       			
       			addPhotosButton.bind('click',_showAddPhotosForm);
       			addPhotosButton.show();
       			addPicturesButton.bind('click',_startPictureUploadController);       	
       			removePicturesButton.bind('click', _removePicturesButtonClick);
       			cancelButton.click(_hideForm);
       			storyEditorCloseButton.click(_hideForm);
       			//Subscriptions
	    		Core.subscribe('albumUpdate', _receiveAlbumUpdatePublish);
	    		Core.subscribe('editStory', _editStoryButtonClick);
	    		Core.subscribe('validateUrl', _validateUrlPublish);
	    		Core.subscribe('newMessageButtonClick', _newStoryMessageReceived);
	    		Core.subscribe('addAlbumButtonClick', _newAlbumMessageReceived);
	    		Core.subscribe('pageSnippetAdded', _pageSnippetAddedProcess);
				Core.subscribe('userLoginEvent', _userLoggedIn);
				Core.subscribe('shareScore', _shareScoreMessage);
				}catch(e){
					alert(e);	
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