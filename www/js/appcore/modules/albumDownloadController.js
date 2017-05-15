var albumDownloadController = function(sb, input){
	var documentPageList = input.documentPageList, relPathIn = input.relPath, pictureNode=null;
	
	function _loadPictures(docPageList){
	 try{
		 sb.utilities.get(relPathIn+"photoV2/3178496",null,_paintPicture);
	 }
	 catch(err){
		 serverLog(err);
	 }
		
	}

	function _getPictureFromService(documentpageid){
		
	}
	
	function _paintPicture(picture){
		console.log("Received picture..");
		pictureNode = sb.dom.find("#photo-3178496");
		pictureNode.css("background-image", picture);
		pictureNode.css("background-size", "auto auto");
		
	}
	
	
	   function serverLog(err){
		   sb.utilities.log("Error Message From Module - Album Download Controller : " + err);
	   }
	   
   return{
	   init:function() {
       	try{
       		_loadPictures(documentPageList);
       	}catch(err){       		
       		serverLog(err);
       	}
       },
   	  destroyModule:  function() { 
   			console.log(counter);
   			console.log("Module destroyed");
   		}	   
     };
    };