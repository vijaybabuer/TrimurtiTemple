var siteLogo = function(sb, input){
	var htmlBody = sb.dom.find(input.elemHandle), elemHandleIn=input.elemHandle, relPathIn=input.relPath;

   function _uiButtonMouseOver(e){
	   if(!sb.dom.find(this).hasClass('noeffect')){
		   sb.dom.find(this).toggleClass("ui-btn-b");
		   sb.dom.find(this).find(".label").toggleClass("cw");
	   }
   }
   
   function _uiButtonMouseOut(e){
	   if(!sb.dom.find(this).hasClass('noeffect')){
		   sb.dom.find(this).toggleClass("ui-btn-b");
		   sb.dom.find(this).find(".label").toggleClass("cw");
	   }
   }
   
   function _uiButtonAddMessageReceived(message){
	   sb.dom.find(message.elemId).find(".ui-btn").bind("moverover", _uiButtonMouseOver);
	   sb.dom.find(message.elemId).find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
   }
   return{
	   init: function() {
       	try{
				htmlBody.show();
				sb.dom.find(".timeago").timeago();
				sb.dom.find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
				sb.dom.find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
				Core.subscribe('uibtnadded', _uiButtonAddMessageReceived);
       	}catch(err){
       		sb.utilities.log("Error Initializing siteLogo Module : " + err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace(counter);
   			sb.utilities.trace("Module destroyed");
   		}	   
     }
    };