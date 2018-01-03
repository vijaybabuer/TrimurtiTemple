var albumsController = function(sb, input){
	var albuminfo=null, relPathIn=input.relPath, documentid=null, documenttype=null, albumcontainer=null, picturecontainer=null, pictures=null, thumnailhtmltemplate=null, loadingHtml=null, thumnailhtml=null;
	
	function _addPics(e){
	 try{
		albuminfo=e.currentTarget.id.split("-");
		documentid=albuminfo[1];
		documenttype=albuminfo[2];
		if(documentid != '0'){
			Core.publish("addPictureFromDevice",{documentid: documentid, documenttype: documenttype});
		}else{
			if(documenttype == 'PROFPICS'){
				Core.publish("addAlbum",{documenttype: documenttype, documentname: ''});
			}
		}
	 }
	 catch(err){
		 serverLog(err);
	 }
		
	}

	function _receivePublish(input){
		_loadTemplates();
		try{
				if(input.actioncode == "UPDATE"){
					_paintPictures(input);
				}
		}catch(err){
			serverLog(err);
		}
	}
	
	function _paintProfilePictures(input){
		albumcontainer=sb.dom.find('#album-'+input.documentid+'-'+input.documenttype);
		picturecontainer = albumcontainer.find(".albumpictures");
		picturecontainer.append(loadingHtml);
		_getPicturesFromServer(input);
		
	}
	
	function _paintPictures(input){
		if(input.documenttype == 'PROFPICS'){
			albumcontainer=sb.dom.find("#profileContainer").find("#userProfileCard").find("#album-"+input.documentid+"-"+input.documenttype);
		}else{
			albumcontainer=sb.dom.find("#createStory").find("#storyMedia").find("#album-"+input.documentid+"-"+input.documenttype);
		}
		picturecontainer = albumcontainer.find(".albumpictures");
		picturecontainer.append(loadingHtml);
		_getPicturesFromServer(input);
		

	}
	
	function _paintAlbumPictures(data){
		//Update picture list.
		try{
		albumcontainer.find("#pictureLoading").remove();
		picturecontainer.html("");
		if(data.documentPageIDList){
			for(var i=0; i<data.documentPageIDList.length; i++){
				thumnailhtml = thumnailhtmltemplate;
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentPageIDList[i]);
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentPageIDList[i]);
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentPageIDList[i]);	
				
				
				thumnailhtml=thumnailhtml.replace("pictureurl",relPathIn+"tnphoto1.pvt/"+data.documentPageIDList[i]+"?mediaType=jpeg");
				picturecontainer.append(sb.dom.wrap(thumnailhtml));
			}
		}
		albumcontainer.show();		
		}catch(e){alert(e);};
	}
	
	function _loadingPictureError(){
		serverLog("albumsController.js -- Error while loading picture for album " + err);
		albumcontainer.find("#pictureLoading").remove();
	}
	
	function _getPicturesFromServer(input){
		try{
			sb.utilities.get("galb/"+input.documentid+".100?mediaType=json", null, _paintAlbumPictures);
		}catch(err){
			serverLog(err);
		}
		
	}
	   function serverLog(err){
		  alert("Error Message From Module - Albums Controller : " + err);
	   }
	   
	   function _storyItemAddedReceived(message){
		   sb.dom.find(message.storyItemDivId).find('.addpics').bind('click', _addPics);
	   }
	   
   function _loadTemplates(){
	   		try{
       		thumnailhtmltemplate=sb.dom.find("#template-albumpicturethumbnail").html();
       		loadingHtml=sb.dom.find("#template-loading").html();

			}catch(er){alert(er);}
	}
   return{
	   init:function() {	   
       	try{
       		Core.subscribe('albumUpdate',_receivePublish);
       		Core.subscribe("newStoryAdded", _storyItemAddedReceived);
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