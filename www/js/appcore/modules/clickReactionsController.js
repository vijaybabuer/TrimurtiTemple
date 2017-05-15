var clickReactionsController = function(sb, input){
	var pgReacInfo=null, relPathIn=input.relPath, pgReacId=null, reactionCountPerPage=input.reactionCountPerPage, pgReacEnabled=null, pgReaction=null, reacId=null, pageReactionSummary = null, curTarget=null,
	    defaultClickReactionsDivList=null, reactionType='CLICK', pageReactionType='CLICK', reactionsLoadedStatus = "LOADED", pageHasLists=input.pageHasLists, shareCardDialog = null, shareCardForm = null;
	function _addReaction(e){
	 try{
		if(sb.utilities.isUserLoggedIn()){
			pgReacInfo=e.currentTarget.id.split("-");
			pgReaction=pgReacInfo[0];
			pgReacId=pgReacInfo[1];
			pgReacEnabled=pgReacInfo[2];
			
			if(pgReacEnabled == 'enabled' && pgReacId != '0'){
				sb.utilities.postV2(relPathIn+'reaction.pvt?mediaType=json',{reactionId: "", pageReactionId: pgReacId, documentPageId: "", pageReactionType: pageReactionType, reactionType: reactionType, reactionRichText: ""},_reactionAdded);
			}else if(pgReacEnabled == 'disabled' && pgReacId != '0'){
				sb.utilities.serverDelete(relPathIn+'clickreaction.pvt/'+pgReacId+'?mediaType=json',null,_reactionDeleted);
			}else{
				Core.publish("displayMessage",{messageTitle: "Failure", message: "Could not complete the process.", messageType: "failure"});
			}
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
	 }
	 catch(err){
		 serverLog(err);
	 }
		
	}
	
	function _updateClickReactionView(reaction){

			pageReactionSummary = reaction.pageReactionSummary;
			if(pageReactionSummary.pageReactionEnabledForUser == 'enabled'){
				curTarget = sb.dom.find("#button-"+pageReactionSummary.pageReactionId+"-disabled");
				if(!curTarget){
					curTarget = sb.dom.find("#button-"+pageReactionSummary.pageReactionId+"-enabled");
				}
			}else{
				curTarget = sb.dom.find("#button-"+pageReactionSummary.pageReactionId+"-enabled");
				if(!curTarget){
					curTarget = sb.dom.find("#button-"+pageReactionSummary.pageReactionId+"-disabled");
				}
			}

				curTarget.attr("id", pgReaction+"-"+pageReactionSummary.pageReactionId+"-"+pageReactionSummary.pageReactionEnabledForUser);
				
				if(pageReactionSummary.pageReactionEnabledForUser == 'enabled'){								
					curTarget.css("background-color","#ffffff");
					curTarget.attr("title",sb.dom.find("#jstemplate-clickReactionEnabledMessage").html());	
					curTarget.html(pageReactionSummary.pageReactionTitle);
				}else{
					curTarget.css("background-color","#ffffff");
					curTarget.attr("title",sb.dom.find("#jstemplate-clickReactionDisabledMessage").html());
					curTarget.html("Remove");
				}	

			
			sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionSummary.pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false"},_loadReactionList);
			Core.publish('newReactionAdded', null);
			
	}
	
	function _loadReactionList(pageReactionDetail){
		_updateReactionList(pageReactionDetail, "LOAD");
	}
	
	function _showMoreReactionList(pageReactionDetail){
		_updateReactionList(pageReactionDetail, "SHOWMORE");
	}	
	
	
	function _updateReactionList(pageReactionDetail, loadFlag){
		var reactionsDiv = sb.dom.find("#reactions-"+pageReactionDetail.pageReactionId);
		var clickReactionsShowButton = sb.dom.find("#clickReacMessage-"+pageReactionDetail.pageReactionId);
		var clickReactionsSummaryButton = sb.dom.find('#HighlightReacSummary-'+pageReactionDetail.pageReactionId);
		if(pageReactionDetail.pageReactionCount == "0" || pageReactionDetail.pageReactionCount == "" || pageReactionDetail.pageReactionCount == null){
			clickReactionsShowButton.html(pageReactionDetail.pageReactionTitle);
			clickReactionsSummaryButton.html('<i class="fa fa-star-o"></i>'+ '<span class="bigScreenItem">'+pageReactionDetail.pageReactionTitle+'</span>');
			reactionsDiv.find(".clickReactionList").html("");
		}else{
			clickReactionsShowButton.html(pageReactionDetail.pageReactionTitle + " (" + pageReactionDetail.pageReactionCount + ")");
			clickReactionsShowButton.addClass("ab");
			if(pageReactionDetail.hasNewEntry){
				clickReactionsShowButton.addClass("ui-icon-alert");
				clickReactionsShowButton.addClass("ui-btn-icon-left");				
			}
			clickReactionsShowButton.prop('enabled',true);
			if(pageReactionDetail.reactionResponseList != null && pageReactionDetail.reactionResponseList != "null" ){
				if(loadFlag == "LOAD"){
					reactionsDiv.find(".clickReactionList").html(tmpl("tmpl-pageReactionlist", pageReactionDetail));
				}else if(loadFlag == "SHOWMORE"){
					reactionsDiv.find(".clickReactionList").append(tmpl("tmpl-pageReactionlist", pageReactionDetail));
				}
				
			}
			reactionsDiv.find(".timeago").timeago();
			clickReactionsSummaryButton.html('<i class="fa fa-star"></i> ' + '<span class="bigScreenItem">'+pageReactionDetail.pageReactionTitle+'</span>&nbsp;(' + pageReactionDetail.pageReactionCount + ')');
		}	

		reactionsDiv.addClass(reactionsLoadedStatus);
		sb.dom.find('#HighlightReacSummary-'+pageReactionDetail.pageReactionId).addClass(reactionsLoadedStatus);
		Core.publish('contactToolTipAdded', {divId: "#"+reactionsDiv.attr('id')});
		
		if(pageReactionDetail.pageReactionHasMoreReactions){
			var showMoreButton = reactionsDiv.find('.showMore');
			showMoreButton.data("showMoreData", {
				pageReactionId: pageReactionDetail.pageReactionId,
				latestReactionDate: pageReactionDetail.latestReactionDate
			});
			showMoreButton.unbind('click', _showMoreButtonClickEvent);
			showMoreButton.unbind('click', _showMoreButtonClickEventFirst);
			showMoreButton.click(_showMoreButtonClickEvent);
			reactionsDiv.find('.showMore').fadeIn();
			showMoreButton=null;
		}else{
			reactionsDiv.find('.showMore').hide();
		}
		
		sb.dom.find('#clickReacMessage-'+pageReactionDetail.pageReactionId).triggerHandler('click');
	}
	
	function _showMoreButtonClickEvent(e){
		var showMoreData = sb.dom.find(this).data("showMoreData");

		
		sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: showMoreData.pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false", lastReactionCreatedDate: showMoreData.latestReactionDate}, _showMoreReactionList);
	}
	
	function _showMoreButtonClickEventFirst(e){
		var pageReactionId = sb.dom.find(this).attr("id").split("-")[1];
		sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionId, reactionCount: 10, retrieveSummary: "false"}, _showMoreReactionList);
		sb.dom.find(this).parent().find('.clickReactionList').html("");
	}
	
	function _showReactionList(pageReactionDetail){
			_updateReactionList(pageReactionDetail, "LOAD");
			var allReactionList = sb.dom.find('#TxtReactionList-'+pageReactionDetail.documentPageId);
			allReactionList.find('.textReactionList-Comments').hide();
			allReactionList.find('.textReactionList-Replies').hide();
			allReactionList.find('.textAreaSection').hide();
			allReactionList.find('.defaultClickReactionList').fadeIn();
			allReactionList.find('.rplysection').removeClass('cmt');
			allReactionList.find('.rplysection').removeClass('ca');
			allReactionList.find('.cmntsection').removeClass('cmt');
			allReactionList.find('.cmntsection').removeClass('ca');
			allReactionList.find('.clickReacMessage').addClass('cmt');
			allReactionList.find('.clickReacMessage').addClass('ca');			
			allReactionList=null;
			sb.dom.find('#clickReacMessage-'+pageReactionDetail.pageReactionId).removeClass("ui-icon-alert");
			sb.dom.find('#clickReacMessage-'+pageReactionDetail.pageReactionId).removeClass("ui-btn-icon-left");
	}
	function _reactionDeleted(reaction){
		
		if(reaction.txnStatus == 'SUCCESS'){
			_updateClickReactionView(reaction);			
			//Core.publish("displayMessage",{message: "Your reaction was removed.", messageType: "success"});
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
		
	}
	function _reactionAdded(reaction){
		if(reaction.txnStatus == 'SUCCESS'){
			_updateClickReactionView(reaction);
			//Core.publish("displayMessage",{message: "Story was highlighted.", messageType: "success"});
		}else{
			Core.publish("displayMessage",{message: "There was a problem highlighting the story.", messageType: "failure"});
		}
	}
	function _loadPageReaction(){
		var pageReactionId = sb.dom.find(this).find('.HighlightSummary').attr("id").split("-")[1];
		var clkReactionListDivVisible = sb.dom.find(this).visible('partial');
		if(clkReactionListDivVisible && !sb.dom.find(this).find('.HighlightSummary').hasClass(reactionsLoadedStatus) && pageReactionId != ""){
			sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false"},_loadReactionList);
		}
	}
	
	function _loadPageReactionList(defaultClickReactionsDivList){
		defaultClickReactionsDivList.each(_loadPageReaction);
	}
	
	function serverLog(err){
		   sb.utilities.log("Error Message From Module - Click Reactions Controller : " + err);
	}
	
	function _toggleReactionList(e){

		var pageReactionId = sb.dom.find(this).attr("id").split("-")[1];
		var documentPageId = sb.dom.find(this).parent().attr("id").split("-")[1];
		
		var allReactionList = sb.dom.find('#TxtReactionList-'+documentPageId);
		allReactionList.find('.textReactionList-Comments').hide();
		allReactionList.find('.textReactionList-Replies').hide();
		allReactionList.find('.textAreaSection').hide();
		allReactionList.find('.defaultClickReactionList').fadeIn();
		allReactionList.find('.rplysection').removeClass('cmt');
		allReactionList.find('.rplysection').removeClass('ca');
		allReactionList.find('.cmntsection').removeClass('cmt');
		allReactionList.find('.cmntsection').removeClass('ca');
		allReactionList.find('.clickReacMessage').addClass('cmt');
		allReactionList.find('.clickReacMessage').addClass('ca');			
		allReactionList=null;
		sb.dom.find('#clickReacMessage-'+pageReactionId).removeClass("ui-icon-alert");
		sb.dom.find('#clickReacMessage-'+pageReactionId).removeClass("ui-btn-icon-left");
	}

	function _clickReactionWindowScroll(e){
		defaultClickReactionsDivList.each(_loadPageReaction);
	}
	
	function _reloadReactionsMessageReceived(input){
		defaultClickReactionsDivList.each(_loadPageReaction);
	}
	
	function _newStoryAddedMessageReceived(message){
   		//defaultClickReactionsDivList = sb.dom.find('.storyItemFooter');
   		//_loadPageReactionList(defaultClickReactionsDivList);
   		sb.dom.find(message.storyItemDivId).find('.hilite').bind('click',_addReaction);
   		sb.dom.find(message.storyItemDivId).find('.clickReacMessage').bind('click',_toggleReactionList);
   		sb.dom.find(message.storyItemDivId).find('.showMoreClickReactions').bind('click',_showMoreButtonClickEventFirst);
   		sb.dom.find(message.storyItemDivId).find('.timeago').timeago();
   		sb.dom.find(message.storyItemDivId).find('.sharePageButton').each(_setSharePageTooltipV2);
   		
   		sb.dom.find(message.storyItemDivId).find('.hiliteResponse').each(_setHiliteResponseButtonEvents);
   		sb.dom.find(message.storyItemDivId).find('.unhiliteResponse').each(_setUnHiliteResponseButtonEvents);
   		sb.dom.find(message.storyItemDivId).find('.ViewSummary').each(_setViewSummaryButtonEvents);
   		sb.dom.find(message.storyItemDivId).find('.ReactionAgreeCount').each(_setReactionAgreeCountButtonEvents);
	}
	
	function _sharePageSuccess(data){
		if(data.antahRequestStatus == 'SUCCESS'){
			addStoryItemToView(data.antahRestfulTxnResponse.storyitem);
		}else{
			Core.publish("displayMessage",{message: "There was a problem sharing this.", messageType: "failure"});
		}
	}
	
	   function addStoryItemToView(storyItem){
		   var storyItemHtml = tmpl(storyJSTemplateName, storyItem);
		   sb.dom.find(storiesDiv).prepend(sb.utilities.htmlDecode(storyItemHtml));
		   Core.publish("newStoryAdded", {storyItemDivId: "#storyItem-"+storyItem.storyDocumentPageId});
	   }
	   
	function _shareConfirmClicked(e){
		if(sb.utilities.isUserLoggedIn()){		
			var documentPageToBeSharedID = sb.dom.find(this).attr("id").split("-")[1];
			var shareTitle = sb.dom.find(this).parents(".sharePageDiv").find("#sharePageTitle-"+documentPageToBeSharedID).val();
			var documentoBeSharedOn = sb.dom.find(this).parents(".sharePageDiv").find("#sharePageOptions-"+documentPageToBeSharedID).val();
	
	
			sb.utilities.postV2(relPathIn+"sharepage.pvt?mediaType=json",{title: shareTitle, details: null, documentId: documentoBeSharedOn, documentpageid: documentPageToBeSharedID, albumId: null, allowPublicTextReactions: true, allowPrivateTextReactions: true, allowClickReactions: true}, _sharePageSuccess);
			
			sb.dom.find(this).parents(".sharePageDiv").slideUp();
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
	}
	
	function _shareConfirmFormSubmit(shareTitle, documentToBeSharedOn, documentPageToBeSharedID){
		if(sb.utilities.isUserLoggedIn()){
			sb.utilities.postV2(relPathIn+"sharepage.pvt?mediaType=json",{title: shareTitle, details: null, documentId: documentToBeSharedOn, documentpageid: documentPageToBeSharedID, albumId: null, allowPublicTextReactions: true, allowPrivateTextReactions: true, allowClickReactions: true}, _sharePageSuccess);
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}		

	}
	
	function _shareButtonClickEvent(e){
		sb.dom.find(this).parents('.storyItemFooter').find('.sharePageDiv').slideToggle();
		sb.dom.find(this).toggleClass("shareClick");
		
	}
	function _shareCancelClicked(e){
		sb.dom.find(this).parents('.storyItemFooter').find('.sharePageDiv').slideUp();
		sb.dom.find(this).parents('.storyItemFooter').find('.sharePageButton').removeClass('shareClick');
	}
	function _setSharePageTooltip(){
		try{
			
		var shareButton = sb.dom.find(this);
		var thisID = shareButton.attr("id");
		var thisDocumentPage = thisID.split("-")[1];
		var shareCard = sb.dom.wrap(sb.dom.find("#template-sharePage").html());

		sb.dom.find(shareCard).attr("id", "sharePageDiv-"+thisDocumentPage);
		sb.dom.find(shareCard).find("#sharePageOptions").attr("id", "sharePageOptions-"+thisDocumentPage);
		sb.dom.find(shareCard).find("#sharePageTitle").attr("id", "sharePageTitle-"+thisDocumentPage);		
		sb.dom.find(shareCard).find(".shareConfirm").attr("id", "sharePageConfirm-"+thisDocumentPage);		
		sb.dom.find(shareCard).find(".shareConfirm").click(_shareConfirmClicked);
		sb.dom.find(this).parents('.storyItemFooter').find('#storyItemFooterDiv-'+thisDocumentPage).append(shareCard);
		sb.dom.find(shareCard).find('.shareCancel').click(_shareCancelClicked);
		sb.dom.find(this).click(_shareButtonClickEvent);
		}catch(e){
			console.log(e);
		}
	}
	
	function _setUpShareButtonToolTipV2(){
		var storyItemHtml = sb.dom.find(this).parents('.storyItem').find("#storyItemTitle").html();		
		console.log(storyItemHtml);
		shareCardDialog = sb.dom.wrap(sb.dom.find("#template-sharePage").html());
		shareCardDialog.find(".shareContent").html(storyItemHtml);
		shareCardDialog.find(".shareDocumentPageID").val(sb.dom.find(this).attr("id").split("-")[1]);
		shareCardForm = shareCardDialog.find("form").on("submit", function(event){
			event.preventDefault();
			_shareConfirmFormSubmit(sb.dom.find(this).find("#sharePageTitle").val(), sb.dom.find(this).find("#sharePageOptions").val(), sb.dom.find(this).find(".shareDocumentPageID").val());
			shareCardDialog.dialog("close");
			shareCardDialog.dialog("destroy").remove();
		});
		shareCardDialog.dialog({
			  autoOpen: false,
			  resizable: false,
		   	  title: sb.dom.find("#jstemplate-clickReactionRePost").html(),
		   	  dialogClass: "opaque",
		   	  modal: false,
		   	  width: 350
		   });
		shareCardDialog.dialog("open");
	}
	
	function _setUpShareButtonClickEventV2(){
		sb.dom.find(this).click(_setUpShareButtonToolTipV2);
	}
	
	function _setSharePageTooltipV2(){
		try{
		sb.dom.find(this).each(_setUpShareButtonClickEventV2);
		}catch(e){
			console.log(e);
		}
	}
	
	function _setHiliteResponseButtonEvents(){
		sb.dom.find(this).on('click', _addHighlightToResponseButtonClicked);
	}
	
	function _setUnHiliteResponseButtonEvents(){
		sb.dom.find(this).on('click', _removeHighlightToResponseButtonClicked);
	}
	
	function _removeHighlightToResponseButtonClicked(e){
		if(sb.utilities.isUserLoggedIn()){
			console.log('remove agree clicked');
			var reactionID = sb.dom.find(this).attr('id').split('-')[1];
			var pageReactionType = sb.dom.find(this).attr('id').split('-')[2];		
			sb.utilities.serverDelete(relPathIn+'agreereaction.pvt/'+reactionID+'/'+pageReactionType+'?mediaType=json',null,_AgreeReactionDeleteReceived);		
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
	}
		
	function _AgreeReactionDeleteReceived(response){
		if(response.txnStatus == 'SUCCESS'){
				console.log('inside _AgreeReactionDeleteReceived');
				var documentPageID = response.documentPageId;
				var toReactionID = response.toReactionId;
				var pageReactionID = response.pageReactionId;
				var pageReactionType = response.pageReactionType;
				var pageReactionTitle = response.pageReactionTitle;
				var agreeCount = response.agreeCount;
				console.log(documentPageID + " " + toReactionID + " " + pageReactionID + " " + pageReactionType + " " + pageReactionTitle + " " + agreeCount);
				sb.dom.find("#UnHighlightReacSubmit-"+response.toReactionId+"-"+response.pageReactionType).remove();
				var agreeCountHtml = sb.dom.find("#jstemplate-reaction-highlight-count").html() + "(" + agreeCount + ")";
				sb.dom.find("#reactionAgreeCount-"+response.toReactionId).html(agreeCountHtml);
				
				var agreeHtml = sb.dom.find("#jstemplate-reaction-highlight-template").html();
				var agreeHtmlDom = sb.dom.wrap(agreeHtml);
				agreeHtmlDom.on('click', _addHighlightToResponseButtonClicked);
				
				agreeHtmlDom.attr('id', "HighlightReacSubmit-"+documentPageID+"-"+toReactionID+"-"+pageReactionID+"-"+pageReactionType+"-"+pageReactionTitle);
				sb.dom.find("#reactionHighlightArea-"+response.toReactionId).append(agreeHtmlDom);
				_repaintAgreeReactionList(toReactionID);
			}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	function _addHighlightToResponseButtonClicked(e){
		if(sb.utilities.isUserLoggedIn()){
			var documentPageID = sb.dom.find(this).attr('id').split('-')[1];
			var reactionID = sb.dom.find(this).attr('id').split('-')[2];
			var pageReactionID = sb.dom.find(this).attr('id').split('-')[3];
			var pageReactionType = sb.dom.find(this).attr('id').split('-')[4];
			var pageReactionTitle = sb.dom.find(this).attr('id').split('-')[5];
			sb.utilities.postV2(relPathIn+'reaction.pvt?mediaType=json',{toReactionId: reactionID, pageReactionId: pageReactionID, documentPageId: documentPageID, pageReactionType: pageReactionType, reactionType: "AGREE", pageReactionTitle: pageReactionTitle, reactionRichText: ""},_addHighlightToResponseReceived);
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
		}
	}
	
	function _addHighlightToResponseReceived(response){
		if(response.txnStatus == 'SUCCESS'){
		var documentPageID = response.documentPageId;
		var toReactionID = response.toReactionId;
		var pageReactionID = response.pageReactionId;
		var pageReactionType = response.pageReactionType;
		var pageReactionTitle = response.pageReactionTitle;
		var agreeCount = response.agreeCount;
		sb.dom.find("#HighlightReacSubmit-"+documentPageID+"-"+toReactionID+"-"+pageReactionID+"-"+pageReactionType+"-"+pageReactionTitle).remove();
		var agreeCountHtml = sb.dom.find("#jstemplate-reaction-highlight-count").html() + "(" + agreeCount + ")";
		sb.dom.find("#reactionAgreeCount-"+response.toReactionId).html(agreeCountHtml);
		
		var removeAgreeHtml = sb.dom.find("#jstemplate-reaction-highlight-remove").html();
		var removeAgreeDom = sb.dom.wrap(removeAgreeHtml);
		removeAgreeDom.on('click', _removeHighlightToResponseButtonClicked);
		removeAgreeDom.attr('id', "UnHighlightReacSubmit-"+response.toReactionId+"-"+response.pageReactionType);
		sb.dom.find("#reactionHighlightArea-"+response.toReactionId).append(removeAgreeDom);
		_repaintAgreeReactionList(toReactionId);
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	function _loadViewReactionList(response){		
		if(response.txnStatus='SUCCESS'){
			var viewSummaryButton = sb.dom.find('#ViewReacSummary-'+response.pageReactionId);
			var viewListCard = sb.dom.wrap(tmpl('tmpl-viewReactionlist', response));
			viewListCard.find('.timeago').timeago();
			viewSummaryButton.data('powertipjq', viewListCard);
			viewSummaryButton.powerTip({
				  placement: 'nw',
				  mouseOnToPopup: true,
				  smartPlacement: true,
				  offset: 10
			   });
			viewSummaryButton.powerTip('show');
			
		}else{
			console.log(sb.dom.find("#jstemplate-ErrorMessage").html());
		}
	}
	function _viewSummaryButtonClickEvent(e){
		var viewSummaryButtonId = sb.dom.find(this).attr('id');
		var viewSummaryPageReactionId = viewSummaryButtonId.split('-')[1];
		sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: viewSummaryPageReactionId, reactionCount: 25, retrieveSummary: "false"},_loadViewReactionList);
	}
	function _setViewSummaryButtonEvents(){
		sb.dom.find(this).on('click', _viewSummaryButtonClickEvent);
	}
	
	function _repaintAgreeReactionList(reactionId){
		sb.utilities.get(relPathIn+'reactionrel.pvt?mediaType=json',{reactionId: reactionId, relCount: "25", reactionRelType: "AGREE"},_loadAgreeReactionList);
	}
	function _ReactionAgreeCountButtonClickEvent(e){
		var agreeCountElementId = sb.dom.find(this).attr('id');
		var reactionId = agreeCountElementId.split('-')[1];
		sb.utilities.get(relPathIn+'reactionrel.pvt?mediaType=json',{reactionId: reactionId, relCount: "25", reactionRelType: "AGREE"},_loadAgreeReactionList);
	}
	
	function _loadAgreeReactionList(response){	
		if(response.txnStatus='SUCCESS'){
			var agreeCountElement = sb.dom.find('#reactionAgreeCount-'+response.reactionId);
			var agreeListCard = sb.dom.wrap(tmpl('tmpl-agreeReactionlist', response));
			agreeListCard.find('.timeago').timeago();
			agreeCountElement.data('powertipjq', agreeListCard);
			agreeCountElement.powerTip({
				  placement: 'e',
				  mouseOnToPopup: true,
				  smartPlacement: true,
				  offset: 10
			   });
			agreeCountElement.powerTip('show');
			
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	
	function _setReactionAgreeCountButtonEvents(){
		sb.dom.find(this).on('click', _ReactionAgreeCountButtonClickEvent);
	}
	
	function _pageSnippetAddedReceived(message){
   		//defaultClickReactionsDivList = sb.dom.find('.storyItemFooter');
   		//_loadPageReactionList(defaultClickReactionsDivList);
		console.log("Click Reactions Controller Snippet Added Recieved : MEssage ID " + JSON.stringify(message));
   		sb.dom.find(message.snippetId).find('.storyItem').each(
   				function(){
   					console.log("Sniipet Added Recieved : Story ID " + sb.dom.find(this).attr("id"));
   			   		sb.dom.find(this).find('.hilite').bind('click',_addReaction);
   			   		sb.dom.find(this).find('.clickReacMessage').bind('click',_toggleReactionList);
   			   		sb.dom.find(this).find('.showMoreClickReactions').bind('click',_showMoreButtonClickEventFirst);
   			   		sb.dom.find(this).find('.timeago').timeago();
   			   		sb.dom.find(this).find('.sharePageButton').each(_setSharePageTooltipV2);
   			   		sb.dom.find(this).find('.hiliteResponse').each(_setHiliteResponseButtonEvents);
   			   		sb.dom.find(this).find('.unhiliteResponse').each(_setUnHiliteResponseButtonEvents);
   			   		sb.dom.find(this).find('.ViewSummary').each(_setViewSummaryButtonEvents);
   			   		sb.dom.find(this).find('.ReactionAgreeCount').each(_setReactionAgreeCountButtonEvents);
   				}
   		);
	}
	
	function _startController(msg){
       		sb.dom.find('.hilite').bind('click',_addReaction);  
       		sb.dom.find('.sharePageButton').each(_setSharePageTooltipV2);
       		sb.dom.find('.clickReacMessage').bind('click',_toggleReactionList);
       		sb.dom.find('.showMoreClickReactions').click(_showMoreButtonClickEventFirst);
       		sb.dom.find('.hiliteResponse').each(_setHiliteResponseButtonEvents);
       		sb.dom.find('.unhiliteResponse').each(_setUnHiliteResponseButtonEvents);
       		sb.dom.find('.ViewSummary').each(_setViewSummaryButtonEvents);
       		sb.dom.find('.ReactionAgreeCount').each(_setReactionAgreeCountButtonEvents);
      		
       		//defaultClickReactionsDivList = sb.dom.find('.storyItemFooter');
       		//_loadPageReactionList(defaultClickReactionsDivList);
       		//sb.dom.find(window).scroll(sb.dom.debounce(5000, _clickReactionWindowScroll));
       		Core.subscribe('reloadReactions', _reloadReactionsMessageReceived);
       		Core.subscribe('newStoryAdded', _newStoryAddedMessageReceived);		
			Core.subscribe('pageSnippetAdded', _pageSnippetAddedReceived);
			Core.subscribe('reloadPageReaction', _reloadPageReactionMessageReceived);
	}
	
	function _reloadPageReactionMessageReceived(pageReactionInfo){
		if(pageReactionInfo.pageReactionType == 'CLICK'){
			sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionInfo.pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false"},_loadReactionList);
		}
	}
	
   return{
	   init:function() {
       	try{      
			Core.subscribe('startStoryItemController', _startController);

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