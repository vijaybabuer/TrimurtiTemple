/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor	
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		
    },
	
	log: function(msg){
		
		document.getElementById('#message1').innerHTML = document.getElementById('#message1').innerHTML + msg;
	},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
	try{
		
	$.mobile.pageLoadErrorMessage = "";
	$.mobile.pageLoadErrorMessageTheme = null;
	
	var appVersion = '1.1.37';
	
	var palpostrServerName = "http://www.palpostr.com/";
	var appleAppStoreUrl = "https://itunes.apple.com/US/app/Palkar/id1207494642?mt=8";
	var androidAppStoreUrl = "https://play.google.com/store/apps/details?id=com.palpostr.palkar";
	
	Core.register('clickReactionsController',clickReactionsController,{relPath: "", reactionCountPerPage: "5"});
	Core.register('textReactionsController',textReactionsController,{relPath: "", reactionCountPerPage: "5"});
	Core.register('storyEditController',storyEditController,{elemHandle: '#createStory', relPath: palpostrServerName, addPostTextAreaHandle: ".addPostTextArea", storiesDiv: "#storiesDiv", storyJSTemplateName: "template-storyTemplate", communityName: 'TrimurtiTempleDevasthanam'});		
	Core.register('storyItemController',storyItemController, {relPath: "", storyPage: false, authenticatedUser: "none", storyJSTemplateName: "template-storyTemplate", getMoreStories: true, storiesDivId: "#storiesDiv", appname: "TrimurtiTempleDevasthanam", numberOfStoriesToGet: 5, serverUrl: palpostrServerName});
	Core.register('pageViewController', pageViewController, {relPath: "", palpostrHost: palpostrServerName, appVersion: appVersion, loadingText: "Welcome, <br> We are downloading your stream.", appname: "TrimurtiTempleDevasthanam", appmaintitle: "Community Updates", appextendedtitle: "This is communication tool for Trimurti Temple Devotees.", streamSize: 5, appleAppStoreUrl: appleAppStoreUrl, androidAppStoreUrl: androidAppStoreUrl});	
	Core.register('sseController',sseController, {relPath: "", username: "guest", userAuthenticated: "false", pageHandle: "TrimurtiTempleDevasthanam"});
	Core.register('userLoginController',userLoginController, {relPath: "", pageHandle: "TrimurtiTempleDevasthanam", palpostrHost: palpostrServerName});
	Core.register('messageDisplayController',messageDisplayController,{appname: 'TrimurtiTempleDevasthanam'});
	Core.register('photoUploadController',photoUploadController, {relPath: "", containerDiv: "#photoUploadContainerDiv", palpostrHost: palpostrServerName});
	Core.register('albumsController',albumsController,{relPath: palpostrServerName});
	Core.register('userLogo',userLogo,{elemHandle: '#user-logo', relPath: palpostrServerName, appname: 'TrimurtiTempleDevasthanam'});
	
	Core.loadUserData(palpostrServerName);
	
	Core.start('pageViewController');
	Core.start('photoUploadController');
	Core.start('clickReactionsController');
	Core.start('messageDisplayController');
	Core.start('textReactionsController');
	Core.start('storyEditController');
	Core.start('storyItemController');
	Core.start('sseController');
	Core.start('userLoginController');
	Core.start('albumsController');
	Core.start('userLogo');
	
	}catch(err){
		alert(err);
	}


	
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Device Ready');
    }
};
