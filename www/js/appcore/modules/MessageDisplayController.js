var messageDisplayController = function(sb, input){
	var htmlBody = sb.dom.find("#message-dialog"), messageType=null, timeout=null, controllerInput=null;
	     
   function _showMessage(input){
	   try{
	   controllerInput=input;
		   if(controllerInput.messageType == 'alert-success' ||  controllerInput.messageType == 'alert-failure'){
				navigator.notification.alert(controllerInput.message, null, input.appname, 'Ok, Thanks');			   
		   }else{
				navigator.notification.alert(controllerInput.message, null, input.appname, 'Ok, Thanks');
		   }
	   }catch(err){
		   serverLog(err);
	   }
   }
   

   
   function serverLog(err){
	   sb.utilities.log("Error Message From Module - MessageDisplayController : " + err);
   }
   return{
	   init:function() {
       	try{
	    		Core.subscribe('displayMessage', _showMessage);
       	}catch(err){
       		serverLog(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   		  serverLog("Module destroyed");
   		}	   
     }
    };