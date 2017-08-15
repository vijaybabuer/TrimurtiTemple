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
		
	var documentIdArray = "990949713493197709";
	
        app.receivedEvent('deviceready');
	try{
	var appVersion = '1.1.33';		
	Core.register('clickReactionsController',clickReactionsController,{relPath: "", reactionCountPerPage: "5"});
	Core.register('textReactionsController',textReactionsController,{relPath: "", reactionCountPerPage: "5"});
	Core.register('storyEditController',storyEditController,{elemHandle: '#createStory', relPath: "http://www.palpostr.com/", addPostTextAreaHandle: ".addPostTextArea", storiesDiv: "#storiesDiv", storyJSTemplateName: "template-storyTemplate"});		
	Core.register('storyItemController',storyItemController, {relPath: "", storyPage: false, authenticatedUser: "none", storyJSTemplateName: "template-storyTemplate", getMoreStories: true, storiesDivId: "#storiesDiv", appname: "TrimurtiTempleDevasthanam", numberOfStoriesToGet: 5, documentIdList: documentIdArray});
	Core.register('pageViewController', pageViewController, {relPath: "", appVersion: appVersion, mainPageDocumentId: "336549566774870509", loadingText: "Welcome, <br> We are downloading your stream.", appname: "TrimurtiTempleDevasthanam", appmaintitle: "Community Updates", appextendedtitle: "Share your local community stories and pictures with Trimurti Temple Devasthanams Devotees", streamSize: 5, documentIdList: documentIdArray});	
	Core.register('sseController',sseController, {relPath: "", username: "guest", userAuthenticated: "false", pageHandle: "TrimurtiTempleDevasthanam"});
	Core.register('userLoginController',userLoginController, {relPath: "", pageHandle: "TrimurtiTempleDevasthanam", palpostrHost: "http://www.palpostr.com/"});
	Core.register('messageDisplayController',messageDisplayController,{appname: 'TrimurtiTempleDevasthanam'});
	Core.register('photoUploadController',photoUploadController, {relPath: "", containerDiv: "#photoUploadContainerDiv", palpostrHost: "http://www.palpostr.com/"});
	Core.register('albumsController',albumsController,{relPath: "http://www.palpostr.com/"});
	Core.register('userLogo',userLogo,{elemHandle: '#user-logo', relPath: "http://www.palpostr.com/", appname: 'TrimurtiTempleDevasthanam'});
	
	Core.loadUserData("http://www.palpostr.com/");

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
