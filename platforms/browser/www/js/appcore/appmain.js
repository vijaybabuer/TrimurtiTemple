/* 
* CORE-SANDBOX-MODULE Pattern implementation
* see readme.md for references.
*/

/*
* @description Sandbox object, the API of this object is available to modules.
*              see readme.md for reference.
*/
Sandbox = Class.extend({
	initialize: function(core) {
		this.publish = core.publish;
		this.subscribe = core.subscribe;
		this.dom = core.dom;
		this.utilities=core.utilities;
	}
});


/*
* @description Core object, the API of this object is available to sandboxes.
*              see readme.md for reference.
* @static
* @param {object} base: base library (jquery is used here).
*/
Core = function(_$) {
	var moduleData = {},
		userData = {username: 'guest', authorization: null, authorizationType: null, userDetails: null},
		cache = {}, 
		userStream = null,
		deviceAccounts = null
		baseHost = "",
		_dom = {
			find: function(selector) {
				return _$(selector);
			},
			wrap: function(element) {
				return _$(element);
			},
			disable: function(element){
				element.attr('disabled','disabled');
			},
			enable: function(element){
				element.removeAttr('disabled');
			},
			shake: function(){
				return _$.effect('shake');
			}
		},
		_utilities = {
			showDialog: _$.mobile.changePage,
			isUserLoggedIn: function(){
				if(userData){		
					if(userData.username == 'guest' || userData.username == 'undefined' || userData.username == null){
						userLoggedIn = false;
					}else{
						userLoggedIn = true;	
					}
				}else{
					userLoggedIn = false;	
				}	
				return userLoggedIn;
			},
			getUserInfo: function(){
				return userData;
			},
			setUserInfo: function(username, authorization, authorizationType, userDetails){
				userData.username=username;
				userData.authorization=authorization;
				userData.authorizationType = authorizationType;
				if(userDetails){
					userData.userDetails = userDetails;	
				}		
				try{
					createUserData(username, authorization, authorizationType, userDetails);
				}catch(e){
					alert('Problem create user data ' + e);	
				}
			},
			deleteUserInfo: function(){
				alert('not supported');
			},	
			
			getUserStream: function(){
				if(userStream == null){
					loadUserStream();	
				}
				return userStream;
			},
			setUserStream: function(streamData){
				userStream = streamData;
			},
			setUserStreamToDevice: function(){
				try{
					writeUserStream(userStream);
				}catch(e){
					alert('Problem create user data ' + e);	
				}				
			},
			deleteUserStream: function(){
				deleteUserStreamFromDevice();
			},		
			
			
			uploadFilePhoto: function(referenceUrl, fileName, progressId, _uploadSuccess, _uploadFailure){
				var options = new FileUploadOptions();
				var percentageText = "10%";
				 options.fileKey = "file";
				 options.fileName = fileName.substr(fileName.lastIndexOf('/')+1);
				 var dotQualifiers = fileName.split(".");
				 if(dotQualifiers.length > 0){
					 options.mimeType = "image/"+dotQualifiers[dotQualifiers.length - 1];
					 if(options.mimeType == "image/jpg"){
						options.mimeType = "image/jpeg";	 
					 }
				 }else{
					 options.mimeType = "image/jpeg";
				 }
				 //alert(options.mimeType);
				 options.httpMethod = "POST";
				 options.chunkedMode = true;
				 var ft = new FileTransfer();
				 var _fileUploadProgress = function (e){					 			
					 			if(e.lengthComputable){
									try{
										_$(progressId).find('.determinate').css('width',  (e.loaded / e.total) * 100 + '%');
										if((e.loaded / e.total) > 0.95){
											if(_$(progressId).find('.determinate').length > 0){
											_$(progressId).find('.determinate').remove();
											}
											if(_$(progressId).find('.progress').find('.indeterminate').length == 0){
											_$(progressId).find('.progress').html('<div class="indeterminate"></div>');
											}
										}
									}catch(e){
										alert(e);	
									}
								}
				}				 
				 ft.onprogress = _fileUploadProgress;

				 var csrfTokenValue = _$("meta[name='_csrf']").attr("content");
				 var csrfTokenName = _$("meta[name='_csrf_header']").attr("content");	
				 var headers = {csrfTokenName: csrfTokenValue};

				//alert(csrfTokenValue + " " + csrfTokenName);
				 options.headers = headers;		 
		
					options.params = {
							"_csrf" : csrfTokenValue
						}
				 //alert('here ' + JSON.stringify(options.params));
				 try{
				var url = baseHost;				
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}					 
				 ft.upload(fileName, encodeURI(url), _uploadSuccess, _uploadFailure, options);
				 //alert('done');
				 }catch(e){
						alert(e);
				 }						
				
			},
			merge: _$.extend,
			map: _$.map,
			data: _$.data,
			grep: _$.grep,
			inArray: _$.inArray,
			each: _$.each,
			trigger: _$.trigger,
			post: _$.post,
			postJSON: function(referenceUrl, data, successMethod){
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				var url = baseHost;				
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}				
				_$.ajax({
					url: url,
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: successMethod,
					dataType: 'json',
			        beforeSend: function(xhr) {
			            xhr.setRequestHeader(header, token);
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}						
			        }
				});				
			},
			isMobile: function(){
				if( /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ) {
					 return true;
				}else{
					return false;
				}
			},
			userAgent: function(){
				return navigator.userAgent; 
			},
			postV2: function(referenceUrl, data, successMethod, errorMethod){
				if(!errorMethod){
					errorMethod = defaultErrorMethod;	
				}
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				var url = baseHost;
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}
				_$.ajax({
					url: url,
					type: 'POST',
					data: data,
					contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
					success: successMethod,
					error: errorMethod,
					dataType: 'json',
					encoding: 'UTF-8',
			        beforeSend: function(xhr) {
			            xhr.setRequestHeader(header, token);
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}
			        },
					xhrFields: {
						onprogress: function(e){
							if (e.lengthComputable && data.photoUploadNumber) {								
								var progressDivId = '#album-'+data.albumId+'-'+data.albumtype+'-'+data.photoUploadNumber;
								var percentage = (e.loaded / e.total) * 100;
								var percentageText = percentage + '%';
								_$(progressDivId).find('.determinate').css('width',  percentageText);
								if(percentage > 99){
									_$(progressDivId).remove();
								}
							}						
						}
					}					
				});	
			},	
			postPublic: function(referenceUrl, data, successMethod, errorMethod){
				if(!errorMethod){
					errorMethod = defaultErrorMethod;	
				}
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				var url = baseHost;
					url = url + referenceUrl;
				_$.ajax({
					url: url,
					type: 'POST',
					data: data,
					contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
					success: successMethod,
					error: errorMethod,
					dataType: 'json',
					encoding: 'UTF-8',
			        beforeSend: function(xhr) {
			            xhr.setRequestHeader(header, token);
			        }
				});				
			},				
			ajax: _$.ajax,
			appGet: function(referenceUrl, successMethod, failureMethod){
				var url = baseHost;
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}				
				_$.ajax({
					url: url,
					type: 'GET',
					success: successMethod,
					failure: failureMethod,
			        beforeSend: function(xhr) {
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}
			        }		
				});				
			},
			put: function(referenceUrl, data, successMethod){
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");	
				var url = baseHost;
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}				
				_$.ajax({					
					url: url,
					type: 'PUT',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: successMethod,
			        beforeSend: function(xhr) {
			            xhr.setRequestHeader(header, token);
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}						
			        }
				});
			},
			get: function(referenceUrl, data, successCallback){
				var url = baseHost;
				referenceUrl = referenceUrl.replace(url, '');
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}
				_$.ajax({					
					url: url,
					type: 'GET',
					data: data,
					success: successCallback,
			        beforeSend: function(xhr) {
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}						
			        }
				});				
			},
			serverDelete: function(referenceUrl, data, successMethod){
				var token = $("meta[name='_csrf']").attr("content");
				var header = $("meta[name='_csrf_header']").attr("content");
				var url = baseHost;				
				if(userData.authorizationType){
					if(userData.authorizationType == 'social'){
						url = url + userData.authorizationType + "/" + referenceUrl;
					}else{
						url = url + userData.authorizationType + "/" + referenceUrl + '&a=' + userData.authorization;	
					}
				}else{
					url = url + referenceUrl;
				}
				_$.ajax({
					url: url,
					type: "DELETE",
					data: data,
					success: successMethod,
			        beforeSend: function(xhr) {
			            xhr.setRequestHeader(header, token);
						if(userData.authorizationType && userData.authorizationType == 'social'){
							xhr.setRequestHeader('Authorization', 'Bearer ' + userData.authorization);	
						}						
			        }
				});
			},
			browser: _$.browser,
			setTimeout: setTimeout,
			clearTimeout: _$.clearTimeout,
			wysiwyg: function(selector){
				return _$(selector).wysiwyg();
			},
			log: function(msg){
				//_$.get('reportjsissue.'+message+'.pvt', function(){console.log('Issue reported to the service administrator.')});
				//_$.get('reportjsissue/'+msg,function(){console.trace('Issue reported to the service administrator.')});
				console.log(msg);
			},
			trace: function(message){
				console.trace(message);
			},
			pageReload: function(){
				location.reload();
			},
			htmlEncode: function(data){
				return Encoder.htmlEncode(data);
			},
			htmlDecode: function(data){
				return Encoder.htmlDecode(data);
			}
		},
		_json = {
			each: _$.each,
			parse: _$.parseJSON
		};


	function _showDeviceAccounts(accounts){
		deviceAccounts = accounts;
		alert('device accounts ' + accounts);
		alert('device accounts ' + JSON.stringify(accounts));
	}
	
	function disconnectAlertDismissed(){
		;	
	}
	function defaultErrorMethod(request, errorMessage, errorObj){
		try{
			if(request.status = '405'){
			//navigator.notification.alert('Restarting app to get latest info from server.', disconnectAlertDismissed, 'Error', 'Ok, Thanks');
			Core.publish('restartApp', null);
			}else{
				navigator.notification.alert(request.status  + ' ' + request.statusText + ' Restarting App', disconnectAlertDismissed, 'Error', 'Ok, Thanks');
				if(navigator.app){
					navigator.app.exitApp();
				}else if(navigator.device){
					navigator.device.exitApp();
				}else{
					navigator.notification.alert('There was a problem processing your request. You may be able to fix this by restarting your App. If the problem persists, please contact your Community Coordinator.', disconnectAlertDismissed, input.appname, 'Ok, Thanks');		
			}
				
			}
		}catch(e){
			alert('There was a problem processing your request. Please try again later ' + e);	
		}
		//alert("There was a problem processing your request. You may be able to fix this by restarting your App. If the problem persists, please contact your Community Coordinator." + JSON.stringify(errorMessage) + " " + JSON.stringify(errorObj) );	
	}
	function _getDeviceAccountsError(error){
		alert(error);	
	}
	function loadUserData(){
		try{
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {				
					fs.root.getFile("userInfo.txt", { create: false, exclusive: false }, function (fileEntry) {
						readUserData(fileEntry);
					}, function(error){createUserData('guest',null, null, null);});				
				}, function(error){console.log('Problem Accessing File System');});		
		}catch(e){
			alert('Problem create user data ' + e);	
		}
	}
	
	
	function loadUserStream(){
		try{
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {				
					fs.root.getFile("userStream.txt", { create: false, exclusive: false }, function (fileEntry) {
						readUserStream(fileEntry);
					}, function(error){console.log(error);});
				}, function(error){console.log(error);});
		}catch(e){
			alert('Problem create user data ' + e);	
		}
	}

	function deleteUserStreamFromDevice(){
		try{
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {				
					fs.root.getFile("userStream.txt", { create: false, exclusive: false }, function (fileEntry) {
						fileEntry.remove(function(){
							console.log('File Delete Success');						  
						});
					}, function(error){alert(error);});				
				}, function(error){console.log('Problem Accessing File System');});		
		}catch(e){
			alert('Problem create user data ' + e);	
		}
	}
	
	function onErrorReadFile(){
		alert('error on file read');	
	}
	function readUserData(fileEntry){
		fileEntry.file(function (file) {
			var reader = new FileReader();	
			reader.onloadend = function() {
				console.log("Successful file read: " + this.result);
				var userDataText = this.result;
				userData = JSON.parse(userDataText.toString());
			};
			reader.readAsText(file);
		}, onErrorReadFile);			
	}
	
	function readUserStream(fileEntry){
		fileEntry.file(function (file) {
			var reader = new FileReader();	
			reader.onloadend = function() {
				console.log("Successful file read: " + this.result);
				var userDataStream = this.result;
				userStream = JSON.parse(userDataStream.toString());
				Core.publish("userStreamLoaded", null);
				//alert(JSON.stringify(userStream));
			};
			reader.readAsText(file);
		}, onErrorReadFile);			
	}	
	
	function writeUserData(fileEntry, dataObj){
    // Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function (fileWriter) {
	
			fileWriter.onwriteend = function() {
				console.log('Success Write');
			};
	
			fileWriter.onerror = function (e) {
				console.log('Failure Write');
				alert('Error on Writing user data: ' + JSON.stringify(e));
			};
	
			fileWriter.write(JSON.stringify(dataObj));
		});		
	}
	
	function writeUserStreamToDevice(fileEntry, dataObj){
    // Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function (fileWriter) {
	
			fileWriter.onwriteend = function() {
				console.log('Success Write');
			};
	
			fileWriter.onerror = function (e) {
				console.log('Failure Write');
				alert('Error on Writing user data: ' + JSON.stringify(e));
			};
			//alert('writing json object');
			try{
			fileWriter.write(JSON.stringify(dataObj));
			}catch(e){
				alert(e);	
			}
		});		
	}
	
	function writeUserStream(userStream){
		
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
					fs.root.getFile("userStream.txt", { create: true, exclusive: false }, function (fileEntry) {										
					writeUserStreamToDevice(fileEntry, userStream);
					}, function(error){alert(error);});
				
				}, function(error){alert(error);});			
	}
	
	function createUserData(username, authorization, authorizationType, userDetails){
		
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
					fs.root.getFile("userInfo.txt", { create: true, exclusive: false }, function (fileEntry) {					
					var userDataTemp = {username: username, authorization: authorization, authorizationType: authorizationType, userDetails: userDetails};
					writeUserData(fileEntry, userDataTemp);
					}, function(error){alert(error);});
				
				}, function(error){alert(error);});			
	}
	return {
		dom: _dom,
		utilities: _utilities,
		myjson: _json,
		register: function(moduleId, creator, options) {
			moduleData[moduleId] = {
				creator: creator,
				instance: null,
				options: options || {}
			};
		},
		/**
		 * Starts a single module
		 * @param {string} moduleId The module identifier
		 */
		start: function(moduleId) {
			moduleData[moduleId].instance = new moduleData[moduleId].creator(new Sandbox(this), moduleData[moduleId].options);
			moduleData[moduleId].instance.init();
		},
		stop: function(moduleId) {
			var data = moduleData[moduleId];
			if (data.instance) {
				data.instance.destroy();
				data.instance = null;
			}
		},
		startAll: function() {
			for (var moduleId in moduleData) {
				if (moduleData.hasOwnProperty(moduleId)) {
					this.start(moduleId);
				}
			}
		},
		stopAll: function() {
			for (var moduleId in moduleData) {
				if (moduleData.hasOwnProperty(moduleId)) {
					this.stop(moduleId);
				}
			}
		},
		publish: function(message, args) {
			try {
					var i;
					for (i = 0; i < cache[message].length; i++) {
						if (typeof args === "undefined") { args = []; }
						if (!(args instanceof Array)) {
							args = [args];
						}
						cache[message][i].apply(this, args);
					};
			} catch (err) {
				console.log(err);
			}
		},
		loadUserData: function(initBaseHost){
			baseHost = initBaseHost;
			loadUserData();
		},
		subscribe: function(message, callback) {
			if (!cache[message]) {
				cache[message] = [];
			}
			cache[message].push(callback);
			return [message, callback];
		},
		unsubscribe: function(handle) {
			var t = handle[0];
			base.each(cache[t], function(idx) {
				if (this == handle[1]) {
					cache[t].splice(idx, 1);
				}
			});
		}
	};
} (jQuery);