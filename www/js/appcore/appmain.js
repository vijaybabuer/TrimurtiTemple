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
			navigator.notification.alert('Restarting app to get latest info from server.', disconnectAlertDismissed, input.appname, 'Ok, Thanks');
			if(navigator.app){
				navigator.app.exitApp();
			}else if(navigator.device){
				navigator.device.exitApp();
			}else{
				navigator.notification.alert('There was a problem processing your request. You may be able to fix this by restarting your App. If the problem persists, please contact your Community Coordinator.', disconnectAlertDismissed, input.appname, 'Ok, Thanks');		
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
	function writeUserData(fileEntry, dataObj){
    // Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function (fileWriter) {
	
			fileWriter.onwriteend = function() {
				console.log('Success Write');
			};
	
			fileWriter.onerror = function (e) {
				console.log('Failure Write');
			};
	
			fileWriter.write(dataObj);
		});		
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