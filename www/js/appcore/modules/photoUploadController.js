var photoUploadController = function(sb, input){
	var containerPanelBody = null, uploadCancelBtn=null, myComp=null, webCam=null, fileuploaderror=null, appPicInput=null, relPathIn=input.relPath, currentAlbumDivId = null,
		selectFilesBtn=null, uploadStartBtn=null, photoUploadMessageDiv=null, uploadSuccessMessage='<span class="p">Upload successful.</span>', uploadFailureMessage='<span class="br p">Upload failure</span>',		
		uplPnlBody=null, currentSelection=null, webCamStartButton=null, webCamCaptureButton=null, webCamStopButton=null, webCamImageNode=null, webCamImage=null, WebCamPicSendBtn=null, containerElement='#uploadControllerPane';   

	function _myComputerClicked(){
		'use strict';
		uplPnlBody.find('.files').html("");
		try{

			uplPnlBody.html(sb.dom.wrap(sb.dom.find('#template-myComp-Upload').html()));
	       currentSelection = 'myComp';
	       var autoUploadTrueFalse = false;	   
	       if(appPicInput.documenttype == 'PVTSTYPIC'){
	    	   autoUploadTrueFalse = true;
	       } 	   
	       selectFilesBtn=uplPnlBody.find('#fileupload');
	       uploadStartBtn=uplPnlBody.find('#uploadStartBtn');
	       uploadCancelBtn=uplPnlBody.find('#uploadCancelBtn');
	       photoUploadMessageDiv.html('Please select photos');	
	       sb.dom.disable(myComp);
	       sb.dom.enable(webCam);	
			 var url = relPathIn+'photo.'+appPicInput.documenttype+'.'+appPicInput.documentid+'.pvt?mediaType=json',
		        uploadButton = sb.dom.wrap('<button/>')
		            .addClass('btn btn-primary')
		            .prop('disabled', true)
		            .text('Processing...')
		            .on('click', function () {
		                var $this = sb.dom.find(this),
		                    data = $this.data();
		                $this
		                    .off('click')
		                    .text('Abort')
		                    .on('click', function () {
		                        $this.remove();
		                        data.abort();
		                    });
		                data.submit().always(function () {
		                    $this.remove();
		                });
		            });
		    sb.dom.find('#fileupload').fileupload({
		        url: url,
		        dataType: 'json',
		        autoUpload: autoUploadTrueFalse,
		        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		        maxFileSize: 5000000, // 5 MB
		        // Enable image resizing, except for Android and Opera,
		        // which actually support image resizing, but fail to
		        // send Blob objects via XHR requests:
		        disableImageResize: /Android(?!.*Chrome)|Opera/
		            .test(window.navigator.userAgent),
		        previewMaxWidth: 100,
		        previewMaxHeight: 100,
		        previewCrop: true
		    }).on('fileuploadadd', function (e, data) {
				alert('file uplad add start');
		        data.context = sb.dom.wrap('<div/>').appendTo('#files');
		        sb.utilities.each(data.files, function (index, file) {
		            var node = sb.dom.wrap('<p/>')
		                    .append($('<span/>').text(file.name));           
		            if (!index) {
		                node
		                    .append('<br>')
		                    .append(uploadButton.clone(true).data(data));
		            }
		            node.appendTo(data.context);
		        }		        
		        );
		        photoUploadMessageDiv.show();		        
		        uploadStartBtn.show();
		        uploadCancelBtn.show();	      
				alert('file uplad add start-ed');
		    }).on('fileuploadprocessalways', function (e, data) {
				alert('fileuploadprocessalways ');
		        var index = data.index,
		            file = data.files[index],
		            node = sb.dom.find(data.context.children()[index]);
		        if (file.preview) {
		            node
		                .prepend('<br>')
		                .prepend(file.preview);
		        }
		        if (file.error) {
		            node
		                .append('<br>')
		                .append(sb.dom.wrap('<span class="text-danger"/>').text(file.error));
		        }
		        if (index + 1 === data.files.length) {
		            data.context.find('button')
		                .text('Upload')
		                .prop('disabled', !!data.files.error);
		        }
				alert('fileuploadprocessalways ed');
		    }).on('fileuploadprogressall', function (e, data) {
				alert('fileuploadprogressall ');
		        var progress = parseInt(data.loaded / data.total * 100, 10);
		        sb.dom.find('#progress .progress-bar').css(
		            'width',
		            progress + '%'
		        );	
				alert('fileuploadprogressall ed');
		    }).on('fileuploaddone', function (e, data) {
				alert('fileuploaddone ');
		    	alert("DocumentId: " + data.result.documentId);
		        sb.utilities.each(data.result.files, function (index, file) {
		            if (file.url) {
		                var link = $('<a>')
		                    .attr('target', '_blank')
		                    .prop('href', file.url);
		                sb.dom.find(data.context.children()[index])
		                    .wrap(link);
		            } else if (file.error) {
		                fileuploaderror = $('<span class="text-danger"/>').text(file.error);
		                sb.dom.find(data.context.children()[index])
		                    .append('<br>')
		                    .append(file.error);
		            }
		        });
		        if(fileuploaderror){
					alert('Error fileuploaderror');
		        	photoUploadMessageDiv.html('<span class="br p cw">Photo upload failed. Please try again later</span>');
		        }else{
		        	photoUploadMessageDiv.html(uploadSuccessMessage);
			        uploadStartBtn.hide();
			        uploadCancelBtn.hide();
			        _publishUpdate();
		        }
				alert('fileuploaddone ed');
		    }).on('fileuploadfail', function (e, data) {
		    	alert('fileuploadfail error');
		        sb.utilities.each(data.files, function (index, file) {
		            var error = $('<span class="text-danger"/>').text('File upload failed.');
		            sb.dom.find(data.context.children()[index])
		                .append('<br>')
		                .append(error);
		        });
		    }).prop('disabled', !$.support.fileInput)
		        .parent().addClass($.support.fileInput ? undefined : 'disabled');
		containerPanelBody.show();		
	    selectFilesBtn.click();					
		}catch(err){
			alert('Photo Upload Controller Start ' + err.stackTrace());
		}
	}
	
	function _setFileDeleteLinkClick(){
		sb.dom.find(this).click(_fileDeleteLinkClick);
	}
	function _fileDeleteLinkClick(e){
		e.preventDefault();
	}
	function _saveWebCamPicture(){
		try{
		webCamImageNode=uplPnlBody.find('#cameraView').find('img');
		webCamImage=webCamImageNode.attr('src');
		webCamImage=webCamImage.replace('data:image/png;base64,','');
		if(appPicInput.documentid != null || appPicInput.documentid != ''){
			sb.utilities.postV2(relPathIn+'webcamphoto.pvt?mediaType=json',{albumId: appPicInput.documentid, albumtype: appPicInput.documenttype, timeStamp: "", photo: "", webCamPhoto: webCamImage}, _saveWebCamPictureSuccess);
		}else{
			console.log("documentid was not provided..");
		}
		}catch(err){
			console.log(err);
		}
	}
	
	function _saveWebCamPictureSuccess(data, success){
		if(data.txnStatus){
			if(data.txnStatus == "FAILED"){
				photoUploadMessageDiv.html('<span class="br p cw">Photo upload failed. Please try again later</span>');
			}else{
				photoUploadMessageDiv.html('<span class="br p">Photo upload failed. Please try again later</span>');
			}			
		}else{
			photoUploadMessageDiv.html('<span class="p">Picture has been saved.</span>');
			_publishUpdate();			
		}

	}
	
	function _webCamClicked(){
		console.log("WebCam Has been clicked..");
		sb.dom.enable(myComp);
		sb.dom.disable(webCam);
		uplPnlBody.find('.files').html("");

		try{
		if(currentSelection == null || currentSelection != 'webCam'){
		uplPnlBody.addClass('ba');
		uplPnlBody.html(sb.dom.find('#template-webcam-Upload').html());
		currentSelection = 'webCam';
		webCamStopButton=uplPnlBody.find('#WebCamStop');
		webCamCaptureButton=uplPnlBody.find('#WebCamCapture');
		webCamStartButton=uplPnlBody.find('#WebCamStart');
		WebCamPicSendBtn=uplPnlBody.find('#WebCamPicSend');
		
		WebCamPicSendBtn.bind('click', _saveWebCamPicture);
		photoUploadMessageDiv.html("Most browsers will prompt the users for security check before enabling WebCam. Starting WebCam can take a while, please wait.");
		sb.dom.find('#cameraView').photobooth({
	          width: 320,
	          height: 240,
	          imgPlaceholder: relPathIn+'images/photobooth/video-placeholder.jpg'
	        },
	        function(control) {
	          webCamStartButton.click(function(){
	        	  control.start();
	        	  webCamStartButton.hide();
	        	  WebCamPicSendBtn.hide();
	        	  webCamStartButton.html("Restart WebCam");
	        	  webCamCaptureButton.show();
	        	  webCamStopButton.show();
	          });
	          webCamCaptureButton.click(function() {
	            control.snapshot();
	            control.stop();
	            webCamStartButton.show();
	            WebCamPicSendBtn.show();
	            webCamCaptureButton.hide();
	            webCamStopButton.hide();
	          });
	          webCamStopButton.click(function() {
	            control.stop();
	            webCamStartButton.show();
	            webCamCaptureButton.hide();
	            webCamStopButton.hide();
	          }
	          );
	        },
	        function() {
	          alert('This browser does not support image capture.');  
	        });
		containerPanelBody.show();
		webCamStartButton.trigger('click');		
		}
		}catch(err){
			console.log(err);
		}
	}

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
	function _ControllerStart(divId){

		if(divId && sb.dom.find(divId)){
			sb.dom.find(divId).find("#uploadControllerPane").remove();	
			currentAlbumDivId = divId;
			sb.dom.find(currentAlbumDivId).prepend(sb.dom.find('#template-uploadController').html());
			if(divId.split("-")[2] == 'PROFPICS'){
				sb.dom.find(".profpicturecapturediv").show();
			}
			containerPanelBody=sb.dom.find(currentAlbumDivId).find('#uploadControllerPane');			
				
			uplPnlBody=containerPanelBody.find('#panel-bdy');
			photoUploadMessageDiv=containerPanelBody.find('#panel-message');
			photoUploadMessageDiv.html('Please select photos');	
			photoUploadMessageDiv.append(sb.dom.find("#PhotoUploadController-ClickToRemove").html());
			myComp=containerPanelBody.find('#myComp');
			webCam=containerPanelBody.find('#webCam');
			uploadCancelBtn=containerPanelBody.find('#uploadCancelBtn');
			containerPanelBody.find('.closeBtn').bind('click',_closeUploader);
				
			myComp.bind('click',_myComputerClicked);
			webCam.bind('click', _webCamClicked);					
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
	
	function _errorInDocumentCreate(request, errorMessage, errorObj){
		alert("Request " + JSON.stringify(request) + " " + JSON.stringify(errorMessage) + " " + JSON.stringify(errorObj));
	}
	
	function _addAlbum(input){
		try{
		if(input.documenttype != null && input.documenttype != ""){
			sb.utilities.postV2(relPathIn+"document.pvt?mediaType=json",{documenttype: input.documenttype, documentname: input.documentname}, _addAlbumPictures,_errorInDocumentCreate);
		}else{
			photoUploadMessageDiv.html('There was problem creating album. Please try again later.');
			console.log('Album type was not provided. ');
		}
		}catch(err){
			alert('Exception during Album Add : ' + err);
		}
	}
	
	function _addPictureFromDevice(input){	
		try{
		if(input.documentid != null && input.documentid != ""){
			appPicInput=input;
			_ControllerStart("#album-"+input.documentid+"-"+input.documenttype);
			_myComputerClicked();
			//Create Pictures for album
		}else{
			photoUploadMessageDiv.html('There was problem. Please try again later.');
			console.log('Album ID was not provided. ');
		}
		}catch(err){
			console.log('Exception during add picture from device ' + err);
		}
	}
	function _addPictureFromWebCam(input){
		if(!sb.utilities.isMobile()){
			try{
				console.log("Starting webcam... " + input + " " + input.documentid);
					if(input.documentid != null && input.documentid != ""){
						appPicInput=input;
						_ControllerStart("#album-"+input.documentid+"-"+input.documenttype);
						_webCamClicked();		
						//Create Pictures for album
					}else{
						photoUploadMessageDiv.html('There was problem. Please try again later.');
						console.log('Album ID was not provided. ');
					}
				}catch(err){
					console.log('Exception during add picture from webcam ' + err);
				}			
		}else{
			_addPictureFromDevice(input);
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
			   _publishUpdate();
		   }else{
			   Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		   }
		   
		   
	   }
	   function _deleteDownloadPhotoClicked(data){
		   console.log("Delete Photo " + data.photoId);
		   sb.utilities.serverDelete(relPathIn+"photo/"+data.photoId+"?mediaType=json",null,_photoDeleteResponseReceived);
	   }
	   
   return{
	   init: function() {
       	try{
				var addPicsButtonList = sb.dom.find(".addpics");
				addPicsButtonList.each(_showAddPicsButton);     			
       			Core.subscribe('addAlbum',_addAlbum);
       			Core.subscribe('addPictureFromDevice',_addPictureFromDevice);
       			Core.subscribe('addPictureFromWebCam',_addPictureFromWebCam);
       			Core.subscribe("deleteDownloadPhoto", _deleteDownloadPhotoClicked);
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