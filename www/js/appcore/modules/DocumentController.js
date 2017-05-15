var DocumentController = function(sb, input){
	var htmlBody = sb.dom.find(input.elemHandle), relPathIn=input.relPath, newDocumentButton=null, documentIDEdited=null, documentTypeEdited=null, 
		termCache ={}, sharedUserNameList={}, picturesDiv=null, coverPageAlbumType=null, coverPageAlbumId=null, thumnailhtmltemplate=null,  documentTinyMceInstance = null, coverPageDefaultText = sb.dom.find("#NewSignboardDialog-CoverPage-PlaceHolder").html(),
		picturecontainer = null, picturesDivId=null, panelContainer = sb.dom.find(input.panelContainer), alertBeforeNavigatingAway = false;;
	
	
   function _signBoardTitleChangeEvent(e){
	   _signBoardTitleChange();
   }
   
   function _signBoardTitleChange(){
	   var signboardhandle = panelContainer.find("#title").val();
	   signboardhandle = signboardhandle.replace(/[^a-zA-Z0-9]/g,'');
	   panelContainer.find("#pageHandle").val(signboardhandle);
   }
   function _startNewSignboardDialog(input){
	   documentIDEdited=null; 
	   documentTypeEdited=null; 
	   termCache ={}; 
	   sharedUserNameList={};   
	   coverPageAlbumType=null;
	   coverPageAlbumId=null;
	   panelContainer.find('#userSelect').hide();

	   alertBeforeNavigatingAway = true;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   panelContainer.find("#chosenIcon").html("Icon");
	   panelContainer.find("#removeIcon").hide();
	   panelContainer.find("#title").val(sb.dom.find("#NewSignboardDialog-SignboardName").html());
	   panelContainer.find("#title").prop("placeholder" , sb.dom.find("#NewSignboardDialog-SignboardName-PlaceHolder").html());
	   panelContainer.find('#documentCoverPageChangePictureButton').show();
	   panelContainer.find('#documentCoverPageChangePictureButton').bind('click', _documentCoverPageChangePictureButtonClick);
	   panelContainer.find('#showWhenUnshared').hide();
	   panelContainer.find('#showWhenUnsharedLabel').hide();
	   
	   panelContainer.find('#pageHandle').show();
	   panelContainer.find('#allowPosts').show();
	   panelContainer.find('#allowPostsLabel').show();
	   
	   panelContainer.find('#chapterSharingPreferences').show();
	   panelContainer.find('#title').bind('keyup', _signBoardTitleChangeEvent);
	   panelContainer.find("#createDocument").click(_createNewSignboard);
	   panelContainer.find("#cancleDocumentCreation").click(_cancelButtonClick);
	
	   panelContainer.find("#createDocument").html(sb.dom.find("#SignboardDialog-CreateButton-Label").html());
	   
	   panelContainer.find('#userSearchInput').autocomplete({  
			  source: function(request, response){
				  var term = request.term;
				  if(term in termCache){
					   response(sb.utilities.map(termCache[term].contactList, function(item){
						return {
							label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
						};
					   }));	
					  return;
				  }
				  sb.utilities.get(
						  relPathIn+'searchContact/'+request.term+'-'+true+'?mediaType=json',
						  null,
						  function(contactListData){
							   termCache[term] = contactListData;
							   response(sb.utilities.map(contactListData.contactList, function(item){
								return {
									label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
								};
							   }));	
						  });
			  },
			  minLength: 2,
			  select: function(event, ui){
				  if(ui.item.value in sharedUserNameList){
					  ;
				  }else{
					  sharedUserNameList[ui.item.value] = ui.item.value;
					  _log(ui.item ?
							  tmpl(sb.dom.find("#template-contactButton").html(), ui.item) :
							  "Nothing Selected " + this.value);				  
				  }

			  },
			  open: function(){
				  sb.dom.find(this).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			  },
			  close: function(){
				  sb.dom.find(this).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			  }
		   });
	   
	   _signBoardTitleChange();
	   picturesDiv = panelContainer.find('.PVTCOVPIC');
	   picturecontainer = picturesDiv.find('.albumpictures');
	   picturecontainer.html("");
	   picturesDivId=null;
	   picturesDiv.attr("id","");
	   

		
		panelContainer.find("#documentIcon").on("change", _encodeImageFileAsURL);
		panelContainer.find("#removeIcon").on("click", _removeDocumentIcon);
		 panelContainer.show();
   }
   
   function _removeDocumentIcon(e){
	   panelContainer.find("#chosenIcon").html("Icon");
	   panelContainer.find("#removeIcon").hide();
   }

   function insertDefaultContent(inst){
	   console.log('inside default content');
	   documentTinyMceInstance = inst;
	   console.log('printing story content..' + coverPageDefaultText);
	   console.log('here 1');
	   documentTinyMceInstance.setContent(coverPageDefaultText);
   }
   
   function _log(message){   
	   var contactButton = sb.dom.wrap(message);
	   contactButton.appendTo("#tabloidSharedUsersSelected");
	   sb.dom.find("#tabloidSharedUsersSelected").scrollTop();
	   contactButton.find('.removeContact').bind('click', _removeContactButton);
	   sb.dom.find("#userSearchInput").val("");
   }
   
   function _removeContactButton(e){
	   var userid=sb.dom.find(this).parent().attr('id');
	   delete sharedUserNameList[userid];
	   sb.dom.find(this).parent().remove();
   }
   function _startNewTabloidDialog(input){
	   documentIDEdited=null; 
	   documentTypeEdited=null; 
	   termCache ={}; 
	   sharedUserNameList={};
	   alertBeforeNavigatingAway = true;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   coverPageAlbumType=null;
	   coverPageAlbumId=null;
	   //picturecontainer.html("");	   
	   panelContainer.find("#chosenIcon").html("Icon");
	   panelContainer.find("#removeIcon").hide();
	   panelContainer.find("#title").val(sb.dom.find("#NewTabloidDialog-Name").html());
	   panelContainer.find("#title").prop("placeholder" , sb.dom.find("#NewTabloidDialog-Name-PlaceHolder").html());
	   panelContainer.find("#userSearchInput").prop("placeholder", sb.dom.find("#NewTabloidDialog-UserSearchInput-Placeholder").html());
	   panelContainer.find('#userSelect').fadeIn();
	   panelContainer.find('#chapterSharingPreferences').show();
	   panelContainer.find('#documentCoverPageChangePictureButton').show();
	   panelContainer.find('#documentCoverPageChangePictureButton').bind('click', _documentCoverPageChangePictureButtonClick);
	   panelContainer.find('#showWhenUnshared').show();
	   panelContainer.find('#showWhenUnsharedLabel').show();
	   panelContainer.find('#title').bind('keyup', _signBoardTitleChangeEvent);
	   panelContainer.find('#pageHandle').hide();
	   panelContainer.find('#allowPosts').hide();
	   panelContainer.find('#allowPostsLabel').hide();
	   
	   panelContainer.find("#createDocument").click(_createNewTabloid);
	   panelContainer.find("#cancleDocumentCreation").click(_cancelButtonClick);
	   
	   panelContainer.find("#createDocument").html(sb.dom.find("#TabloidDialog-CreateButton-Label").html());
	   sharedUserNameList={
			   
	   };
	   
	   var highlightTitle = 'Highlight';
	   var showWhenUnShared = 'Y';
 
	   panelContainer.find('#highlighttitle').val(highlightTitle);
	   panelContainer.find('#showWhenUnshared').attr('checked', 'true');
	   
	   panelContainer.find('#userSearchInput').autocomplete({  
		  source: function(request, response){
			  var term = request.term;
			  if(term in termCache){
				   response(sb.utilities.map(termCache[term].contactList, function(item){
					return {
						label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
					};
				   }));	
				  return;
			  }
			  sb.utilities.get(
					  relPathIn+'searchContact/'+request.term+'-'+true+'?mediaType=json',
					  null,
					  function(contactListData){
						   termCache[term] = contactListData;
						   response(sb.utilities.map(contactListData.contactList, function(item){
							return {
								label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
							};
						   }));	
					  });
		  },
		  minLength: 2,
		  select: function(event, ui){
			  if(ui.item.value in sharedUserNameList){
				  ;
			  }else{
				  sharedUserNameList[ui.item.value] = ui.item.value;
				  _log(ui.item ?
						  tmpl(sb.dom.find("#template-contactButton").html(), ui.item) :
						  "Nothing Selected " + this.value);				  
			  }

		  },
		  open: function(){
			  sb.dom.find(this).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
		  },
		  close: function(){
			  sb.dom.find(this).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
		  }
	   });
	   
	   picturesDiv = panelContainer.find('.PVTCOVPIC');
	   picturecontainer = picturesDiv.find('.albumpictures');
	   picturecontainer.html("");
	   
	   picturesDivId=null;
	   picturesDiv.attr("id","");
		
		panelContainer.find("#documentIcon").on("change", _encodeImageFileAsURL);
		panelContainer.find("#removeIcon").on("click", _removeDocumentIcon);
		 panelContainer.show();
   }
   
   
   function _initializeWYSIWYGEditor(){
	   try{
		   console.log('here 23');
		   alertBeforeNavigatingAway = true;
		   Core.publish('storyEditStatusUpdate', {storyEditHappening: alertBeforeNavigatingAway});
		   panelContainer.find("#documentCoverPageDetails").tinymce({
				  script_url: relPathIn+'jscripts/plugins/tinymce/js/tinymce/tinymce.min.js',
				  theme: "modern",
				  plugins: [
				              "emoticons template paste textcolor link fontawesome"
				          ],
				  toolbar1: "forecolor backcolor emoticons fontawesome | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
				  menubar: false,
				  statusbar: false,
				  resize: "both",
				  height: 250,
				  width: '90%',
				  entity_encoding : "numeric",
				  content_css : [relPathIn+'css/wysiwyg.css', relPathIn+'css/font-awesome/4.4.0/css/font-awesome.min.css'],
		   		  init_instance_callback: insertDefaultContent
			   });
		   	 panelContainer.find("#documentCoverPageDetails").find('.mce-content-body ').html('<span>Add a story with the message</span>');
		   	 panelContainer.find("#documentCoverPageDetails").find('.mce-statusbar').hide();
	   }catch(err){
		   console.log(err);
		   throw err;
	   }
   }
   
   function _cancelButtonClick(e){
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   _closeDocumentEditDialog();
   }
   
   function _createNewSignboard(e){
	   var documentName = panelContainer.find("#title").val();
	   var documentCoverPageText = panelContainer.find("#documentCoverPageDetails").html();
	   var documentType="Magazine";
	   var sharedUserList = null;
	   var storyHighlightTitle = panelContainer.find('#highlighttitle').val();
	   
	   var pageHandle = panelContainer.find('#pageHandle').val();
	   var pageUrl = panelContainer.find('#pageUrl').val();
	   var pageIcon = panelContainer.find('#chosenIcon').find('img').attr('src');
	   var pageCategory = panelContainer.find('#pageTags').val();
	   var acceptPosts = panelContainer.find('#allowPosts').is(':checked');
		
		
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   if(storyHighlightTitle == "null" || storyHighlightTitle == "" || storyHighlightTitle == "undefined"){
		   storyHighlightTitle = "Highlight";
	   }
	   
	   var storyHighlightFrequency = panelContainer.find('#highlightInterval').val();
	   var shareToAllCurrentContacts = panelContainer.find('#shareToAllCurrentContacts').is(':checked');
	   if(coverPageAlbumId == null){
		   coverPageAlbumId="";
	   }
	   
	   sb.utilities.map(sharedUserNameList, function(item){
		   if(sharedUserList == null){
			   sharedUserList = item;
		   }else{
			   sharedUserList = sharedUserList + ";" + item;			   
		   }
	   });
	   
	   
		sb.utilities.postV2(relPathIn+"document.pvt?mediaType=json",{documenttype: documentType, documentname: documentName, documentCoverPageText: documentCoverPageText, stringShareUserList: sharedUserList, documentCoverPageAlbumId: coverPageAlbumId, storyHighlightTitle: storyHighlightTitle, storyHighlightFrequency: storyHighlightFrequency, addAllContactsAsSubscribers: shareToAllCurrentContacts, pageIcon: pageIcon, pageUrl: pageUrl, pageHandle: pageHandle, pageCategories: pageCategory, acceptPosts: acceptPosts}, _createSignboardResponseReceived)
		.success(function(){console.log("Document Add Request sent 123");})
		.error(function(data){
			Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
		});				   
   }
   
   function _createNewTabloid(e){
	   var documentName = panelContainer.find("#title").val();
	   var documentCoverPageText = panelContainer.find("#documentCoverPageDetails").html();
	   var documentType="Exclusive";
	   var sharedUserList = null;
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   var showWhenUnShared = panelContainer.find('#showWhenUnshared').is(':checked');
	   var showDocumentToUnsharedUsers = 'Y';
	   if(showWhenUnShared){
		   showDocumentToUnsharedUsers = 'Y';
	   }else{
		   showDocumentToUnsharedUsers = 'N';
	   }
	   
	   var pageHandle = panelContainer.find('#pageHandle').val();
	   var pageUrl = panelContainer.find('#pageUrl').val();
	   var pageIcon = panelContainer.find('#chosenIcon').find('img').attr('src');
	   var pageCategory = panelContainer.find('#pageTags').val();
	   var acceptPosts = panelContainer.find('#acceptPosts').is(':checked');
	   
	   var storyHighlightTitle = panelContainer.find('#highlighttitle').val();
	   if(storyHighlightTitle == "null" || storyHighlightTitle == "" || storyHighlightTitle == "undefined"){
		   storyHighlightTitle = "Highlight";
	   }
	   
	   var storyHighlightFrequency = panelContainer.find('#highlightInterval').val();
	   
	   sb.utilities.map(sharedUserNameList, function(item){
		   if(sharedUserList == null){
			   sharedUserList = item;
		   }else{
			   sharedUserList = sharedUserList + ";" + item;			   
		   }
	   });

	   var shareToAllCurrentContacts = panelContainer.find('#shareToAllCurrentContacts').is(':checked');
	   if(coverPageAlbumId == null){
		   coverPageAlbumId="";
	   }
		sb.utilities.postV2(relPathIn+"document.pvt?mediaType=json",{documenttype: documentType, documentname: documentName, documentCoverPageText: documentCoverPageText, stringShareUserList: sharedUserList, documentCoverPageAlbumId: coverPageAlbumId, showDocumentToUnsharedUsers: showDocumentToUnsharedUsers, storyHighlightTitle: storyHighlightTitle, storyHighlightFrequency: storyHighlightFrequency, addAllContactsAsSubscribers: shareToAllCurrentContacts, pageIcon: pageIcon, pageUrl: pageUrl, pageHandle: pageHandle, pageCategories: pageCategory, acceptPosts: acceptPosts}, _createChapterResponseReceived)
		.success(function(){console.log("Document Add Request sent");})
		.error(function(data){
			Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
		});	   
   }
   
   function _createChapterResponseReceived(createDocumentResponse){
	   if(createDocumentResponse.status){
		   Core.publish("displayMessage",{message: sb.dom.find("#ChapterDialog-PreferencesSet-success").html(), messageType: "success"});
		   Core.publish("getNewStories", null);
		   _closeDocumentEditDialog();
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#ChapterDialog-PreferencesSet-failure").html(), messageType: "failure"});
		   _closeDocumentEditDialog();
	   }
   }
   
   function _closeDocumentEditDialog(){

	   documentIDEdited=null; 
	   documentTypeEdited=null; 
	   termCache ={}; 
	   sharedUserNameList={};   
	   coverPageAlbumType=null;
	   coverPageAlbumId=null;
	   panelContainer.find('#userSelect').hide();
	   panelContainer.find("#title").val("");
	   panelContainer.find("#title").prop("placeholder" , "");
	   panelContainer.find('#chapterSharingPreferences').hide();

	   panelContainer.find("#createDocument").unbind("click",_createNewSignboard);
	   panelContainer.find("#createDocument").unbind("click",_createNewTabloid);
	   panelContainer.find("#createDocument").unbind("click",_saveDocument);
	   panelContainer.find("#cancleDocumentCreation").unbind("click", _cancelButtonClick);
	   panelContainer.find('#title').unbind('keyup', _signBoardTitleChangeEvent);
	   picturesDiv = panelContainer.find('.PVTCOVPIC');
	   picturecontainer = picturesDiv.find('.albumpictures');
	   picturesDivId=null;
	   picturesDiv.attr("id","");
	   panelContainer.hide();
	   
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
   
   }
   function _createSignboardResponseReceived(createDocumentResponse){
	   if(createDocumentResponse.status){
		   Core.publish("displayMessage",{message: sb.dom.find("#SignboardDialog-PreferencesSet-success").html(), messageType: "success"});
		   Core.publish("getNewStories", null);
		   _closeDocumentEditDialog();
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#SignboardDialog-PreferencesSet-failure").html(), messageType: "failure"});
		   _closeDocumentEditDialog();
	   }
   }
   
   function _updateDocumentResponseReceived(updateDocumentResponse){
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   if(updateDocumentResponse.status){
		   Core.publish("displayMessage",{message: sb.dom.find("#DocumentDialog-PreferencesSet-success").html(), messageType: "success"});
		   _closeDocumentEditDialog();
		   sb.dom.find('#documentTitle-'+updateDocumentResponse.documentid).html(updateDocumentResponse.documentname);
		   sb.dom.find('#coverPageText-'+updateDocumentResponse.documentid).html(updateDocumentResponse.documentCoverPageText);
		   if(updateDocumentResponse.documentCoverPageMediaItemId != null && updateDocumentResponse.documentCoverPageMediaItemId != "null"){
			   var docCoverPageImageUrl = relPathIn + "photoV2/" + updateDocumentResponse.documentCoverPageMediaItemId + "?mediaType=gif";
			   sb.dom.find("#pageHeader-"+updateDocumentResponse.documentid).css("background-image","url('"+docCoverPageImageUrl+"')");
			   sb.dom.find("#documentItem-"+updateDocumentResponse.documentid).find(".documentItemHeader").css("background-image","url('"+docCoverPageImageUrl+"')");			   
			   sb.dom.find("#documentItem-"+updateDocumentResponse.documentid).find(".documentItemHeader").css("height", input.documentItemHeaderMinHeight);
		   }

	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#DocumentDialog-PreferencesSet-failure").html(), messageType: "failure"});
		   _closeDocumentEditDialog();
	   }
   }
   
   function _documentCoverPageChangePictureButtonClick(e){
	   if(coverPageAlbumId == null || coverPageAlbumId == 0){
		   Core.publish('addAlbum',{documenttype: 'PVTCOVPIC', documentname: panelContainer.find("#title").val()});
	   }else{
		   Core.publish('addPictureFromDevice', {documentid: coverPageAlbumId, documenttype: coverPageAlbumType});
	   }
	   
   }
   
   function _startEditDocumentDialog(documentResponse){

	   documentIDEdited=null; 
	   documentTypeEdited=null; 
	   termCache ={}; 
	   sharedUserNameList={};
	   picturesDivId=null;	   
	   picturesDiv = panelContainer.find('.PVTCOVPIC');
	   picturecontainer = picturesDiv.find('.albumpictures');	   
	   picturesDiv.attr("id","");
	   coverPageAlbumType=null;
	   coverPageAlbumId=null;
	   picturecontainer.html("");
	   alertBeforeNavigatingAway = true;
	   panelContainer.find('#title').bind('keyup', _signBoardTitleChangeEvent);
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   panelContainer.find("#chosenIcon").html("Icon");
	   panelContainer.find("#removeIcon").hide();		
		panelContainer.find("#documentIcon").on("change", _encodeImageFileAsURL);
		panelContainer.find("#removeIcon").on("click", _removeDocumentIcon);
		
		if(documentResponse.documentItem.documentCoverPage){
			coverPageDefaultText = sb.utilities.htmlDecode(documentResponse.documentItem.documentCoverPage.story);
		}else{
			coverPageDefaultText = sb.dom.find("#NewSignboardDialog-CoverPage-PlaceHolder").html();
		}
		
		if(documentResponse.documentItem.acceptPosts){
			panelContainer.find("#allowPosts").prop('checked', true); 
		}else{
			panelContainer.find("#allowPosts").prop('checked', false);
		}
		
		if(documentResponse.documentItem.documentType == 'Magazine'){
			panelContainer.find("#allowPosts").show();	
		}
		
		panelContainer.find("#pageHandle").show();
		panelContainer.find("#pageHandle").val(documentResponse.documentItem.pageHandle);
		
		panelContainer.find("#pageUrl").val(documentResponse.documentItem.pageUrl);
		
		if(documentResponse.documentItem.pageCategories){
			var docItemTags = "";			
			for(var docTagIndex = 0; docTagIndex < documentResponse.documentItem.pageCategories.length; docTagIndex++){
				docItemTags = docItemTags + documentResponse.documentItem.pageCategories[docTagIndex];
				if(docTagIndex + 1 < documentResponse.documentItem.pageCategories.length){
					docItemTags = docItemTags + ", ";
				}
			}
			panelContainer.find("#pageTags").val(docItemTags);			
		}

		
		if(documentResponse.documentItem.pageIcon != null && documentResponse.documentItem.pageIcon != ""){
			var newImage = document.createElement('img');
			newImage.src = documentResponse.documentItem.pageIcon;
			newImage.style.width = '50px';
			document.getElementById("chosenIcon").innerHTML = newImage.outerHTML;
			sb.dom.find(document.getElementById("removeIcon")).show();
		}		
		

	   documentTinyMceInstance.setContent(coverPageDefaultText);
	   panelContainer.find("#title").val(documentResponse.documentItem.documentTitle);
	   if(documentResponse.documentItem.documentCoverPage){
		   coverPageAlbumId=documentResponse.documentItem.documentCoverPage.storyPictureAlbumId;
		   coverPageAlbumType=documentResponse.documentItem.documentCoverPage.storyPictureAlbumTypeCd;
		   picturesDivId="album-"+coverPageAlbumId+"-"+coverPageAlbumType;
		   picturesDiv.attr("id",picturesDivId);
		   coverPageAlbumType=documentResponse.documentItem.documentCoverPage.storyPictureAlbumTypeCd;
		   if(documentResponse.documentItem.documentCoverPage.storyPictures){
			   _paintAlbumPictures(documentResponse.documentItem.documentCoverPage.storyPictures);
		   }			   
	   }
	   documentTypeEdited=documentResponse.documentItem.documentType;
	   documentIDEdited=documentResponse.documentItem.documentId;
	   panelContainer.find("#title").prop("placeholder" , sb.dom.find("#DocumentDialog-DocumentName-PlaceHolder").html());
	   panelContainer.find('#documentCoverPageChangePictureButton').show();
	   panelContainer.find('#documentCoverPageChangePictureButton').bind('click', _documentCoverPageChangePictureButtonClick);
	   panelContainer.find("#createDocument").html(sb.dom.find("#EditDocumentDialog-CreateButton-Label").html());
	   var highlightTitle = 'Highlight';
	   var showWhenUnShared = 'Y';
	   var highlightFrequency = '24';
	   
	   sb.utilities.each(documentResponse.documentItem.documentOwnerPreferences, function(idx, obj){
		   if(obj.name == 'HIGHLIGHTTITLE'){
			   highlightTitle=obj.value;
		   }else if(obj.name == 'SHOWDOCUNSHARED'){
			   showWhenUnShared = obj.value;
		   }else if(obj.name == 'HIGHLIGHTFREQ'){
			   if(obj.value == '24'){
				   highlightFrequency = 1;
			   }else if(obj.value == '168'){
				   highlightFrequency = 2;
			   }else if(obj.value == '720'){
				   highlightFrequency = 3;
			   }else{
				   highlightFrequency = 1;
			   }
		   }
	   });
 
	   panelContainer.find('#highlighttitle').val(highlightTitle);
	   panelContainer.find('#highlightInterval').val(highlightFrequency);
	   
	   if(documentResponse.documentItem.documentType == 'Exclusive'){
		   if(showWhenUnShared == 'Y'){
			   panelContainer.find('#showWhenUnshared').attr('checked', true);
		   }else{
			   panelContainer.find('#showWhenUnshared').attr('checked', false);
		   }
		   panelContainer.find('#showWhenUnshared').show();
		   panelContainer.find('#showWhenUnsharedLabel').show();
	   }else{
		   panelContainer.find('#showWhenUnshared').hide();
		   panelContainer.find('#showWhenUnsharedLabel').hide();
	   }


	   panelContainer.find('#chapterSharingPreferences').fadeIn();
	   panelContainer.find('#userSelect').fadeIn();
	   

	   panelContainer.find("#createDocument").click(_saveDocument);
	   panelContainer.find("#cancleDocumentCreation").click(_cancelButtonClick);
	   
	   panelContainer.find('#userSearchInput').autocomplete({  
			  source: function(request, response){
				  var term = request.term;
				  if(term in termCache){
					   response(sb.utilities.map(termCache[term].contactList, function(item){
						return {
							label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
						};
					   }));	
					  return;
				  }
				  sb.utilities.get(
						  relPathIn+'searchContact/'+request.term+'-'+true+'?mediaType=json',
						  null,
						  function(contactListData){
							   termCache[term] = contactListData;
							   response(sb.utilities.map(contactListData.contactList, function(item){
								return {
									label: item.contact.userFullName, value: item.contact.username, hasProfPic: item.contact.userHasProfPic
								};
							   }));	
						  });
			  },
			  minLength: 2,
			  select: function(event, ui){
				  if(ui.item.value in sharedUserNameList){
					  ;
				  }else{
					  sharedUserNameList[ui.item.value] = ui.item.value;
					  _log(ui.item ?
							  tmpl(sb.dom.find("#template-contactButton").html(), ui.item) :
							  "Nothing Selected " + this.value);				  
				  }

			  },
			  open: function(){
				  sb.dom.find(this).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			  },
			  close: function(){
				  sb.dom.find(this).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			  }
		   });
	   picturesDiv = panelContainer.find('.PVTCOVPIC');
	   picturecontainer = picturesDiv.find('.albumpictures');
	   
	   panelContainer.show();

   }
	function _paintAlbumPictures(mediaItemList){

		var	thumnailhtml = null;		
		for(var i=0; i<mediaItemList.length; i++){
			thumnailhtml=thumnailhtmltemplate.replace("albumpicid",relPathIn+"alb/"+mediaItemList[i].documentPageId);
			thumnailhtml=thumnailhtml.replace("pictureurl",relPathIn+"photo/"+mediaItemList[i].documentPageId);
			picturecontainer.append(thumnailhtml);
		}
		picturesDiv.fadeIn();
		picturecontainer.fadeIn();
	}
	
	
   function _saveDocument(e){
	   alertBeforeNavigatingAway = false;
	   Core.publish('documentEditStatusUpdate', {documentEditHappening: alertBeforeNavigatingAway});
	   var documentName = panelContainer.find("#title").val();
	   var documentCoverPageText = panelContainer.find("#documentCoverPageDetails").html();
	   if(documentTypeEdited == 'Exclusive'){
		   var showWhenUnShared = panelContainer.find('#showWhenUnshared').is(':checked');
		   var showDocumentToUnsharedUsers = 'Y';
		   if(showWhenUnShared){
			   showDocumentToUnsharedUsers = 'Y';
		   }else{
			   showDocumentToUnsharedUsers = 'N';
		   }
	   }
	   
	   var storyHighlightTitle = panelContainer.find('#highlighttitle').val();
	   if(storyHighlightTitle == "null" || storyHighlightTitle == "" || storyHighlightTitle == "undefined"){
		   storyHighlightTitle = "Highlight";
	   }
	   
	   var storyHighlightFrequency = panelContainer.find('#highlightInterval').val();
	   var shareToAllCurrentContacts = panelContainer.find('#shareToAllCurrentContacts').is(':checked');
	   var sharedUserList = null;
	   
	   sb.utilities.map(sharedUserNameList, function(item){
		   if(sharedUserList == null){
			   sharedUserList = item;
		   }else{
			   sharedUserList = sharedUserList + ";" + item;
		   }
	   });

	   var pageHandle = panelContainer.find('#pageHandle').val();
	   var pageUrl = panelContainer.find('#pageUrl').val();
	   var pageIcon = panelContainer.find('#chosenIcon').find('img').attr('src');
	   var pageCategory = panelContainer.find('#pageTags').val();
	   var acceptPosts = panelContainer.find('#allowPosts').is(':checked');
	   
	   
	   try{
	   sendMessagePost = sb.utilities.put(relPathIn+"page.pvt?mediaType=json",{documentid: documentIDEdited, documentname: documentName, documentCoverPageText: documentCoverPageText, stringShareUserList: sharedUserList, showDocumentToUnsharedUsers: showDocumentToUnsharedUsers, storyHighlightTitle: storyHighlightTitle, storyHighlightFrequency: storyHighlightFrequency, documentCoverPageAlbumId: coverPageAlbumId, addAllContactsAsSubscribers: shareToAllCurrentContacts, pageIcon: pageIcon, pageUrl: pageUrl, pageHandle: pageHandle, pageCategories: pageCategory, acceptPosts: acceptPosts},_updateDocumentResponseReceived);
	   }catch(err){
		   sendMessageFailure();
	   }
   }
   
   function _editDocument(documentId, documentType){
	   try{
	   sb.utilities.get(relPathIn+documentType+'/page.pvt/'+documentId+'?mediaType=json',null,_startEditDocumentDialog);
	   }catch(err){
		   Core.publish("displayMessage",{message: "There was a problem process your request. Please try again later", messageType: "failure"});
	   }
   }
   
   function _deleteDocument(documentId){
	   try{
		   sb.utilities.serverDelete(relPathIn+'page/'+documentId+'?mediaType=json',null,_deleteDocumentTransactionReceive);
		   }catch(err){
			   Core.publish("displayMessage",{message: "There was a problem process your request. Please try again later", messageType: "failure"});
		   }
   }
   
   function _deleteDocumentTransactionReceive(deleteTransactionResponse){
	   if(deleteTransactionResponse.antahRequestStatus == "SUCCESS"){		   
		   Core.publish("displayMessage",{message: sb.dom.find("#DocumentController-DocumentDelete-Success").html(), messageType: "success"});
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
   }
   
   function _documentEditButtonClick(e){
	   var documentId = sb.dom.find(this).attr('id').split('-')[1];
	   var documentType = sb.dom.find(this).attr('id').split('-')[2];
	   _editDocument(documentId, documentType);
   }
   
   function _documentDeleteButtonClick(e){
	   var documentId = sb.dom.find(this).attr('id').split('-')[1];
	   var deleteDocumentDialog=sb.dom.find("#DeleteDocument-Confirm");
	   deleteDocumentDialog.html(sb.dom.find("#DocumentController-DocumentDelete-Confirm").html());
	   deleteDocumentDialog.dialog({
		  resizable: false,
	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	   	  dialogClass: "opaque",
	   	  modal: true,
	   	  buttons: [
	   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_deleteDocument(documentId);sb.dom.find(this).dialog("close");}, class: "ab"},
	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	   	  ]
	   });
   }
   
   
   function sendMessageFailure(){
	   Core.publish("displayMessage",{message: "Message could not be sent, Server might be down. Please try again later.", messageType: "failure"});
   }
   
   function _receiveAlbumUpdatePublish(publishData){
	   if(publishData.documenttype == "PVTCOVPIC"){
		   if(publishData.actioncode == "ADD"){
			   coverPageAlbumId=publishData.documentid;
			   coverPageAlbumType=publishData.documenttype; 
			   picturesDivId="album-"+publishData.documentid+"-"+publishData.documenttype;
			   picturesDiv.attr("id",picturesDivId);
			   picturesDiv.fadeIn();
		   }else if(publishData.actioncode == "UPDATE"){
			   sb.utilities.trace("New photos added for this story..");
		   }
	   }
   }
  
   function _documentHeaderClick(e){
	   sb.dom.find(this).parent().find('.documentItemBody').slideToggle();
   }
   
   function _showPicturesButtonClick(e){
	   sb.dom.find(this).parent().find('.documentItemBody').slideToggle();
   }
   
   function _CommentsSummaryClick(e){
	   var documentItemBody = sb.dom.find(this).parentsUntil(this, '.documentItem').find('.documentItemBody');
	   	   documentItemBody.slideDown();
	   	   documentItemBody.find('.cmntsection').triggerHandler('click');
   }
   
   function _RepliesSummaryClick(e){
	   var documentItemBody = sb.dom.find(this).parentsUntil(this, '.documentItem').find('.documentItemBody');
   	   documentItemBody.slideDown();
   	   documentItemBody.find('.rplysection').triggerHandler('click');
   }
   
   function _HighlightSummaryClick(e){
	   var documentItemBody = sb.dom.find(this).parentsUntil(this, '.documentItem').find('.documentItemBody');
   	   documentItemBody.slideDown();
   	   documentItemBody.find('.clickReacMessage').triggerHandler('click');
   }
   
   function _newSignboardButtonClicked(e){
	   sb.dom.find("#headerControllerNewButtonToolTip").hide();
	   _startNewSignboardDialog();
   }
   
   function _newTabloidButtonClicked(e){
	   sb.dom.find("#headerControllerNewButtonToolTip").hide();
	   _startNewTabloidDialog();
   }
   
   function _showAllHomePageClicked(e){
	   sb.dom.find("#storiesDiv").find(".Home").slideToggle();
   }
   
   function _showAllChapterClicked(e){
	   sb.dom.find("#storiesDiv").find(".Exclusive").slideToggle();
   }
   
   function _showAllMagazineClicked(e){
	   sb.dom.find("#storiesDiv").find(".Magazine").slideToggle();
   }

   function _encodeImageFileAsURL(e){
	   console.log('file selected');
	    var filesSelected = document.getElementById("documentIcon").files;
	    if (filesSelected.length > 0)
	    {
	        var fileToLoad = filesSelected[0];

	        var fileReader = new FileReader();

	        fileReader.onload = function(fileLoadedEvent) {
	            var srcData = fileLoadedEvent.target.result; // <--- data: base64

	            var newImage = document.createElement('img');
	            newImage.src = srcData;
	            console.log(newImage.width + " " + newImage.height);
	            if(newImage.width > 200 || newImage.height > 200){
	         	   var iconTooBig=sb.dom.find("#DeleteDocument-Confirm");
	         	   iconTooBig.html(sb.dom.find("#DocumentItemController-IconTooBig-DialogHtml").html());
	         	   iconTooBig.dialog({
	        		  resizable: false,
	        	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	        	   	  dialogClass: "opaque",
	        	   	  modal: true,
	        	   	  buttons: [
	        	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	        	   	  ]
	        	   });	            	
	            }else{
		            newImage.style.width = '50px';
		            document.getElementById("chosenIcon").innerHTML = newImage.outerHTML;
		            sb.dom.find(document.getElementById("removeIcon")).show();
	            }
	        };
	        fileReader.readAsDataURL(fileToLoad);
	    }
	}
   
   return{
	   init:function() {
       	try{
       			sb.utilities.trace('initializing module: DocumentController');
       			panelContainer.hide();
       			panelContainer.html(htmlBody.html());
	   		   	 try{
	  			   _initializeWYSIWYGEditor();		   
	  			   }catch(err){
	  				   panelContainer.find("#documentCoverPageDetails").html("There was a problem loading editor. Please try again later.");
	  			   }       			
       			sb.dom.find("#EditDocumentPreferences").accordion({
      		      collapsible: true,
      		      heightStyle: "content"
       			});
       			//Events
       			sb.dom.find('.editDocument').bind('click', _documentEditButtonClick);
       			sb.dom.find('.deleteDocument').bind('click', _documentDeleteButtonClick);
	    		sb.dom.find('.showPictures').bind('click', _showPicturesButtonClick);
	    		sb.dom.find('.documentItemHeader').bind('click', _documentHeaderClick);
	    		sb.dom.find('.CommentsSummary').bind('click', _CommentsSummaryClick);
	    		sb.dom.find('.RepliesSummary').bind('click', _RepliesSummaryClick);
	    		sb.dom.find('.HighlightSummary').bind('click', _HighlightSummaryClick);
	    		sb.dom.find('#ContactDocumentRoleShareNewDocument').find('#newSignboardButton').on('click', _newSignboardButtonClicked);
	    		sb.dom.find('#ContactDocumentRoleShareNewDocument').find('#newTabloidButton').on('click', _newTabloidButtonClicked);
	    		sb.dom.find('#docTypeFilter').buttonset();	
	    		sb.dom.find('#showAllHomePages').bind('click', _showAllHomePageClicked);
	    		sb.dom.find('#showAllChapters').bind('click', _showAllChapterClicked);
	    		sb.dom.find('#showAllMagazines').bind('click', _showAllMagazineClicked);

       			//Assignments

       			thumnailhtmltemplate = sb.dom.find("#template-albumpicturethumbnail").html();
       			
       			//Subscriptions
	    		Core.subscribe('createSignboard', _startNewSignboardDialog);
	    		Core.subscribe('createTabloid', _startNewTabloidDialog);
	    		Core.subscribe('albumUpdate', _receiveAlbumUpdatePublish);
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace("Module destroyed");
   		}	   
   }
};