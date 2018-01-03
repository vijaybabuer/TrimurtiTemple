var headerController = function(sb, input){
	var htmlBody = sb.dom.find(input.elemHandle), relPathIn=input.relPath, newButton=null, newButtonToolTip=null, newButtonToolTipHtml=null, welcomeMenuBar=null, welcomeMenuBarHtml=null, welcomeMenuBarToolTip = null;
   
	function _newButtonClick(e){
/*		e.preventDefault();
		Core.publish('addInivitation', null);*/
	}
	   function _uiButtonMouseOver(e){
		   sb.dom.find(this).toggleClass("ui-btn-b");
		   sb.dom.find(this).find(".label").toggleClass("cw");
	   }
	   function _uiButtonMouseOut(e){
		   sb.dom.find(this).toggleClass("ui-btn-b");
		   sb.dom.find(this).find(".label").toggleClass("cw");
	   }
	   function _newSignboardButtonClickEvent(e){
		   Core.publish("createSignboard", null);
	   }
	   function _newTabloidButtonClickEvent(e){
		   Core.publish("createTabloid", null);
	   }
	   function _renderTabsMessageReceived(data){
  			sb.dom.find("#rp").tabs({
   				heightStyle: "content"
   			});
   			sb.dom.find("#mobile-tabs").tabs({
   				heightStyle: "content"
   			});		
   			sb.dom.find("#rp").fadeIn();
	   }
	   
	   function _newMessageButtonClickEvent(e){
		   Core.publish('newMessageButtonClick', null);
	   }
	   
	   function _addPhotosButtonClickEvent(e){
		   Core.publish('addAlbumButtonClick', null);
	   }
   return{
	   init:function() {
       	try{	
       			//Module Initializing
       			newButton=htmlBody.find("#newButton");
       			
       			newButtonToolTipHtml=sb.dom.find("#jstemplate-headerControllerNewButtonToolTip").html();
       			newButtonToolTip = sb.dom.wrap(newButtonToolTipHtml);
       			newButtonToolTip.find(".ui-btn").bind("mouseover", _uiButtonMouseOver);
       			newButtonToolTip.find(".ui-btn").bind("mouseout", _uiButtonMouseOut);
       			newButtonToolTip.find('#newSignboardButton').bind('click', _newSignboardButtonClickEvent);
       			newButtonToolTip.find('#newTabloidButton').bind('click', _newTabloidButtonClickEvent);
     		   newButton.data('powertipjq', newButtonToolTip);
     		   
     		  newButton.powerTip({
    			  placement: 's',
    			  mouseOnToPopup: true,
    			  smartPlacement: false,
    			  offset: 0
    		   });     
     		  
     		  newButton.show();
       			
     			welcomeMenuBar=sb.dom.find("#welcomeHeaderMenuBar");
       			if(welcomeMenuBar){
       				welcomeMenuBarHtml = sb.dom.find("#jstemplate-welcomeHeaderMenuBar").html();
       				welcomeMenuBarToolTip = sb.dom.wrap(welcomeMenuBarHtml);
       				welcomeMenuBarToolTip.find('#newSignboardButton').bind('click', _newSignboardButtonClickEvent);
       				welcomeMenuBarToolTip.find('#newTabloidButton').bind('click', _newTabloidButtonClickEvent);   
       				welcomeMenuBarToolTip.find('#newMessageButton').bind('click', _newMessageButtonClickEvent);   
       				welcomeMenuBarToolTip.find('#addPhotosButton').bind('click', _addPhotosButtonClickEvent);   
       				welcomeMenuBar.data('powertipjq', welcomeMenuBarToolTip);
       				welcomeMenuBar.powerTip({
        			  placement: 's',
        			  mouseOnToPopup: true,
        			  smartPlacement: true,
        			  offset: 0
        		   }); 
       			}

       			//Event Setup
       			newButton.on('click',_newButtonClick);
       			htmlBody.fadeIn();
       			sb.dom.find("#rp").hide();
       			Core.subscribe('renderTabs', _renderTabsMessageReceived);
       				    		
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			sb.utilities.trace("Module destroyed");
   		}	   
     }
    };