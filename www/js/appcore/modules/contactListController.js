var contactListController = function(sb, input){
	var searchAreaDiv = sb.dom.find(input.elemHandle),relPathIn=input.relPath, searchInputBox=null, inputUserName=input.username, inviteFriendsBtn=null, contactSuggestHtml = null, userSuggestPanelCloseButton = null,
		listTemplate=input.contactListTemplate, loadContactList=input.loadListFlag, suggestContactsFlag = input.suggestContactsFlag, suggestListTemplate=input.suggestListTemplate, suggestHandle = input.suggestHandle, contactListContainerHandles={};
	
	
   function _searchType(e){
	   var keycode = (e.keyCode ? e.keyCode : e.which);
	   var searchQuery = sb.dom.find(this).val();
	   if(keycode == 8){
		   if(searchQuery == ""){
			   sb.dom.find("#searchResults").html("");
			   sb.dom.find("#searchResults").css("height", "0px");
		   }else{
			   sb.utilities.get(relPathIn+'searchContact/'+searchQuery+'-'+false+'?mediaType=json',null,_updateContactList);
		   }
	   }else{		   
		   if(searchQuery != ""){ 
			   sb.utilities.get(relPathIn+'searchContact/'+searchQuery+'-'+false+'?mediaType=json',null,_updateContactList);
		   }		   
	   }
   } 
   
   function _userRelMaintenanceResponseReceived(userRelResponse){
	   if(userRelResponse.txnStatus=="SUCCESS"){
		   var buttonList = sb.dom.find(".addContactButton");  
			   console.log("Button List " + buttonList.length + " " + userRelResponse.contactResponse.contact.username + " " + sb.dom.find(document.getElementById(userRelResponse.contactResponse.contact.username)).length);
			   buttonList.each(function(index){
				   if(sb.dom.find(this).attr("id") == userRelResponse.contactResponse.contact.username){
					   sb.dom.find(this).removeClass("ui-icon-clock");
					   sb.dom.find(this).html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));	   
					   sb.dom.find(this).delay(500).fadeOut();			   
					   sb.dom.find(this).remove();			   				   
				   }
			   });
			   
			   
			   buttonList = sb.dom.find(".ignoreContactButton");  
			   console.log("Button List " + buttonList.length + " " + userRelResponse.contactResponse.contact.username + " " + sb.dom.find(document.getElementById(userRelResponse.contactResponse.contact.username)).length);
			   buttonList.each(function(index){
				   if(sb.dom.find(this).attr("id") == userRelResponse.contactResponse.contact.username){
					   sb.dom.find(this).removeClass("ui-icon-clock");
					   sb.dom.find(this).html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));	   
					   sb.dom.find(this).delay(500).fadeOut();			   
					   sb.dom.find(this).remove();			   				   
				   }
			   });
			   
			   buttonList = sb.dom.find(".unBlockContactButton");  
			   console.log("Button List " + buttonList.length + " " + userRelResponse.contactResponse.contact.username + " " + sb.dom.find(document.getElementById(userRelResponse.contactResponse.contact.username)).length);
			   buttonList.each(function(index){
				   if(sb.dom.find(this).attr("id") == userRelResponse.contactResponse.contact.username){
					   sb.dom.find(this).removeClass("ui-icon-clock");
					   sb.dom.find(this).html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));	   
					   sb.dom.find(this).delay(500).fadeOut();			   
					   sb.dom.find(this).remove();			   				   
				   }
			   });
			   
			   buttonList = sb.dom.find(".deleteContactButton");  
			   console.log("Button List " + buttonList.length + " " + userRelResponse.contactResponse.contact.username + " " + sb.dom.find(document.getElementById(userRelResponse.contactResponse.contact.username)).length);
			   buttonList.each(function(index){
				   if(sb.dom.find(this).attr("id") == userRelResponse.contactResponse.contact.username){
					   sb.dom.find(this).removeClass("ui-icon-clock");
					   sb.dom.find(this).html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));	   
					   sb.dom.find(this).delay(500).fadeOut();			   
					   sb.dom.find(this).remove();			   				   
				   }
			   });
			   			   
		   if(userRelResponse.contactResponse.userIsBlockedByLoggedInUser){
			   buttonList = sb.dom.find(".blockContactButton");
			   buttonList.each(function(index){
				   if(sb.dom.find(this).attr("id") == userRelResponse.contactResponse.contact.username){
					   sb.dom.find(this).removeClass("ui-icon-clock");
					   sb.dom.find(this).html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));	   
					   sb.dom.find(this).delay(500).fadeOut();			   
					   sb.dom.find(this).remove();			   
				   }
			   });
			   var unBlockHtml = tmpl("tmpl-contactUnBlock", userRelResponse);
			   var unBlockElement = sb.dom.wrap(unBlockHtml);
			   unBlockElement.on('click', _unBlockContactButtonClickEvent);
			   sb.dom.find("#contactOptions").append(unBlockElement);
		   }
		   
		   if(!userRelResponse.contactResponse.userHasAddedLoggedInUser){
			   var contactId = 'Contact-'+userRelResponse.contactResponse.contact.username;
			   sb.dom.find(document.getElementById(contactId)).fadeOut();
			   sb.dom.find(document.getElementById(contactId)).remove();
		   }
		   var userContactPanelID = "user-"+userRelResponse.contactResponse.contact.username+"-panel";
		   sb.dom.find(document.getElementById(userContactPanelID)).delay(1000).fadeOut();
		   sb.dom.find(document.getElementById(userContactPanelID)).delay(1000).remove();
		   var remainingSuggestedListLength = sb.dom.find(input.suggestHandle).find(".user-n-panel").length;
		   if(remainingSuggestedListLength >= 1){
			   ;
		   }else{
			   sb.dom.find(input.suggestHandle).find("#panel-SuggestUser-bdy").html(sb.dom.find("#jstemplate-SuggestContact-Done").html());
			   sb.dom.find(input.suggestHandle).delay(1000).fadeOut();
		   }
		   
		   if(userRelResponse.contactResponse.relationships){
			   var userRelHasFriendRel = false;
			   for(var i = 0; i < userRelResponse.contactResponse.relationships.length; i++){
				   if(userRelResponse.contactResponse.relationships[i].relType == 'FRIEND'){
					   userRelHasFriendRel = true;
				   }
			   }
			   if(userRelHasFriendRel){
				   var contactToolTipID = "panel-contactTooltip-"+userRelResponse.contactResponse.contact.username;
				   var userRelButton = sb.dom.find(document.getElementById(contactToolTipID)).find('button');
				   userRelButton.find('#relationshipDescription').remove();
				   userRelButton.append("<i class='vsf lt' title='"+userRelResponse.contactResponse.contact.userFullName+" is a Pal' id='relationshipDescription' style='position: absolute; left: 80%; top: 0px;  margin-top: 2px;'>Pal</i>");
			   }			   
		   }
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
   }
   
   function _suggestContacts(){   
	   sb.utilities.get(relPathIn+'suggestcontactList.pvt/'+inputUserName+'?mediaType=json',null,_suggestContactList);
   }
   
   function _suggestContactList(contactListResponse){	   
	sb.dom.find(input.suggestHandle).html(tmpl(suggestListTemplate,contactListResponse));   
	sb.dom.find(".timeago").timeago();
	sb.dom.find(input.suggestHandle).find(".addContactButton").bind("click",_addContactButtonClickEvent);
	sb.dom.find(input.suggestHandle).find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
	sb.dom.find(input.suggestHandle).find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
   }
   
   function _closeContactSuggestPanel(e){
	   sb.dom.find(input.suggestHandle).fadeOut();
   }
   
   function _suggestContactListInDialog(contactListResponse){
		sb.dom.find(input.suggestHandle).html(tmpl(suggestListTemplate,contactListResponse));   
		sb.dom.find(".timeago").timeago();
		sb.dom.find(input.suggestHandle).find(".addContactButton").bind("click",_addContactButtonClickEvent);
		sb.dom.find(input.suggestHandle).find(".ignoreContactButton").bind("click",_ignoreContactButtonClickEvent);
		sb.dom.find(input.suggestHandle).find(".blockContactButton").bind("click",_blockContactButtonClickEvent);
		sb.dom.find(input.suggestHandle).find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
		sb.dom.find(input.suggestHandle).find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
		sb.dom.find(input.suggestHandle).find("#userSuggestPanelCloseButton").bind("click", _closeContactSuggestPanel);
   }
   
   function _userRelIsSameAs(userRel){
	   console.log(JSON.stringify(this));
	   console.log(JSON.stringify(userRel));
   }
   function _userRelAlreadyInContactList(inputContactList, userRel){
	   inputContactList.contactList.each(_userRelIsSameAs(userRel));
   }
   
   function _addContactButtonClickEvent(e){
	   e.preventDefault();
	   var toUserName=e.currentTarget.id;
	   var invitationMessageElement = sb.dom.find(this).parents('.contactAddDiv').find('#AddContact-InviteRequest-'+toUserName);
	   var invitationMessage = null;
	   if(invitationMessageElement){
		   invitationMessage = invitationMessageElement.val();
	   }else{
		   invitationMessage = null;
	   }
	   sb.dom.find(this).removeClass("ui-icon-plus");
	   sb.dom.find(this).addClass("ui-icon-clock");
	   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
	   sb.dom.find(this).unbind('click',_addContactButtonClickEvent);
	   sb.utilities.postV2(relPathIn+'userrel?mediaType=json',{fromUserName: inputUserName, toUserName: toUserName, newRelType: "CONTACT", oldRelType: "", description: invitationMessage},_userRelMaintenanceResponseReceived);	   
   }
   
   function _deleteContactButtonClickEvent(e){
	   e.preventDefault();
	   var toUserName=e.currentTarget.id;	   
	   var deleteContactDialog=sb.dom.find("#DeleteDocument-Confirm");
	   deleteContactDialog.html(sb.dom.find("#ContactListController-ContactDelete-Confirm").html());
	   deleteContactDialog.dialog({
		  resizable: false,
	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	   	  dialogClass: "opaque",
	   	  modal: true,
	   	  buttons: [
	   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_deleteContactButtonConfirm(inputUserName, toUserName);sb.dom.find(this).dialog("close");}, class: "ab"},
	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	   	  ]
	   });
   }
   
   function _deleteContactButtonConfirm(inputUserName, toUserName){
	   
	   var buttonList = sb.dom.find(".deleteContactButton#"+toUserName);
	   buttonList.each(function(index){
		   sb.dom.find(this).removeClass("ui-icon-delete");
		   sb.dom.find(this).addClass("ui-icon-clock");
		   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
		   sb.dom.find(this).unbind('click',_deleteContactButtonClickEvent);			   
	   });

	   sb.utilities.serverDelete(relPathIn+'userrel/'+inputUserName+'/'+toUserName+'/'+'CONTACT?mediaType=json',null,_userRelMaintenanceResponseReceived);
   }
   
   function _ignoreContactButtonClickEvent(e){
	   e.preventDefault();
	   var toUserName=e.currentTarget.id;

	   var deleteContactDialog=sb.dom.find("#DeleteDocument-Confirm");
	   deleteContactDialog.html(sb.dom.find("#ContactListController-ContactDelete-Confirm").html());
	   deleteContactDialog.dialog({
		  resizable: false,
	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	   	  dialogClass: "opaque",
	   	  modal: true,
	   	  buttons: [
	   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_ignoreContactConfirm(inputUserName, toUserName);sb.dom.find(this).dialog("close");}, class: "ab"},
	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	   	  ]
	   });   
   }
   
   function _ignoreContactConfirm(inputUserName, toUserName){
	   var buttonList = sb.dom.find(".ignoreContactButton#"+toUserName);
	   buttonList.each(function(index){
		   sb.dom.find(this).removeClass("ui-icon-delete");
		   sb.dom.find(this).addClass("ui-icon-clock");
		   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
		   sb.dom.find(this).unbind('click',_deleteContactButtonClickEvent);			   
	   });
	   sb.utilities.serverDelete(relPathIn+'userrel/'+toUserName+'/'+inputUserName+'/'+'CONTACT?mediaType=json',null,_userRelMaintenanceResponseReceived);
   }
   
   
   function _blockContactButtonClickEvent(e){
	   e.preventDefault();
	   var toUserName=e.currentTarget.id;
	   
	   var blockContactDialog=sb.dom.find("#DeleteDocument-Confirm");
	   blockContactDialog.html(sb.dom.find("#ContactListController-BlockDelete-Confirm").html());
	   blockContactDialog.dialog({
		  resizable: false,
	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	   	  dialogClass: "opaque",
	   	  modal: true,
	   	  buttons: [
	   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_BlockContactConfirm(inputUserName, toUserName);sb.dom.find(this).dialog("close");}, class: "ab"},
	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	   	  ]
	   });
   }
   
   function _BlockContactConfirm(inputUserName, toUserName){
	   var buttonList = sb.dom.find(".blockContactButton#"+toUserName);
	   buttonList.each(function(index){
		   sb.dom.find(this).removeClass("ui-icon-delete");
		   sb.dom.find(this).addClass("ui-icon-clock");
		   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
		   sb.dom.find(this).unbind('click',_deleteContactButtonClickEvent);			   
	   });
	   sb.utilities.postV2(relPathIn+'userrel?mediaType=json',{fromUserName: inputUserName, toUserName: toUserName, newRelType: "BLOCKED", oldRelType: ""},_userRelMaintenanceResponseReceived);	   
   }
   
   function _unBlockContactButtonClickEvent(e){
	   e.preventDefault();
	   var toUserName=e.currentTarget.id;
	   sb.dom.find(this).removeClass("ui-icon-delete");
	   sb.dom.find(this).addClass("ui-icon-clock");
	   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
	   sb.dom.find(this).unbind('click',_deleteContactButtonClickEvent);
	   sb.utilities.serverDelete(relPathIn+'userrel/'+inputUserName+'/'+toUserName+'/'+'BLOCKED?mediaType=json',null,_userRelMaintenanceResponseReceived);	   
   }
   
   function _showHideFriendsButtonClicked(e){
	   sb.dom.find(input.searchResultsHandle).find(".CONTACT").slideToggle();
   }
   
   function _updateContactList(contactListResponse){
	sb.dom.find(input.searchResultsHandle).html(tmpl(listTemplate,contactListResponse));   
	sb.dom.find(".timeago").timeago();
	sb.dom.find(input.searchResultsHandle).find(".addContactButton").bind("click",_addContactButtonClickEvent);
	sb.dom.find(input.searchResultsHandle).find(".ignoreContactButton").bind("click",_ignoreContactButtonClickEvent);
	sb.dom.find(input.searchResultsHandle).find(".blockContactButton").bind("click",_blockContactButtonClickEvent);	
	sb.dom.find(input.searchResultsHandle).find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
	sb.dom.find(input.searchResultsHandle).find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
	sb.dom.find(input.searchResultsHandle).find("#showHideFriends").click(_showHideFriendsButtonClicked);
	_contactToolTipAdded({divId: input.searchResultsHandle});
	
	var contactPictureSS = sb.dom.find("#contactPhotos");
	var photoStyle = null;
	for(var i=0; i < contactListResponse.contactList.length; i++){
		var contactResponse = contactListResponse.contactList[i];
		if(contactResponse.contact.base64userProfPicture != null && contactResponse.contact.base64userProfPicture != "null"){
			photoStyle = ".photo-"+contactResponse.contact.userProfPicId+ " { background-image: url(data:image/gif;base64," + contactResponse.contact.base64userProfPicture +") !important; }";
			contactPictureSS.append(photoStyle);
		}

	}
	
	if(contactListResponse.contactList.length > 0){
		sb.dom.find(input.searchResultsHandle).show();
		var contactAbbrHeight = sb.dom.find(".contactAbbr").first().height();
		sb.dom.find(input.searchResultsHandle).css("height", contactListResponse.contactList.length*contactAbbrHeight+50+"px");		
	}	
	
		if(suggestContactsFlag == 'true' && contactListResponse.hasNonFriendUsers){
			_suggestContactListInDialog(contactListResponse); 
   		}
		
		
   }
   
   function _uiButtonMouseOver(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _uiButtonMouseOut(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _searchInputClick(e){
	   sb.dom.find(this).val("");
	   sb.dom.find(this).removeClass("lt");
	   sb.dom.find(this).removeClass("cg");
   }
   
   function serverLog(err){
	   sb.utilities.log("Error Message From Module - MessageDisplayController : " + err);
   }

   function _setContactToolTip(){
	   
	   var contactElement = sb.dom.find(this);
	   
	   var contactUsername = contactElement.find('.memberTooltipUsername').html();
	   var contactPhotoYesNo = contactElement.find('.memberTooltipPhotoYesNo').html();
	   var contactUserFullName = contactElement.find('.memberTooltipFullName').html();
	   var toolTipOrientation = contactElement.find('.memberTooltipOrientation').html();
	   var memberAdd = null;
	   var memberTooltipRelatedToUser = null;
	   var memberTooltipUserIsSelf = null;
	   var memberTooltipUserIsFriend = null;
	   var memberTooltipUserHasAddedLoggedInUser = null;
	   var memberTooltipUserIsBlockedByLoggedInUser = null;
	   var memberTooltipUserHasBlockedLoggedInUser = null;	
	   var inviteMessageByContactToLoggedInUser = null;
	   if(contactElement.find('.memberAdd').length > 0){
		   memberAdd = contactElement.find('.memberAdd').html(); 
	   }else{
		   memberTooltipRelatedToUser = (contactElement.find('.memberTooltipRelatedToUser').html() === "true");
		   memberTooltipUserIsSelf = (contactElement.find('.memberTooltipUserIsSelf').html() === "true");
		   memberTooltipUserIsFriend = (contactElement.find('.memberTooltipUserIsFriend').html() === "true");
		   memberTooltipUserHasAddedLoggedInUser = (contactElement.find('.memberTooltipUserHasAddedLoggedInUser').html() === "true");
		   memberTooltipUserIsBlockedByLoggedInUser = (contactElement.find('.memberTooltipUserIsBlockedByLoggedInUser').html() === "true");
		   memberTooltipUserHasBlockedLoggedInUser = (contactElement.find('.memberTooltipUserHasBlockedLoggedInUser').html() === "true");
		   inviteMessageByContactToLoggedInUser = contactElement.find('.memberTooltipInviteMessageByContactToLoggedInUser').html();
	   }

	   var flag = false;
	   if(contactPhotoYesNo == "true"){
		   flag = true;
	   }
	   var userJsonObject = {
			   "username": contactUsername,
			   "userFullName": contactUserFullName,
			   "userHasProfPic": flag,
			   "userCreatedDate": "",
			   "userLastLoginDate": "",
			   "memberAdd" : memberAdd,
			   "relatedToUser" : memberTooltipRelatedToUser,
			   "userIsSelf" : memberTooltipUserIsSelf,
			   "userIsFriend" : memberTooltipUserIsFriend,
			   "userHasAddedLoggedInUser" : memberTooltipUserHasAddedLoggedInUser,
			   "userIsBlockedByLoggedInUser" : memberTooltipUserIsBlockedByLoggedInUser,
			   "userHasBlockedLoggedInUser" : memberTooltipUserHasBlockedLoggedInUser,
			   "inviteMessageByContactToLoggedInUser": inviteMessageByContactToLoggedInUser
	   };
	   var contactToolTipCardHtml = tmpl('tmpl-contactTooltipTemplate', userJsonObject);
	   var contactToolTipCard = sb.dom.wrap(contactToolTipCardHtml);
	   contactToolTipCard.find(".addContactButton").bind("click",_addContactButtonClickEvent);
	   contactToolTipCard.find(".ignoreContactButton").bind("click",_ignoreContactButtonClickEvent);
	   contactToolTipCard.find(".blockContactButton").bind("click",_blockContactButtonClickEvent);
	   contactToolTipCard.find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
	   contactToolTipCard.find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
	   contactElement.data('powertipjq', contactToolTipCard);
	   contactElement.powerTip({
		  placement: toolTipOrientation,
		  mouseOnToPopup: true,
		  smartPlacement: false
	   });
	   

   }
   
   function _contactToolTipAdded(input){
	   if(!(input.divId in contactListContainerHandles)){
		   contactListContainerHandles[input.divId]=input.divId;
		   
	   }
	   var contactToolTipElementList = sb.dom.find(input.divId).find('.contactToolTip');
	   contactToolTipElementList.each(_setContactToolTip);
   }
   
   function _inviteFriendsBtnClick(e){
	   e.preventDefault();
	   Core.publish("addInivitation", null);
   }
   
   function _pulseUserTileAddedMessageProcess(pulseUserTileAddedMessage){
	   console.log(JSON.stringify(pulseUserTileAddedMessage));
	   console.log(sb.dom.find(document.getElementById(pulseUserTileAddedMessage.pulseUserTileID)).length + " " + sb.dom.find(document.getElementById(pulseUserTileAddedMessage.pulseUserTileID)).find(".addContactButton").length);
	   
	   var buttonList = sb.dom.find(".addContactButton");
	   buttonList.each(function(){
		  if(sb.dom.find(this).attr("id") == pulseUserTileAddedMessage.pulseUserTileID.split("-")[1]) {
			  sb.dom.find(this).unbind("click");
			  sb.dom.find(this).bind("click", _addContactButtonClickEvent);
		  }
	   });
	   
	   buttonList = sb.dom.find(".ignoreContactButton");
	   buttonList.each(function(){
		  if(sb.dom.find(this).attr("id") == pulseUserTileAddedMessage.pulseUserTileID.split("-")[1]) {
			  sb.dom.find(this).unbind("click");
			  sb.dom.find(this).bind("click", _ignoreContactButtonClickEvent);
		  }
	   });
	   
   }
   return{
	   init:function() {
       	try{
       		sb.dom.find("#existingContacts").accordion({collapsible: true});
       		sb.dom.find("#contactPage").accordion({header: "h5", collapsible: true, active: false});
       		searchAreaDiv.append(sb.dom.find("#tmpl-searchHtml").html());
       		searchAreaDiv.addClass("p");
       		searchInputBox=searchAreaDiv.find("#searchInput");
       		searchInputBox.val(sb.dom.find("#jstemplate-SearchUserLabel").html());
       		searchInputBox.bind('click', _searchInputClick);
       		searchInputBox.bind('keyup', _searchType);       		
       		searchInputBox.prop("placeholder", sb.dom.find("#jstemplate-SearchUserLabel").html());
       		sb.dom.find(input.searchResultsHandle).find(".addContactButton").bind("click",_addContactButtonClickEvent);
       		sb.dom.find("#existingContacts").find(".addContactButton").bind("click",_addContactButtonClickEvent);
       		sb.dom.find(".deleteContactButton").bind("click", _deleteContactButtonClickEvent);
       		sb.dom.find(".ignoreContactButton").bind("click", _ignoreContactButtonClickEvent);
       		sb.dom.find(".blockContactButton").bind("click", _blockContactButtonClickEvent);
       		sb.dom.find(".unBlockContactButton").bind("click", _unBlockContactButtonClickEvent);
       		if(loadContactList){
       			sb.utilities.get(relPathIn+'searchContact/allContacts-true?mediaType=json',null,_updateContactList);
       		}
       		inviteFriendsBtn=sb.dom.find("#inviteFriendsBtn");
   			inviteFriendsBtn.on('click', _inviteFriendsBtnClick);
   			sb.dom.find("#inviteFriendsBtn_2").on('click', _inviteFriendsBtnClick);
       		Core.subscribe('contactToolTipAdded',_contactToolTipAdded);
       		Core.subscribe('pulseUserTileAdded', _pulseUserTileAddedMessageProcess);
       	}catch(err){
       		serverLog(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			console.log(counter);
   			console.log("Module destroyed");
   		}	   
     }
    };