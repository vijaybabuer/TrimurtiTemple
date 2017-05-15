var mediaActionController = function(sb, input){
	var relPathIn=input.relPath, elemHandle=input.elemHandle, highlightButtonList = null, addButtonList = null, deleteButtonList = null, hideCaptionButtonList = null;
      
   function _uiButtonMouseOver(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
   
   function _uiButtonMouseOut(e){
	   sb.dom.find(this).toggleClass("ui-btn-b");
	   sb.dom.find(this).find(".label").toggleClass("cw");
   }
      
   function _HighlightButtonClicked(){
	   console.log('highlight clicked..' + sb.dom.find(this).attr('id'));
   }
   function _setHandlerOnHighlightButton(){
	   sb.dom.find(this).bind('click', _HighlightButtonClicked);
   }
   
   function _AddButtonClicked(e){
	   console.log('_setHandlerOnAddButton clicked..' + sb.dom.find(this).attr('id'));
	   var elementId = e.currentTarget.id.split("-");
	   var mediaAlbumDocumentId = elementId[1];
	   var mediaAlbumDocumentTypeCd = elementId[2];
	   if(mediaAlbumDocumentId != '0' && mediaAlbumDocumentId != undefined && mediaAlbumDocumentId != null){
		   Core.publish("addPictureFromDevice",{documentid: mediaAlbumDocumentId, documenttype: mediaAlbumDocumentTypeCd});
	   }
   }
   function _setHandlerOnAddButton(){
	   sb.dom.find(this).bind('click', _AddButtonClicked);
   }
   
   function _DeletePhotoConfirmed(pageid){
	   console.log('_setHandlerOnDeleteButton clicked..' + sb.dom.find(this).attr('id'));


		try{
			sb.utilities.serverDelete(relPathIn+"photo/"+pageid+"?mediaType=json",null,_notifyAndAct);
		}catch(err){
			console.log(err);
			Core.publish("displayMessage",{message: "The request could not be sent to the server. Please try again later.", messageType: "alert-failure"});
		}
   }
   
   function _DeleteButtonClicked(e){
		var pgInfo=e.currentTarget.id.split("-");
		var pageid=pgInfo[1];
		
	   var deletePhotoDialog=sb.dom.find("#DeleteDocument-Confirm");
	   deletePhotoDialog.html(sb.dom.find("#jstemplate-mediaActionController-confirmPhotoDelete").html());
	   deletePhotoDialog.dialog({
		  resizable: false,
	   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
	   	  dialogClass: "opaque",
	   	  modal: true,
	   	  buttons: [
	   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_DeletePhotoConfirmed(pageid);sb.dom.find(this).dialog("close");}, class: "ab"},
	   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
	   	  ]
	   });
	   
   }
   
	function _notifyAndAct(input){
		if(input.antahRequestStatus == "SUCCESS"){
			window.alert("The page was deleted successfully. We will refresh album for you.");
			refreshPage();
		}else{
			window.alert("This Page could not be removed. Please try again later. ");
		}
		
	}
	
	   function refreshPage(){
		   setTimeout(sb.utilities.pageReload, 1000);
	   }
	
   function _setHandlerOnDeleteButton(){
	   sb.dom.find(this).bind('click', _DeleteButtonClicked);
   }
   
   function _HideCaptionButtonClicked(){
	   console.log('_setHandlerOnHideCaptionButton clicked..' + sb.dom.find(this).attr('id'));
   }
   function _setHandlerOnHideCaptionButton(){
	   sb.dom.find(this).bind('click', _showHideAllMediaActionPanel);	   
   }
   
   function _showHideMediaActionPanel(){
	   sb.dom.find(this).slideToggle();
   }
   
   function _showHideAllMediaActionPanel(e){
	   var slideShowCurrentIndex=myAlbumView.getPos();
	   myAlbumView.slide(slideShowCurrentIndex, 0);
	   var mediaActionPanelList = sb.dom.find('.mediaActionPanel');	   
	   mediaActionPanelList.each(_showHideMediaActionPanel);
	   mediaActionPanelList = null;
   }
   
	function _setDraggable(){
		sb.dom.find(this).draggable({containment: "parent"});
	}
	
	function _receiveAlbumUpdatePublish(input){
		try{
			refreshPage();
		}catch(err){
			serverLog(err);
		}
	}
	
   function _initializeHandlers(){
		highlightButtonList.each(_setHandlerOnHighlightButton);
   		addButtonList.each(_setHandlerOnAddButton);
   		deleteButtonList.each(_setHandlerOnDeleteButton);
   		hideCaptionButtonList.each(_setHandlerOnHideCaptionButton);
   		var mediaActionPanelList = sb.dom.find('.mediaActionPanel');	  
 	    mediaActionPanelList.each(_setDraggable);
 	   mediaActionPanelList=null;
   		sb.dom.find('.mediaPanelShowHideButton').bind('click', _showHideAllMediaActionPanel);
   		sb.dom.find('.sharePageButton').bind('click', _showHideAllMediaActionPanel);
   }
   return{
	   init:function() {
       	try{
       			sb.utilities.trace('initializing module: mediaController'); 
       			
       			highlightButtonList = sb.dom.find('.hilite');
       			addButtonList = sb.dom.find('.addmedia');
       			deleteButtonList = sb.dom.find('.rmpic');
       			hideCaptionButtonList = sb.dom.find('.hidecaption');
       			_initializeHandlers();
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