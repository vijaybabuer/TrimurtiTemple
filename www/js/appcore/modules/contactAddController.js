var contactAddController = function(sb, input){
	var relPathIn=input.relPath, inputUserName= input.username;

   function _userRelAddResponseReceived(userRelResponse){
	   if(userRelResponse.txnStatus=="SUCCESS"){
		   var button = sb.dom.find("#"+userRelResponse.contactResponse.contact.username);
		   button.removeClass("ui-icon-clock");
		   button.addClass("ui-icon-check");
		   button.find(".label").html((sb.dom.find("#jstemplate-ProcessingSuccessMessage").html()));
		   setTimeout(function(){
			   button.fadeOut();
			   button.remove();
		   }, 1000);
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
	   }
	   
   }
   
   function _addContactButtonClickEvent(e){
	   var toUserName=e.currentTarget.id;
	   var invitationMessageElement = sb.dom.find(this).parents('.contactAddDiv').find('#AddContact-InviteRequest-'+toUserName);
	   var invitationMessage = null;
	   if(invitationMessageElement){
		   invitationMessage = invitationMessageElement.val();
	   }else{
		   invitationMessage = null;
	   }
	   console.log("invitationMessage" + invitationMessage);
	   sb.dom.find(this).removeClass("ui-icon-plus");
	   sb.dom.find(this).addClass("ui-icon-clock");
	   sb.dom.find(this).find('.label').html(sb.dom.find("#jstemplate-ProcessingMessage").html());
	   sb.dom.find(this).unbind('click',_addContactButtonClickEvent);
	   sb.utilities.postV2(relPathIn+'userrel?mediaType=json',{fromUserName: inputUserName, toUserName: toUserName, newRelType: "CONTACT", oldRelType: "", description: invitationMessage},_userRelAddResponseReceived);	   
   }
   

   
   function serverLog(err){
	   sb.utilities.log("Error Message From Module - MessageDisplayController : " + err);
   }

   

   
   return{
	   init:function() {
       	try{       	
       		console.log("Starting contact list controller..");
       		sb.dom.find(".addContactButton").bind("click",_addContactButtonClickEvent);
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