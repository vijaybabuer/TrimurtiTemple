var DocumentRoleController = function(sb, input){
	var relPathIn=input.relPath, roleControllerModuleHtml=null, roleControllerModule=null, readButtonList=null, writeButtonList=null, returnButtonList=null, addReadButtonList=null, addWriteButtonList=null, addReturnButtonList=null,
	addAllContactsAsSubscribersButtonList = null, returnAllSubscribersButtonList = null, addRoleButtonList = null;	 
	
   function _setupYesButtonMoustOver(button){
	   sb.dom.find(button).bind("mouseover", _yesButtonMouseOver);
	   sb.dom.find(button).bind("mouseout", _yesButtonMouseOut);	   
   }
   function _setupNoButtonMoustOver(button){
	   sb.dom.find(button).bind("mouseover", _noButtonMouseOver);
	   sb.dom.find(button).bind("mouseout", _noButtonMouseOut);	   
   }
   
   function _yesButtonMouseOver(e){
	   sb.dom.find(this).toggleClass("blg");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _yesButtonMouseOut(e){
	   sb.dom.find(this).toggleClass("blg");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _noButtonMouseOver(e){
	   sb.dom.find(this).toggleClass("blr");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _noButtonMouseOut(e){
	   sb.dom.find(this).toggleClass("blr");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _readButtonEventSetup(){
	   sb.dom.find(this).bind('click', _readButtonClick);
	   _setupYesButtonMoustOver(this);
   }
   
   function _writeButtonEventSetup(){
	   sb.dom.find(this).bind('click', _writeButtonClick);
	   _setupYesButtonMoustOver(this);
   }
   
   function _returnButtonEventSetup(){
	   sb.dom.find(this).bind('click', _returnButtonClick);
	   _setupNoButtonMoustOver(this);
   }
   
   function _addReadButtonEventSetup(){
	   sb.dom.find(this).bind('click', _addReadButtonClick);
	   _setupYesButtonMoustOver(this);
   }
	   
   function _addWriteButtonEventSetup(){
	   sb.dom.find(this).bind('click', _addWriteButtonClick);
	   _setupYesButtonMoustOver(this);
   }
   
   function _addReturnButtonEventSetup(){
	   sb.dom.find(this).bind('click', _addReturnButtonClick);
	   _setupNoButtonMoustOver(this);
   }
   
   function _addRoleButtonEventSetup(){
	   sb.dom.find(this).bind('click', _addRoleButtonClick); 
   }
   
   function _addAllContactsButtonEventSetup(){
	   sb.dom.find(this).on('click', _addAllContactsButtonClick);	   
   }
   
   function _returnAllSubscribersButtonEventSetup(){
	   sb.dom.find(this).on('click', _returnAllSubscribersButtonClick);	   
   }
   
   function _addAllContactsButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  
			sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, addAllContactsAsSubscribers: true}, _addAllContactsAsSubscribersRespReceived)
			.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
			.error(function(data){
				Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
			});
   }
   
   function _returnAllSubscribersButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  
			sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, deleteAllSubscribers: true}, _deleteAllSubscribersRespReceived)
			.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
			.error(function(data){
				Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
			});
   }
   
   function _addAllContactsAsSubscribersRespReceived(txnResponse){
	   if(txnResponse.antahRequestStatus == "SUCCESS"){
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-AllContactsSubcriberAdd-Success").html(), messageType: "success"});
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-AllContactsSubcriberAdd-Failure").html(), messageType: "failure"});
	   }
   }
   
   function _deleteAllSubscribersRespReceived(txnResponse){
	   if(txnResponse.antahRequestStatus == "SUCCESS"){
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-DeleteAllSubscribers-Success").html(), messageType: "success"});
	   }else{
		   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-AllContactsSubcriberAdd-Failure").html(), messageType: "failure"});
	   }
   }
   
   
   function _documentRoleResponseReceived(documentRoleResponse){
	   if(documentRoleResponse.antahRequestStatus=='SUCCESS'){
		   var returnDocId = documentRoleResponse.documentRoleItem.documentId;
		   var returnUserName = documentRoleResponse.documentRoleItem.contactResponse.contact.username;
		   var returnRole=documentRoleResponse.documentRoleItem.documentRoleTypeCd;
		   var returnStatus=documentRoleResponse.documentRoleItem.documentRoleStatusCd;
		   Core.publish("displayMessage",{message: sb.dom.find('#jstemplate-DocumentRoleRequest-'+returnStatus+"-"+returnRole).html(), messageType: "success"});
		   var button = sb.dom.find('#'+returnRole+'-'+returnDocId+'-'+returnUserName); 
		   setTimeout(function(){
			   button.fadeOut();
			   button.remove();
				addReadButtonList=sb.dom.find('.addRead');
				addWriteButtonList=sb.dom.find('.addWrite');
				if(addReadButtonList.length == 0 && addWriteButtonList.length == 0){
					sb.dom.find("#ShareRequestActionPanel").fadeOut();
				}			   
		   }, 1000);
		   
	   }else{
		   Core.publish("displayMessage",{message: "There was a problem processing your request. Please try again later.", messageType: "failure"});
		   var returnDocId = documentRoleResponse.documentRoleItem.documentId;
		   var returnUserName = documentRoleResponse.documentRoleItem.contactResponse.contact.username;
		   var returnRole=documentRoleResponse.documentRoleItem.documentRoleTypeCd;
		   var button = sb.dom.find('#'+returnRole+'-'+returnDocId+'-'+returnUserName); 
		   button.animate({backgroundColor: "#FF4D4D"});
	   }
	   

		
   }
   
   function _deleteDocumentRoleTransactionReceive(documentRoleResponse){
	   if(documentRoleResponse.antahRequestStatus=='SUCCESS'){
		   var returnDocId = documentRoleResponse.documentRoleItem.documentId;
		   var returnUserName = documentRoleResponse.documentRoleItem.contactResponse.contact.username;
		   var returnRole=documentRoleResponse.documentRoleItem.documentRoleTypeCd;
		   var returnStatus=documentRoleResponse.documentRoleItem.documentRoleStatusCd;		   
		   Core.publish("displayMessage",{message: sb.dom.find('#jstemplate-DeleteDocumentRoleRequestSuccess').html(), messageType: "success"});
		   var button = sb.dom.find('#'+returnRole+'-'+returnDocId+'-'+returnUserName); 		   
		   setTimeout(function(){
			   button.parentsUntil(this, '.docRoleItem').remove();
				addReadButtonList=sb.dom.find('.addRead');
				addWriteButtonList=sb.dom.find('.addWrite');
				if(addReadButtonList.length == 0 && addWriteButtonList.length == 0){
					sb.dom.find("#ShareRequestActionPanel").fadeOut();
				}
		   }, 1000);
		   
	   }else{
		   Core.publish("displayMessage",{message: "There was a problem processing your request. Please try again later.", messageType: "failure"});
		   var returnDocId = documentRoleResponse.documentRoleItem.documentId;
		   var returnUserName = documentRoleResponse.documentRoleItem.contactResponse.contact.username;
		   var returnRole=documentRoleResponse.documentRoleItem.documentRoleTypeCd;
		   var button = sb.dom.find('#'+returnRole+'-'+returnDocId+'-'+returnUserName); 
		   button.animate({backgroundColor: "#FF4D4D"});
	   }
	   
		addReadButtonList=sb.dom.find('.addRead');
		addWriteButtonList=sb.dom.find('.addWrite');
		if(addReadButtonList.length == 0 && addWriteButtonList.length == 0){
			sb.dom.find("#ShareRequestActionPanel").fadeIn();
		}
   }
   
   function _readButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  var username = id.split('-')[2];
		  var roleStatus = 'UNAP';
		  var role='SV';
		  
			sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, username: username, roleType: role, roleStatus: roleStatus}, _documentRoleResponseReceived)
			.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
			.error(function(data){
				Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
			});	  
		  
	   }
   
   function _writeButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  var username = id.split('-')[2];
		  var roleStatus = 'UNAP';
		  var role='SU';
		  
			sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, username: username, roleType: role, roleStatus: roleStatus}, _documentRoleResponseReceived)
			.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
			.error(function(data){
				Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
			});
   }
   
   function _returnButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split[1];
		  var username = id.split[2];
		  var roleStatus = 'AC';
		  var role= id.split('-')[0];
		   try{
			   var deleteRoleUri=relPathIn+'documentRole.pvt/'+docId+'-'+username+'-'+role+'?mediaType=json';
			   sb.utilities.serverDelete(deleteRoleUri,null,_deleteDocumentRoleTransactionReceive);
		   }catch(err){
				   Core.publish("displayMessage",{message: "There was a problem process your request. Please try again later", messageType: "failure"});
		   }
		   
		   
		  
   }
   
   function _addReadButtonClick(e){
	  var id = sb.dom.find(this).attr("id");
	  var docId = id.split('-')[1];
	  var username = id.split('-')[2];
	  var roleStatus = 'AC';
	  var role='SV';
	  
		sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, username: username, roleType: role, roleStatus: roleStatus}, _documentRoleResponseReceived)
		.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
		.error(function(data){
			Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
		});	  
   }
	   
   function _addWriteButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  var username = id.split('-')[2];
		  var roleStatus = 'AC';
		  var role='SU';
		  
			sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, username: username, roleType: role, roleStatus: roleStatus}, _documentRoleResponseReceived)
			.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
			.error(function(data){
				Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
			});	  
   }
   
   function _addReturnButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  var username = id.split('-')[2];
		  var roleStatus = 'AC';
		  var role= id.split('-')[0];
		   try{
			   var deleteRoleUri=relPathIn+'documentRole.pvt/'+docId+'-'+username+'-'+role+'?mediaType=json';
			   sb.utilities.serverDelete(deleteRoleUri,null,_deleteDocumentRoleTransactionReceive);
		   }catch(err){
				   Core.publish("displayMessage",{message: "There was a problem process your request. Please try again later", messageType: "failure"});
		   }
   }
   
   function _addRoleButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split('-')[1];
		  var username = id.split('-')[2];
		  var roleStatus = id.split('-')[3];
		  var role= id.split('-')[0];

		sb.utilities.postV2(relPathIn+"documentRole.pvt?mediaType=json",{documentId: docId, username: username, roleType: role, roleStatus: roleStatus}, _documentRoleResponseReceived)
		.success(function(){console.log("Document Role Add Request sent"); sb.dom.find(this).html(sb.dom.find("#jstemplate-ProcessingMessage").html());})
		.error(function(data){
			Core.publish("displayMessage",{message: "Operation could not be completed. Please try again later.", messageType: "failure"});
		});	
   }
   function _addReturnAllButtonClick(e){
		  var id = sb.dom.find(this).attr("id");
		  var docId = id.split[1];

   }
	   
   function _loadReadWriteRequestsCommandReceived(input){
	   var username=input.username;
	   
   }
   
   function _hideEditSharing(){
	   sb.dom.find(this).find('.editSharing').hide();
   }
   
   function _showEditSharing(e){
	   sb.dom.find(this).find('.editSharing').show();
   }
   
   function _closePanel(e){
	   sb.dom.find(this).parentsUntil(this, '.closablePanel').fadeOut();
   }
   
   function _initializeRoleControllerModule(){
		roleControllerModuleHtml=sb.dom.find('#template-documentShareRequest').html();
		sb.dom.find(input.parentDivId).prepend(roleControllerModuleHtml);
		
		try{
		readButtonList=sb.dom.find('.read');
		writeButtonList=sb.dom.find('.write');
		returnButtonList=sb.dom.find('.return');

		addReadButtonList=sb.dom.find('.addRead');
		addWriteButtonList=sb.dom.find('.addWrite');
		addReturnButtonList=sb.dom.find('.addReturn');
		
		addRoleButtonList = sb.dom.find('.addRole');
		
		addAllContactsAsSubscribersButtonList = sb.dom.find(".shareToAllCurrentContacts");
		returnAllSubscribersButtonList = sb.dom.find(".unShareToAllCurrentContacts");
		
		readButtonList.each(_readButtonEventSetup);
		writeButtonList.each(_writeButtonEventSetup);
		returnButtonList.each(_returnButtonEventSetup);
		
		addReadButtonList.each(_addReadButtonEventSetup);
		addWriteButtonList.each(_addWriteButtonEventSetup);
		addReturnButtonList.each(_addReturnButtonEventSetup);
		
		addRoleButtonList.each(_addRoleButtonEventSetup);
		
		addAllContactsAsSubscribersButtonList.each(_addAllContactsButtonEventSetup);
		returnAllSubscribersButtonList.each(_returnAllSubscribersButtonEventSetup);

		sb.dom.find('#closePanel').bind('click', _closePanel);
		sb.dom.find('#donePanel').bind('click', _closePanel);
		
		}catch(err){
			console.log(err);
		}
		if(addReadButtonList.length > 0 || addWriteButtonList.length > 0){
			sb.dom.find("#ShareRequestActionPanel").fadeIn();
		}
   }
      
   return{
	   init:function() {
       	try{
       			sb.utilities.trace('initializing module: DocumentController'); 
	    			    		
	    		//Return this book from all the current subscribers and writers.

	    		
	    		_initializeRoleControllerModule();
	    		
       			sb.dom.find('.docRoleItem').bind('mouseover', _showEditSharing);
       			sb.dom.find('.docRoleItem').bind('mouseout', _hideEditSharing);
       			//Subscriptions
	    		Core.subscribe('loadReadWriteRequests', _loadReadWriteRequestsCommandReceived);
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace("Module destroyed");
   		}	   
   }
};