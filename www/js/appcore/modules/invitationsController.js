var invitationsController = function(sb, input){
	var relPathIn=input.relPath, setupPanel = false, panelWidget = null, confirmButtonText=null, cancelButtonText=null, confirmButton=null, cancelButton = null; doneButton = null,
	inviteFriendsSuccessMessageElem = null, inviteFriendsFailureMessageElem = null, scopes = input.scopes, contactApiUrl = input.contactApiUrl, googleApi = input.gapi, panelCreated = false; 
	var clientId = '932531018424-2svedju1oi1k4vc0tc30hk459f6dp2nk.apps.googleusercontent.com';
	var apiKey = 'AIzaSyB_A16vyEk0Ge6-xlNIh-dF5GVnX0V-9q4';
	var googleContactsModel = null;
	var googleContacts = [];
	var googleAuthResult = null;
	   var invitations = [];
	
   function _addToInvitations(){
	   var newInvitation = {
			   inviteeFullName: sb.dom.find(this).find("#contactName").html(),
			   inviteeEmailAddress: sb.dom.find(this).find("#contactEmail").html()
	   };
	   invitations.push(newInvitation);
   }
   function _addInvitations(element, onlySelected){
	   console.log('onlySelected ' + onlySelected);
	   invitations = [];
	   if(onlySelected){
		   sb.dom.find(element).attr("disabled", true);
	   }else{
		   sb.dom.find("#googleContactListDiv").find(".googleContactSelected").each(function(){
			 sb.dom.find(this).attr("disabled", true);
		   });
	   }
	   
	   
	   if(!onlySelected){
		   var invitationsEmails = panelWidget.find("#inviteeEmailList").val().split(';');
		   panelWidget.find("#inviteeEmailList").val("");
		   for(var emailIndex in invitationsEmails){
			   var emailAddr = invitationsEmails[emailIndex];
			   var atSplitLen = emailAddr.split('@').length;
			   if(emailAddr.indexOf("@") >=0 && emailAddr.indexOf(".") >= 0 && emailAddr.length > 2 && atSplitLen == 2){
				   var newInvitation = {
						   inviteeFullName: emailAddr.split('@')[0],
						   inviteeEmailAddress: emailAddr
					   };
					   invitations.push(newInvitation);			   
			   }
		   }		   
	   }

	   
	   if(onlySelected){
		   var newInvitation = {
				   inviteeFullName: element.find("#contactName").html(),
				   inviteeEmailAddress: element.find("#contactEmail").html()
		   };
		   invitations.push(newInvitation);
	   }else{
		   sb.dom.find("#googleContactListDiv").find(".googleContactSelected").each(_addToInvitations);
	   }
	   
	   
	   if(invitations.length > 0){
		   var invitationMessage = panelWidget.find("#invitationmessage").val();
		   var invitationRequestForm = {
				   "invitationMessage": invitationMessage,
				   "invitations": invitations
		   };
		   sb.utilities.postJSON(relPathIn + 'invitation.pvt?mediaType=json', invitationRequestForm, _receiveInvitationAddResponse);
		   if(onlySelected){
			   sb.dom.find(element).each(_contactInvitationSent);
			   sb.dom.find(element).attr("disabled", false);
		   }else{
			   sb.dom.find("#googleContactListDiv").find(".googleContactSelected").each(_contactInvitationSent);
			   sb.dom.find("#googleContactListDiv").find(".googleContactSelected").each(function(){
					 sb.dom.find(this).attr("disabled", false);
				   });		   
		   }

	   }else{
		   confirmButton.attr("disabled", false);
		   inviteFriendsSuccessMessageElem.hide();
		   inviteFriendsFailureMessageElem.show();
	   }

   }
   
   function _contactInvitationSent(){
	   sb.dom.find(this).find(".selected").html(sb.dom.find("#jstmpl-Invitations-Invited").html()); 
	   sb.dom.find(this).removeClass("googleContactSelected");
	   sb.dom.find(this).parent().find(".googleContactRemove").fadeOut();
	   sb.dom.find(this).attr("disabled", true);
   }
   
   function _contactInvited(){
	   sb.dom.find(this).find(".selected").html(sb.dom.find("#jstmpl-Invitations-Invited").html());
	   sb.dom.find(this).removeClass("googleContactSelected");
	   sb.dom.find(this).parent().find(".googleContactRemove").fadeOut();
	   sb.dom.find(this).attr("disabled", true);
   }
   
   function _receiveInvitationAddResponse(input){
	   if(input.antahRequestStatus == "SUCCESS"){
		   invitations = [];
		   confirmButton.attr("disabled", false);
		   inviteFriendsSuccessMessageElem.show();
		   inviteFriendsFailureMessageElem.hide();
		   
	   }else{
		   confirmButton.attr("disabled", false);
		   inviteFriendsSuccessMessageElem.hide();
		   inviteFriendsFailureMessageElem.show();
		   var errorMessages = "";
		   for(var i=0; i<input.invitations.length; i++){
			   if(input.invitations[i].errorInfo){
				   errorMessages = errorMessages + " " + input.invitations[i].errorInfo.reason;
			   }
		   }
		   Core.publish("displayMessage",{message: errorMessages, messageType: "failure"});
	   }
	   
   }
   
   function _getGoogleAuthorization(){
	   	gapi.client.setApiKey(apiKey);
	    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);  
   }
   
	function handleAuthResult(authResult){
        var authorizeButton = document.getElementById('authorize-button');

        if (authResult && !authResult.error) {
          authorizeButton.style.visibility = 'hidden';
          sb.dom.find('#authorize-button').hide();
          googleAuthResult = authResult;
  		_makeGoogleApiCall(); 
        } else {
          console.log('error received..');
          console.log(authResult.error + " " + JSON.stringify(authResult));
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
        }
	}
	
	function handleAuthClick(event){
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
	}
	
   function _closeInvitationPanel(e){
	   sb.dom.find("#googleContactListContainer").hide();
	   sb.dom.find("#inviteFriendsSuccessMessage").hide();  
	   sb.dom.find("#inviteFriendsFailureMessage").hide();
   }
   
   function _googleApiResponseReceived(response){
	   googleContacts = [];
		for(var i =0; i < response.feed.entry.length; i++){
			var entry = response.feed.entry[i];
			addContactToModel(entry, googleAuthResult);
		}
		googleContactsModel = {
				googleContacts: googleContacts
		};
		
		var contactListHtml = tmpl("tmpl-googleContactList", googleContactsModel);		
		sb.dom.find("#GContacts").find("#googleContactListDiv").html(contactListHtml);
		_renderViewWithGoogleContacts();
		sb.dom.find("#googleContactListContainer").find("#selectAll").show();
   }
   
   function _mockGoogleApiResponseReceived(){
	   googleContacts = [];
		for(var i =0; i < 455; i++){
			var googleContact = {
					contactFullName: "contactName " + i,
					contactEmail: "contactEmail" + i +"@localhost.com",
					contactPhoto: relPathIn + "images/User.gif"
			};
			googleContacts.push(googleContact);
		}
		googleContactsModel = {
				googleContacts: googleContacts
		};
		
		var contactListHtml = tmpl("tmpl-googleContactList", googleContactsModel);		
		sb.dom.find("#GContacts").find("#googleContactListDiv").html(contactListHtml);
		_renderViewWithGoogleContacts();
		sb.dom.find("#googleContactListContainer").find("#selectAll").show();
   }
   
   function _setUpGoogleContactEvent(){
	   sb.dom.find(this).click(_googleContactClicked);	   
	   sb.dom.find(this).parent().find(".googleContactRemove").click(_googleContactRemoveClicked);
   }

   
   function _googleContactClicked(e){
	   if(sb.dom.find(this).hasClass("googleContactSelected")){
		   _addInvitations(sb.dom.find(this), true);
	   }else{
		   sb.dom.find(this).addClass("googleContactSelected");
		   sb.dom.find(this).find(".selected").removeClass("nd");
		   sb.dom.find(this).find("#contactName").addClass("nd");
		   sb.dom.find(this).find("#contactEmail").addClass("nd");
		   sb.dom.find(this).parent().find(".googleContactRemove").show();

	   }
   }
   
   function _googleContactRemoveClicked(e){
	   sb.dom.find(this).fadeOut();
	   sb.dom.find(this).parent().find(".googleContact").toggleClass("googleContactSelected");
	   sb.dom.find(this).parent().find(".googleContact").find(".selected").toggleClass("nd");
	   sb.dom.find(this).parent().find(".googleContact").find("#contactName").toggleClass("nd");
	   sb.dom.find(this).parent().find(".googleContact").find("#contactEmail").toggleClass("nd");	   
   }
   
   function _googleContactSelected(){
	   sb.dom.find(this).addClass("googleContactSelected");
	   sb.dom.find(this).find(".selected").removeClass("nd");
	   sb.dom.find(this).find("#contactName").addClass("nd");
	   sb.dom.find(this).find("#contactEmail").addClass("nd");
	   sb.dom.find(this).parent().find(".googleContactRemove").show();	   
   }
   
   function _googleContactUnSelected(){
	   sb.dom.find(this).removeClass("googleContactSelected");
	   sb.dom.find(this).find(".selected").addClass("nd");
	   sb.dom.find(this).find("#contactName").removeClass("nd");
	   sb.dom.find(this).find("#contactEmail").removeClass("nd");
	   sb.dom.find(this).parent().find(".googleContactRemove").hide();
   }
   
   function _renderViewWithGoogleContacts(){
	   var windowHeight = sb.dom.find(window).height();
	   var pageHeaderHeight = sb.dom.find(".welcomeHeader").height();
	   sb.dom.find("#authorize-button").hide();
	   var gContactsTotalHeight = windowHeight - pageHeaderHeight - 50;
	   sb.dom.find("#GContacts").css("max-height", gContactsTotalHeight);
	   sb.dom.find("#googleContactListContainer").css("max-height", gContactsTotalHeight);
	   var gContactsListHeight = gContactsTotalHeight - sb.dom.find("#googleContactListContainer").find("#gglContactHdr").height() - sb.dom.find("#googleContactListContainer").find("#gglContactFtr").height();
	   sb.dom.find("#googleContactListDiv").css("max-height", gContactsListHeight);
	   sb.dom.find("#GContacts").show();
	   sb.dom.find(".niceScroll").niceScroll({cursorcolor:"#ffffff"});
	   panelWidget.find(".googleContact").each(_setUpGoogleContactEvent); 

	   panelWidget.find("#googleContactListDiv").css("font-size", "2em");

   }
	function _makeGoogleApiCall(){	
		sb.utilities.get(contactApiUrl+"&access_token=" + googleAuthResult.access_token + "&max-results=700&v=3.0", null, _googleApiResponseReceived);
	}
	
	function addContactToModel(entry, authResult){
		var contactName = null;
		var contactEmail = null;
		var pElement = null;
		var photoLink = null;
		var photoUrl = null;
		var errorElement = null;
		var showContact = true;
		var reason = null;

		showContact = true;
		//console.log(entry);
		try{
			if(entry.gd$email){    	    					
				contactEmail = entry.gd$email[0].address;
				if(contactEmail.split('@')[1].indexOf("gmail") > -1 ||
				   contactEmail.split('@')[1].indexOf("yahoo") > -1	||
				   contactEmail.split('@')[1].indexOf("google") > -1	||
				   contactEmail.split('@')[1].indexOf("rediff") > -1	||
				   contactEmail.split('@')[1].indexOf("aol") > -1	||
				   contactEmail.split('@')[1].indexOf("outlook") > -1 ||
				   contactEmail.split('@')[1].indexOf("aol") > -1	||
				   contactEmail.split('@')[1].indexOf("zoho") > -1	||
				   contactEmail.split('@')[1].indexOf("yandex") > -1	||
				   contactEmail.split('@')[1].indexOf("aimmail") > -1	||
				   contactEmail.split('@')[1].indexOf("icloud") > -1	||
				   contactEmail.split('@')[1].indexOf("myway") > -1){
					showContact = true;
				}else{
					showContact = false;
					reason = contactEmail;
				}
			}else{
				showContact = false;
				reason = "Email not there";
			}
			if(entry.gd$name && showContact){
				if(entry.gd$name.gd$fullName){
					contactName = entry.gd$name.gd$fullName.$t;	
				}else if(entry.gd$name.gd$givenName){
					contactName = entry.gd$name.gd$givenName.$t;
				}else{
					showContact = false;
					reason = "No Name available";
				}    	    					
			}else if(showContact){
				showContact = false;
				reason = "Full Name Not there..";
			}
			if(entry.link[0].gd$etag && showContact){
	    		photoLink = entry.link[0].href;
	    		photoUrl = photoLink+"&access_token="+authResult.access_token;
			}else if(showContact){
				photoUrl = relPathIn+"images/icons/googleuser.png";
			}
			
			if(showContact){	  
    			var googleContact = {
    					contactFullName: contactName,
    					contactEmail: contactEmail,
    					contactPhoto: photoUrl
    			};
    			googleContacts.push(googleContact);
			}else{
				;
			}
			sb.dom.find('#GContacts').append(pElement);
			sb.dom.find('#GContacts').show();
		}catch(err){
			errorElement = document.createElement('p');
			errorElement.innerHTML = err;
		}
	}
	function _selectAllButtonClickEvent(e){		
		sb.dom.find("#googleContactListContainer").find("#googleContactListDiv").find(".googleContact").each(_googleContactSelected);
		sb.dom.find(this).hide();
		sb.dom.find("#googleContactListContainer").find("#unselectall").show();
	}
	function _unSelectAllButtonClickEvent(e){		
		sb.dom.find("#googleContactListContainer").find("#googleContactListDiv").find(".googleContact").each(_googleContactUnSelected);
		sb.dom.find(this).hide();
		sb.dom.find("#googleContactListContainer").find("#selectAll").show();		
	}
	function _getGoogleAuthorizationConfirmation(e){
		   var getGAuthConfirmationDialog=sb.dom.find("#DeleteDocument-Confirm");
		   getGAuthConfirmationDialog.html(sb.dom.find("#jstmpl-Invitations-GAuthConfirmationDialog").html());
		   getGAuthConfirmationDialog.dialog({
			  resizable: false,
		   	  title: "PalPostr",
		   	  dialogClass: "opaque",
		   	  modal: true,
		   	  buttons: [
		   		{text: sb.dom.find("#jstemplate-OkLabel").html(), click: function(){_getGoogleAuthorization();sb.dom.find(this).dialog("close");}, class: "ab"},
		   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
		   	  ]
		   });
	}
	
	function _addInvitationsConfirm(e){
		_addInvitations(null, false);
	}
	   function _setupPanel2(input){
		   if(panelCreated){
			   sb.dom.find("#GContacts").find("#googleContactListContainer").show();
		   }else{
			   var contactListHtml = tmpl("tmpl-googleContactListContainer", null);
			   sb.dom.find("#GContacts").html(contactListHtml);
			   var windowHeight = sb.dom.find(window).height();
			   var pageHeaderHeight = sb.dom.find(".welcomeHeader").height();
			   var gContactsTotalHeight = windowHeight - pageHeaderHeight - 50;
			   sb.dom.find("#GContacts").css("max-height", gContactsTotalHeight);
			   sb.dom.find("#googleContactListContainer").css("max-height", gContactsTotalHeight);
			   var gContactsListHeight = gContactsTotalHeight - sb.dom.find("#googleContactListContainer").find("#gglContactHdr").height() - sb.dom.find("#googleContactListContainer").find("#gglContactFtr").height();
			   sb.dom.find("#googleContactListDiv").css("max-height", gContactsListHeight);
			   sb.dom.find("#googleContactListContainer").find("#selectAll").bind("click", _selectAllButtonClickEvent);
			   sb.dom.find("#googleContactListContainer").find("#unselectall").bind("click", _unSelectAllButtonClickEvent);
			   sb.dom.find("#GContacts").show();
			   panelWidget = sb.dom.find("#GContacts");
			   panelWidget.find("#authorize-button").click(_getGoogleAuthorizationConfirmation);
			   //panelWidget.find("#authorize-button").click(_mockGoogleApiResponseReceived);
			   panelWidget.find("#inviteeEmailList").prop("placeholder" , sb.dom.find("#jstmpl-Invitations-inviteeEmailList-placehoder").html());
			   confirmButton=panelWidget.find("#ConfirmButton");
			   cancelButton = panelWidget.find("#CancelButton");
			   confirmButton.on('click', _addInvitationsConfirm);
			   cancelButton.on('click', _closeInvitationPanel);			
			   inviteFriendsSuccessMessageElem = panelWidget.find("#inviteFriendsSuccessMessage");
			   inviteFriendsFailureMessageElem = panelWidget.find("#inviteFriendsFailureMessage");
			   inviteFriendsSuccessMessageElem.hide();
			   inviteFriendsFailureMessageElem.hide();
			   panelCreated = true;
		   }
	   }
	   
   function _setupPanel(authResult){
	   if(authResult && !authResult.error){
	       makeApiCall();		   
	   }
	   else{
	       panelWidget = sb.dom.find("#InviteFriends");
		   panelWidget.find("#invitationmessage").prop("placeholder" , sb.dom.find("#jstmpl-Invitations-invitationmessage").html());
		   panelWidget.find("#invitationmessage").prop("value" , sb.dom.find("#jstmpl-Invitations-invitationmessage").html());
		   panelWidget.find("#inviteeEmailList").prop("placeholder" , sb.dom.find("#jstmpl-Invitations-inviteeEmailList-placehoder").html());
		   
		   confirmButton = panelWidget.find("#invitationConfirmButton");
		   cancelButton = panelWidget.find("#invitationCancelButton");
		   doneButton = panelWidget.find("#invitationDoneButton");
		   inviteFriendsSuccessMessageElem = panelWidget.find("#inviteFriendsSuccessMessage");
		   inviteFriendsFailureMessageElem = panelWidget.find("#inviteFriendsFailureMessage");
		   inviteFriendsSuccessMessageElem.hide();
		   inviteFriendsFailureMessageElem.hide();
		   confirmButton.html(sb.dom.find("#jstmpl-Invitations-invitationConfirmButton").html());
		   cancelButton.html(sb.dom.find("#jstmpl-Invitations-invitationCancelButton").html());
		   doneButton.html(sb.dom.find("#jstmpl-Invitations-invitationDoneButton").html());
		   confirmButton.on('click', _addInvitations);
		   cancelButton.on('click', _closeInvitationPanel);
		   doneButton.on('click', _closeInvitationPanel);
		   panelWidget.dialog({
			  position: {my: "center", at: "center", of: window},
			  height: window.innerHeight,
			  modal: true,
			  width: "75%",
			  title: sb.dom.find("#jstmpl-Invitations-title").html(),
		   });
		   setupPanel = true;		   
	   }
   }
   
   return{
	   init:function() {
       	try{       		
       		Core.subscribe('addInivitation', _setupPanel2);
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			console.log(counter);
   			console.log("Module destroyed");
   		}	   
     }
};