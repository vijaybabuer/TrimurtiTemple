var photoUploadController = function(sb, input){
	var containerPanelBody = null, uploadCancelBtn=null, fileuploaderror=null, appPicInput=null, relPathIn=input.relPath, currentAlbumDivId = null, myComp=null, webCam=null, profPicDevice = null, profPicCam = null,
		selectFilesBtn=null, uploadStartBtn=null, photoUploadMessageDiv=null, uploadSuccessMessage='<span class="p">Upload successful.</span>', uploadFailureMessage='<span class="br p">Upload failure</span>', uploadNumber = 0;
		uplPnlBody=null, currentSelection=null, webCamStartButton=null, webCamCaptureButton=null, webCamStopButton=null, webCamImageNode=null, webCamImage=null, WebCamPicSendBtn=null, containerElement='#uploadControllerPane',  thumnailhtmltemplate=sb.dom.find("#template-albumpicturethumbnail").html(), thumnailhtml=null, picturecontainer=null, deletePicHtml=null;   

	function _closeUploader(){
		console.log('close clicked..');
		try{
			if(currentSelection == 'webCam'){
				webCamStopButton.click();
			}else{
				uploadCancelBtn.click();
			}
			_publishUpdate();
		}catch(err){
			console.log(err);
		}
		
		containerPanelBody.hide();
		
	}
	
	function _showAddPicsButton(){
		sb.dom.find(this).fadeIn();
	}
	
	function _myComputerClicked(e){
		 _addPictureFromDevice(appPicInput);
	}
	function _webCamClicked(e){
		_addPictureFromWebCam(appPicInput);
	}
	function _ControllerStart(divId){
		if(divId && sb.dom.find(divId)){
			sb.dom.find(divId).find("#uploadControllerPane").remove();	
			currentAlbumDivId = divId;
			sb.dom.find("#createStory").find("#storyMedia").find(currentAlbumDivId).html(sb.dom.find('#template-uploadController').html());
			if(divId.split("-")[2] == 'PROFPICS'){
				sb.dom.find(".profpicturecapturediv").show();
			}
			containerPanelBody=sb.dom.find(currentAlbumDivId).find('#uploadControllerPane');			
			myComp=sb.dom.find("#createStory").find("#storyMedia").find('#myComp');
			webCam=sb.dom.find("#createStory").find("#storyMedia").find('#webCam');
			myComp.unbind('click',_myComputerClicked);
			webCam.unbind('click', _webCamClicked);
			myComp.bind('click',_myComputerClicked);
			webCam.bind('click', _webCamClicked);
			
			uplPnlBody=containerPanelBody.find('#panel-bdy');
			photoUploadMessageDiv=containerPanelBody.find('#panel-message');
			photoUploadMessageDiv.html('Please select photos');	
			photoUploadMessageDiv.append(sb.dom.find("#PhotoUploadController-ClickToRemove").html());
			uploadCancelBtn=containerPanelBody.find('#uploadCancelBtn');
			containerPanelBody.find('.closeBtn').bind('click',_closeUploader);			
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	function _ControllerStartForProfPics(divId){
		if(divId && sb.dom.find(divId)){
			sb.dom.find(".profpicturecapturediv").show();			
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	function _addAlbumPictures(data){	
		appPicInput=data;
		//Publish Album Add
		_publishAdd();
		
		_addPictureFromDevice(appPicInput);
	}
	
	function _addAlbumPicturesSuccess(data){
			sb.dom.find('#storyMedia').find('#attachPictures').find('i').removeClass('fa-cog fa-spin fa-fw');
			sb.dom.find('#storyMedia').find('#attachPictures').find('i').addClass('fa-paperclip');			
		appPicInput=data;
		_publishAdd();
		if(data.documenttype == 'PVTSTYPIC'){
			_ControllerStart("#album-"+data.documentid+"-"+data.documenttype);			
			sb.dom.find(myComp).fadeIn();
			sb.dom.find(webCam).fadeIn();
		}else if(data.documenttype == 'PROFPICS'){
			_ControllerStartForProfPics("#album-"+data.documentid+"-"+data.documenttype);	
			sb.dom.find("#changeProfilePicture").fadeOut();
			sb.dom.find("#changeProfilePictureFromGallery").fadeIn();
			sb.dom.find("#changeProfilePictureFromCamera").fadeIn();	
			sb.utilities.getUserInfo().userDetails.profilePictureAlbumId = data.documentid;
		}
	}
	function _errorInDocumentCreate(request, errorMessage, errorObj){
		Materialize.toast("Request " + JSON.stringify(request) + " " + JSON.stringify(errorMessage) + " " + JSON.stringify(errorObj), 2000);
	}
	
	function _addAlbum(input){
		try{		
		if(input.documenttype != null && input.documenttype != ""){
			sb.dom.find('#storyMedia').find('#attachPictures').find('i').removeClass('fa-paperclip');
			sb.dom.find('#storyMedia').find('#attachPictures').find('i').addClass('fa-cog fa-spin fa-fw');
			sb.utilities.postV2(relPathIn+"document.pvt?mediaType=json",{documenttype: input.documenttype, documentname: input.documentname}, _addAlbumPicturesSuccess,_errorInDocumentCreate);
		}else{
			photoUploadMessageDiv.html('There was problem creating album. Please try again later.');
			console.log('Album type was not provided. ');
		}
		}catch(err){
			Materialize.toast('Exception during Album Add : ' + err, 2000);
		}
	}

	function _saveWebCamPictureSuccess(data, success){
		if(data.txnStatus){
			if(appPicInput.documenttype == 'PVTSTYPIC'){
				if(data.txnStatus == "FAILED"){
					photoUploadMessageDiv.html('<span class="br p cw">Photo upload failed. Please try again later</span>');
				}else{
					photoUploadMessageDiv.html('<span class="br p">Photo upload failed. Please try again later</span>');
				}			
			}
		}else{
			if(appPicInput.documenttype == 'PVTSTYPIC'){
				photoUploadMessageDiv.html('<span class="p">Picture has been saved. For your security, you can view it once you post the message.</span>');
			}
			//_publishUpdate();
			_updateAlbumView(data);
			if(appPicInput.documenttype == 'PROFPICS'){
				sb.utilities.getUserInfo().userDetails.profilePictureId = data.documentpageid;
				Core.publish('refreshProfilePicture', null);
			}
		}
	}
	
	function _updateAlbumView(data){
		// new function
				picturecontainer = sb.dom.find('#album-'+appPicInput.documentid+'-'+appPicInput.documenttype).find(".albumpictures");
				thumnailhtml = thumnailhtmltemplate;
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentpageid);
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentpageid);
				thumnailhtml=thumnailhtml.replace("albumpicid",data.documentpageid);			
				thumnailhtml=thumnailhtml.replace("pictureurl",input.palpostrHost+"tnphoto1.pvt/"+data.documentpageid+"?mediaType=jpeg");
				picturecontainer.append(thumnailhtml);				
	}
	function _saveWebCamPictureError(request, errorMsg, errorObj){
		Materialize.toast(JSON.stringify(request) + " " + JSON.stringify(errorMsg) + " " +JSON.stringify(errorObj), 2000);
	}
	function uploadPhotoV2(imageData){
		uploadNumber = uploadNumber + 1;		
		var albumDivId = 'album-'+appPicInput.documentid+'-'+appPicInput.documenttype;
		var progressHtml = '<div class="progress" id="'+albumDivId+'-'+uploadNumber+'"><div class="determinate" style="width: 10%"></div></div>';
		sb.dom.find('#'+albumDivId).prepend(progressHtml);
		sb.utilities.postV2(relPathIn+'webcamphoto.pvt?mediaType=json',{photoUploadNumber: uploadNumber, albumId: appPicInput.documentid, albumtype: appPicInput.documenttype, timeStamp: "", photo: "", webCamPhoto: imageData}, _saveWebCamPictureSuccess, _saveWebCamPictureError);
		try{
		navigator.camera.cleanup();
		}catch(error){
			Materialize.toast(error, 2000);	
		}
	}
	
	function photoUploadProgress(progressEvent) {
		if (progressEvent.lengthComputable) {
			photoUploadMessageDiv.html(progressEvent.loaded + " " + progressEvent.total);
		} else {			
			photoUploadMessageDiv.html(loadingStatus.increment());
		}
	}
	
	function _updateAlbumView_FileUpload(responseString){
		var response = JSON.parse(responseString);
		var albumDivId = '#album-'+response.albumDocumentId+'-'+response.albumDocumentType+'-'+response.fileId;
		if(response.files && response.files.length > 0){
			sb.dom.find(albumDivId).find('.progress').remove();
			try{
			for(var i=0; i < response.files.length; i++){
				deletePicHtml = sb.dom.find("#jstemplate-photoUploadController-deleteDownloadPhoto").html();
				deletePicHtml = deletePicHtml.replace("albumpicid",response.files[i].documentPageId);
				deletePicHtml = deletePicHtml.replace("albumpicid",response.files[i].documentPageId);
				//alert(deletePicHtml);
				sb.dom.find(albumDivId).append(deletePicHtml);
			}
			}catch(e){
				Materialize.toast(e, 2000);	
			}
			/*for(var i=0; i < response.files.length; i++){
				picturecontainer = sb.dom.find('#album-'+appPicInput.documentid+'-'+appPicInput.documenttype).find(".albumpictures");
				thumnailhtml = thumnailhtmltemplate;
				thumnailhtml=thumnailhtml.replace("albumpicid", response.files[i].documentPageId);
				thumnailhtml=thumnailhtml.replace("albumpicid",response.files[i].documentPageId);
				thumnailhtml=thumnailhtml.replace("albumpicid",response.files[i].documentPageId);			
				thumnailhtml=thumnailhtml.replace("pictureurl",input.palpostrHost+"tnphoto1.pvt/"+response.files[i].documentPageId+"?mediaType=jpeg");
				picturecontainer.append(thumnailhtml);						
			}*/			
		}else{
			Materialize.toast("There was a problem uploading the media. Please try again.", 2000);	
		}

	}
	function uploadFilePhotoSuccess(successResponse){
		Materialize.toast("Media File Upload Success", 2000);
		if(successResponse.response.txnStatus){
			if(appPicInput.documenttype == 'PVTSTYPIC'){
				if(data.txnStatus == "FAILED"){
					photoUploadMessageDiv.html('<span class="br p cw">Photo upload failed. Please try again later</span>');
				}else{
					photoUploadMessageDiv.html('<span class="br p">Photo upload failed. Please try again later</span>');
				}			
			}
		}else{
			if(appPicInput.documenttype == 'PVTSTYPIC'){
				photoUploadMessageDiv.html('<span class="p">Picture has been saved. For your security, you can view it once you post the message.</span>');
			}
			//_publishUpdate();
			_updateAlbumView_FileUpload(successResponse.response);
			if(appPicInput.documenttype == 'PROFPICS'){
				sb.utilities.getUserInfo().userDetails.profilePictureId = data.documentpageid;
				Core.publish('refreshProfilePicture', null);
			}
		}		
	}
	
	function uploadFilePhotoFailure(response){
		Materialize.toast('there was a problem uploading file ' + JSON.stringify(response), 2000);
	}
	function uploadFilePhoto(fileName){
		uploadNumber = uploadNumber + 1;
		var albumDivId = 'album-'+appPicInput.documentid+'-'+appPicInput.documenttype;
		var progressHtml = '';
		if(!fileName.startsWith('file:')){
			progressHtml = '<div id="'+albumDivId+'-'+uploadNumber+'" style="text-align: center; max-width: 200px; float: left; margin: 2px;"><img src="file://'+fileName+'" height="150px;"/><div class="progress" ><div class="determinate" style="width: 0%; height: 10px;"></div></div></div>';
		}else{
			progressHtml = '<div id="'+albumDivId+'-'+uploadNumber+'" style="text-align: center; max-width: 200px; float: left; margin: 2px;"><img src="'+fileName+'" height="150px;"/><div class="progress" ><div class="determinate" style="width: 0%; height: 10px;"></div></div></div>';			
		}		
		sb.dom.find('#'+albumDivId).find('.albumpictures').prepend(progressHtml);	
		sb.utilities.uploadFilePhoto('fileUpload/'+appPicInput.documenttype+'/'+appPicInput.documentid+'/'+uploadNumber+'.pvt?mediaType=json', fileName, '#'+albumDivId+'-'+uploadNumber, uploadFilePhotoSuccess, uploadFilePhotoFailure);
	}
	function uploadPhoto1(imageURI) {
		try{
			//alert(imageURI);
     		window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
			//alert(imageURI + '-1' + fileEntry.fullPath);
			var fileMimeType = "image/jpeg";
			uploadFilePhoto(fileEntry.toURL());
        });
		}catch(e){
			Materialize.toast('uri problem ' + e, 2000);
		}
	}

	function uploadPhoto(imageURI) {
		//alert(imageURI);
		try{
			uploadFilePhoto(imageURI);
		}catch(e){
			Materialize.toast('uri problem ' + e, 2000);
		}
	}
	 
	 function _addPictureFromWebCam(input){
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhoto1, function(message) {
			 Materialize.toast('Get Picture Cancelled ' + message, 2000);
			 }, {
			 quality: 100,
			 destinationType: navigator.camera.DestinationType.FILE_URI,
			 sourceType: navigator.camera.PictureSourceType.CAMERA,
 			 mediaType: navigator.camera.MediaType.PICTURE
			 });
			//Create Pictures for album
			
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			//alert('Album ID was not provided. ');
		}
		}catch(err){
			Materialize.toast('Exception during add picture from device ' + err, 2000);
		}		 
	 }
	function _addPictureFromDevice(input){	
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhoto, function(message) {
			 Materialize.toast('Get Picture Cancelled ' + message, 2000);
			 }, {
			 quality: 100,
			 destinationType: navigator.camera.DestinationType.FILE_URI,
			 sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
 			 mediaType: navigator.camera.MediaType.ALLMEDIA
			 
			 });
			
			/*var options = {
				   maximumImagesCount: 10,
				   quality: 100
				  };
  
			window.imagePicker.getPictures(options).then(
				function(results) {
					for (var i = 0; i < results.length; i++) {
						uploadPhoto(results[i]);
					}
				}, function (error) {
					alert('Error: ' + error);
				});*/		
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			console.log('Album ID was not provided. ');
		}
		}catch(err){
			Materialize.toast('Exception during add picture from device ' + err, 2000);
		}
	}
	

	
	function _publishUpdate(){
		Core.publish('albumUpdate',{documentid: appPicInput.documentid, documenttype: appPicInput.documenttype, actioncode: 'UPDATE'});
	}
	
	function _publishAdd(){
		Core.publish('albumUpdate',{documentid: appPicInput.documentid, documenttype: appPicInput.documenttype, actioncode: 'ADD'});
		
	}

	   function _photoDeleteResponseReceived(data){
		   if(data.antahRequestStatus == "SUCCESS"){
			   sb.dom.find("#thumbNailPreview-"+data.antahResponseMessage).remove();
			   sb.dom.find("#deleteLink-"+data.antahResponseMessage).parent().remove();
			   if(data.albumDocumentType == 'PROFPICS'){
				   if(data.profilePictureUpdate && !data.noProfilePicture){
						Core.publish('refreshProfilePicture', null);
				   }else if(data.profilePictureUpdate && data.noProfilePicture){
						Core.publish('removeProfilePicture', null);
				   }
			   }
		   }else{
			   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		   }
	   }
	   
	   function _deleteDownloadPhotoClicked(data){
		   sb.utilities.serverDelete(relPathIn+"photo/"+data.photoId+"?mediaType=json",null,_photoDeleteResponseReceived);
	   }
	   
	function _manageStoryPictures(data){
		appPicInput=data;
		
		_ControllerStart("#album-"+data.documentid+"-"+data.documenttype);
		sb.dom.find(myComp).fadeIn();
		sb.dom.find(webCam).fadeIn();		
	}
	   
	 function _addProfPictureFromWebCam(input){
		 appPicInput=input;
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhoto1, function(message) {
			 Materialize.toast('Upload cancelled', 2000);
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.FILE_URI,
			 sourceType: navigator.camera.PictureSourceType.CAMERA,
 			 mediaType: navigator.camera.MediaType.PICTURE
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			Materialize.toast('Album ID was not provided. ', 2000);
		}
		}catch(err){
			Materialize.toast('Exception during add picture from device ' + err, 2000);
		}		 
	 }
	 
	function _addProfPictureFromDevice(input){	
			 appPicInput=input;
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhoto, function(message) {
			 Materialize.toast('Upload cancelled', 2000);
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.FILE_URI,
			 sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
 			 mediaType: navigator.camera.MediaType.ALLMEDIA
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			console.log('Album ID was not provided. ');
		}
		}catch(err){
			Materialize.toast('Exception during add picture from device ' + err, 2000);
		}
	}
	
   return{
	   init: function() {
       	try{
				var addPicsButtonList = sb.dom.find(".addpics");
				addPicsButtonList.each(_showAddPicsButton);     			
       			Core.subscribe('addAlbum',_addAlbum);
				Core.subscribe('manageStoryPictures', _manageStoryPictures);
       			Core.subscribe('addPictureFromDevice',_addPictureFromDevice);
				Core.subscribe('addPictureFromWebCam',_addPictureFromWebCam);
       			Core.subscribe("deleteDownloadPhoto", _deleteDownloadPhotoClicked);
       			Core.subscribe('addProfPictureFromDevice',_addProfPictureFromDevice);
				Core.subscribe('addProfPictureFromWebCam',_addProfPictureFromWebCam);				
       	}catch(err){
       		console.log(err);
       	}
   		
       },
   	  destroyModule:  function() { 
   			console.log(counter);
   			console.log('Module destroyed');
   		}	   
     }
   
    };