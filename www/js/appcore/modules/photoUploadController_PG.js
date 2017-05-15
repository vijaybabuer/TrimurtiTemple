var photoUploadController = function(sb, input){
	var containerPanelBody = null, uploadCancelBtn=null, fileuploaderror=null, appPicInput=null, relPathIn=input.relPath, currentAlbumDivId = null, myComp=null, webCam=null, profPicDevice = null, profPicCam = null,
		selectFilesBtn=null, uploadStartBtn=null, photoUploadMessageDiv=null, uploadSuccessMessage='<span class="p">Upload successful.</span>', uploadFailureMessage='<span class="br p">Upload failure</span>', uploadNumber = 0;
		uplPnlBody=null, currentSelection=null, webCamStartButton=null, webCamCaptureButton=null, webCamStopButton=null, webCamImageNode=null, webCamImage=null, WebCamPicSendBtn=null, containerElement='#uploadControllerPane',  thumnailhtmltemplate=sb.dom.find("#template-albumpicturethumbnail").html(), thumnailhtml=null, picturecontainer=null;   

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
		alert("Request " + JSON.stringify(request) + " " + JSON.stringify(errorMessage) + " " + JSON.stringify(errorObj));
	}
	
	function _addAlbum(input){
		try{		
		if(input.documenttype != null && input.documenttype != ""){
			sb.utilities.postV2(relPathIn+"document.pvt?mediaType=json",{documenttype: input.documenttype, documentname: input.documentname}, _addAlbumPicturesSuccess,_errorInDocumentCreate);
		}else{
			photoUploadMessageDiv.html('There was problem creating album. Please try again later.');
			console.log('Album type was not provided. ');
		}
		}catch(err){
			alert('Exception during Album Add : ' + err);
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
		alert(JSON.stringify(request) + " " + JSON.stringify(errorMsg) + " " +JSON.stringify(errorObj));
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
			alert(error);	
		}
	}
	
	function photoUploadProgress(progressEvent) {
		if (progressEvent.lengthComputable) {
			photoUploadMessageDiv.html(progressEvent.loaded + " " + progressEvent.total);
		} else {			
			photoUploadMessageDiv.html(loadingStatus.increment());
		}
	}
	
	function uploadPhoto(imageURI) {
		var options = new FileUploadOptions();
		 options.fileKey = "file";
		 options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
		 options.mimeType = "text/plain";
		 options.httpMethod = "POST";
		 options.chunkedMode = true;
		 var ft = new FileTransfer();
		 ft.onprogress = photoUploadProgress;
		 var authoriztion = sb.utilities.getUserInfo().authorization;
		 var csrfTokenValue = sb.dom.find("meta[name='_csrf']").attr("content");
		 var csrfTokenName = sb.dom.find("meta[name='_csrf_header']").attr("content");	
		 var headers = {csrfTokenName: csrfTokenValue};
		 
		 options.headers = headers;

		 ft.upload(imageURI, encodeURI(relPathIn+'api/photoUpload?mediaType=jpeg'), function(result){
																						 
		 alert(JSON.stringify(result));
		 
		 }, function(error){
		 alert(JSON.stringify(error));
		 }, options);
	}

 
	 function _addPictureFromWebCam(input){
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhotoV2, function(message) {
			 alert('Get Picture Cancelled');
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.DATA_URL,
			 sourceType: navigator.camera.PictureSourceType.CAMERA,
 			 mediaType: navigator.camera.PictureSourceType.PICTURE
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			alert('Album ID was not provided. ');
		}
		}catch(err){
			alert('Exception during add picture from device ' + err);
		}		 
	 }
	function _addPictureFromDevice(input){	
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhotoV2, function(message) {
			 alert('Get Picture Cancelled');
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.DATA_URL,
			 sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
 			 mediaType: navigator.camera.PictureSourceType.PICTURE
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			console.log('Album ID was not provided. ');
		}
		}catch(err){
			alert('Exception during add picture from device ' + err);
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
			navigator.camera.getPicture(uploadPhotoV2, function(message) {
			 Materialize.toast('Upload cancelled', 2000);
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.DATA_URL,
			 sourceType: navigator.camera.PictureSourceType.CAMERA,
 			 mediaType: navigator.camera.PictureSourceType.PICTURE
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			alert('Album ID was not provided. ');
		}
		}catch(err){
			alert('Exception during add picture from device ' + err);
		}		 
	 }
	 
	function _addProfPictureFromDevice(input){	
			 appPicInput=input;
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			navigator.camera.getPicture(uploadPhotoV2, function(message) {
			 Materialize.toast('Upload cancelled', 2000);
			 }, {
			 quality: 50,
			 destinationType: navigator.camera.DestinationType.DATA_URL,
			 sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
 			 mediaType: navigator.camera.PictureSourceType.PICTURE
			 });
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			console.log('Album ID was not provided. ');
		}
		}catch(err){
			alert('Exception during add picture from device ' + err);
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