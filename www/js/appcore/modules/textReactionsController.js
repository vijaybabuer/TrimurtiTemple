var textReactionsController = function(sb, input){
	var pgReacInfo=null, relPathIn=input.relPath, docPageId=null, reactionCountPerPage=input.reactionCountPerPage, pgReacEnabled=null, pgReactionTitle=null, reacId=null, pageReactionSummary = null, curTarget=null, replyReacInfo=null,toReactionId=null,
	TxtReactionListDiv=null, reactionType=null, pageReactionType=null, reactionText = null, reactionsLoadedStatus = "LOADED";
	
	function _addTextReaction(e){
	 try{		
		if(sb.utilities.isUserLoggedIn()){
			reactionText =  tinymce.html.Entities.encodeNumeric(sb.dom.find('#'+e.currentTarget.id).parent().find('.txtara').val());
			sb.dom.find('#'+e.currentTarget.id).parent().find('.txtara').val("");
			docPageId = e.currentTarget.id.split("-")[1];
			var addPageReactionTitle=sb.dom.find("#TxtReactionList-"+docPageId).find(".textReacSelection").html();
			var addPageReactionType = null;
			var addReactionType = null;
			if(addPageReactionTitle == "Comments"){
				addPageReactionType="PBRTRMK";
				addReactionType="PBRTRMK";
			}else if(addPageReactionTitle == "Replies"){
				addPageReactionType="PRRTRMK";
				addReactionType="PRRTRMK";
			}else{
				Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
			}
			if(reactionText != "" && reactionText != null && reactionText != sb.dom.find("#jstemplate-commentMsg").html() &&  reactionText != sb.dom.find("#jstemplate-replyMsg").html()){
				sb.utilities.postV2(relPathIn+'reaction.pvt?mediaType=json',{reactionId: "", pageReactionId: "", documentPageId: docPageId, pageReactionType: addPageReactionType, reactionType: addReactionType, pageReactionTitle: addPageReactionTitle, reactionRichText: sb.utilities.htmlEncode(reactionText)},_reactionAdded);
			}else{
				//Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-plsEntrTxt").html(), messageType: "failure"});
			}			
		}else{
			Core.publish('unAuthorizedFunctionality', {module: 'Comment or Reply'});
		}
	 }
	 catch(err){
		 serverLog(err);
	 }
	}
	
	function _updateTextReactionView(reaction){
			pageReactionSummary = reaction.pageReactionSummary;
			sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionSummary.pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false"},_reLoadReactionList);
			Core.publish('newReactionAdded', null);
			
	}
	
	function _reLoadReactionList(pageReactionDetail){
		_updateReactionList(pageReactionDetail, "RELOAD");
		Core.publish('newReactionAdded', null);	
	}
	function _loadReactionList(pageReactionDetail){
		_updateReactionList(pageReactionDetail, "LOAD");
	}
	
	function _updateReactionListForDiv(allTextRactionsDiv, reactionsDiv, reactionsDivMessageArea, noReactionsMessage, reactionsListArea, pageReactionDetail, loadFlag){
			if(pageReactionDetail.pageReactionCount == "0" || pageReactionDetail.pageReactionCount == "" || pageReactionDetail.pageReactionCount == null){
				reactionsDivMessageArea.html(noReactionsMessage);
				reactionsDivMessageArea.show();
				var textReactionTitleLabel = sb.dom.find("#jstemplate-"+pageReactionDetail.pageReactionTitle+"Label").html();			
				allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"-"+pageReactionDetail.documentPageId).html(textReactionTitleLabel);
				sb.dom.find('#'+pageReactionDetail.pageReactionTitle+'ReacSummary-'+pageReactionDetail.documentPageId).html(textReactionTitleLabel);
				reactionsListArea.html("");
				allTextRactionsDiv.removeClass(pageReactionDetail.pageReactionTitle);
			}else{
				reactionsDivMessageArea.hide();
				if(loadFlag == "LOAD" || loadFlag == "RELOAD"){
					if(reactionsDiv.find("#TxtReactionList-"+pageReactionDetail.documentPageId+"-"+pageReactionDetail.pageReactionType)){
						reactionsDiv.find("#TxtReactionList-"+pageReactionDetail.documentPageId+"-"+pageReactionDetail.pageReactionType).remove();
					}					
				}

				reactionsListArea.append(sb.utilities.htmlDecode(tmpl("tmpl-txtPageReactionlist", pageReactionDetail)));
				reactionsListArea.find(".timeago").timeago();
				// not needed as the txtPageReactionList includes the replies as well. 
				//if(pageReactionDetail.pageReactionType == 'PRRTRMK' || pageReactionDetail.pageReactionType == 'PBRTRMK'){
					//_showRepliesToReactions(pageReactionDetail.reactionResponseList);
				//}
				

				if(pageReactionDetail.hasNewEntry){
					allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"-"+pageReactionDetail.documentPageId).addClass("ui-icon-alert");
					allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"-"+pageReactionDetail.documentPageId).addClass("ui-btn-icon-left");
				}
				var textReactionTitleLabel = sb.dom.find("#jstemplate-"+pageReactionDetail.pageReactionTitle+"Label").html();
				textReactionTitleLabel=textReactionTitleLabel + '(' + pageReactionDetail.pageReactionCount + ')';
				allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"-"+pageReactionDetail.documentPageId).html(textReactionTitleLabel);	
				sb.dom.find('#'+pageReactionDetail.pageReactionTitle+'ReacSummary-'+pageReactionDetail.documentPageId).html(textReactionTitleLabel);
				if(allTextRactionsDiv.hasClass(pageReactionDetail.pageReactionTitle)){
					;
				}else{
					allTextRactionsDiv.addClass(pageReactionDetail.pageReactionTitle);
				}
			}	
			var reacTitleToShow = allTextRactionsDiv.find('.textReacSelection').html();
			if(loadFlag == "LOAD"){
				if(allTextRactionsDiv.hasClass("Comments")){
					_commentsSelected("Comments", pageReactionDetail.documentPageId);
				}else if(allTextRactionsDiv.hasClass("Replies")){			
					_repliesSelected("Replies", pageReactionDetail.documentPageId);			
				}else{
					_commentsSelected("Comments", pageReactionDetail.documentPageId);
				}				
			}else{
				if(pageReactionDetail.pageReactionTitle=="Comments"){
					_commentsSelected("Comments", pageReactionDetail.documentPageId);
				}else if(pageReactionDetail.pageReactionTitle=="Replies"){
					_repliesSelected("Replies", pageReactionDetail.documentPageId);	
				}
			}
	
			reactionsListArea.find('.rpltxtreac').bind('click',_replyLinkClicked);
			reactionsListArea.find('.cancelrpltxtreac').bind('click',_replyCancelled);
			reactionsListArea.find('.ReplyReacSubmit').bind('click',_replySubmit);
			reactionsListArea.find('.rplytxtara').bind('keydown', _replySubmitKeyPressed);
			reactionsListArea.find('a.remtxtreac').bind('click', _removeReaction);
			reactionsListArea.find('a.remtxtreacall').bind('click', _removeAllReactionsFromUser);
			reactionsListArea.find('.hiliteResponse').each(_setHiliteResponseButtonEvents);
			reactionsListArea.find('.unhiliteResponse').each(_setUnHiliteResponseButtonEvents);		
	
			allTextRactionsDiv.addClass(reactionsLoadedStatus);
			sb.dom.find('#storyItemFooter-'+pageReactionDetail.documentPageId).addClass(reactionsLoadedStatus);
			Core.publish('contactToolTipAdded', {divId: "#"+allTextRactionsDiv.attr('id')});
			if(pageReactionDetail.pageReactionHasMoreReactions){
				var showMoreButton = reactionsDiv.find('.showMore');
				showMoreButton.data("showMoreData", {
					documentPageId: pageReactionDetail.documentPageId,
					pageReactionType: pageReactionDetail.pageReactionType,
					pageReactionTitle: pageReactionDetail.pageReactionTitle,
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
		
	}
	function _updateReactionList(pageReactionDetail, loadFlag){
		try{		
		if(pageReactionDetail.txnStatus == "SUCCESS"){
			try{
			var allTextRactionsDiv = sb.dom.find("#storiesDiv").find("#TxtReactionList-"+pageReactionDetail.documentPageId);	
			var reactionsDiv=allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"Div-"+pageReactionDetail.documentPageId);
			var reactionsDivMessageArea=reactionsDiv.find(".TextReactionList-message");
			var noReactionsMessage = sb.dom.find("#jstemplate-No"+pageReactionDetail.pageReactionTitle+"Label").html();
			var reactionsListArea=reactionsDiv.find(".textReactionList");
			_updateReactionListForDiv(allTextRactionsDiv, reactionsDiv, reactionsDivMessageArea, noReactionsMessage, reactionsListArea, pageReactionDetail, loadFlag);
			if(sb.dom.find('.subContainer').length > 0){
				allTextRactionsDiv = sb.dom.find(".subContainer").first().find("#TxtReactionList-"+pageReactionDetail.documentPageId);	
				reactionsDiv=allTextRactionsDiv.find("#"+pageReactionDetail.pageReactionTitle+"Div-"+pageReactionDetail.documentPageId);
				reactionsDivMessageArea=reactionsDiv.find(".TextReactionList-message");
				noReactionsMessage = sb.dom.find("#jstemplate-No"+pageReactionDetail.pageReactionTitle+"Label").html();
				reactionsListArea=reactionsDiv.find(".textReactionList");
				_updateReactionListForDiv(allTextRactionsDiv, reactionsDiv, reactionsDivMessageArea, noReactionsMessage, reactionsListArea, pageReactionDetail, loadFlag);
			}
			}catch(e){
				alert('1 ' + e);	
			}
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}

		}catch(err){
			alert(err);	
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
			Core.publish('unAuthorizedFunctionality', {module: 'Comment or Reply'});
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
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
	}
	
	function _showRepliesToReactions(reactionResponseList){
		sb.utilities.each(reactionResponseList, _showReplies);
	}
	
	function _showReplies(idx, reactionResponse){
		if(reactionResponse.replyReactionResponseList != null ){
			var reactionRepliesDiv = null;
			reactionRepliesDiv = sb.dom.find("#RepliesToReplies-"+reactionResponse.reactionId);
			reactionRepliesDiv.show();
			//reactionRepliesDiv.find(".header").html(sb.dom.find("#jstemplate-hideReplies").html());
			reactionRepliesDiv.find(".replies").append(tmpl("tmpl-replyReactionResponseList", reactionResponse));
			reactionRepliesDiv.find(".timeago").timeago();
			reactionRepliesDiv.find('a.remtxtreac').bind('click', _removeReaction);
			reactionRepliesDiv.find('a.remtxtreacall').bind('click', _removeAllReactionsFromUser);
		}		
	}
	
	
	   function _removeReaction(e){
		   var deleteStoryButton = sb.dom.find(this);
		   var buttonId = deleteStoryButton.attr('id');
		   var storyId = buttonId.split('-')[1];
		   _deleteStoryConfirm(storyId);
		   var deleteStoryDialog=sb.dom.find("#DeleteDocument-Confirm");
		   deleteStoryDialog.html(sb.dom.find("#StoryItemController-StoryItemDelete-Confirm").html());
		   deleteStoryDialog.dialog({
			  resizable: false,
		   	  title: sb.dom.find("#jstemplate-MessageDisplayController-GeneralNote").html(),
		   	  dialogClass: "opaque",
		   	  modal: true,
		   	  buttons: [
		   		{text: sb.dom.find("#jstemplate-confirmLabel").html(), click: function(){_deleteStoryConfirm(storyId);sb.dom.find(this).dialog("close");}, class: "ab"},
		   		{text: sb.dom.find("#jstemplate-cancelLabel").html(), click: function(){sb.dom.find(this).dialog("close");}, class: "br"}
		   	  ]
		   });
	   }
	   
	   function _removeReactionConfirm(reactionId, pageReactionType, reactionType){
			if(sb.utilities.isUserLoggedIn()){
			   sb.utilities.serverDelete(relPathIn+'textreaction.pvt/'+reactionId+'/'+pageReactionType+'/'+reactionType+'/false?mediaType=json',null,_reactionDeleted);
			}else{
				Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
			}
	   }
	   
	   function _removeAllReactionsFromUserConfirm(reactionId, pageReactionType, reactionType){
			if(sb.utilities.isUserLoggedIn()){
			   sb.utilities.serverDelete(relPathIn+'textreaction.pvt/'+reactionId+'/'+pageReactionType+'/'+reactionType+'/true?mediaType=json',null,_reactionDeleted);
			}else{
				Core.publish('unAuthorizedFunctionality', {module: 'Highlight'});
			}
	   }
	   
	function _removeReaction(e){
		try{
			var reactionId = e.currentTarget.id.split("-")[1];
			var pageReactionType = e.currentTarget.id.split("-")[2];
			var reactionType = e.currentTarget.id.split("-")[3];
			_removeReactionConfirm(reactionId, pageReactionType, reactionType);

			
		}catch(err){
			console.log(err);
		}
	}
	
	function _removeAllReactionsFromUser(e){
		try{
			var reactionId = e.currentTarget.id.split("-")[1];
			var pageReactionType = e.currentTarget.id.split("-")[2];
			var reactionType = e.currentTarget.id.split("-")[3];
			_removeAllReactionsFromUserConfirm(reactionId, pageReactionType, reactionType);
		}catch(err){
			console.log(err);
		}
	}
	
	
	function _reactionDeleted(reaction){		
		if(reaction.txnStatus == 'SUCCESS'){
			_updateTextReactionView(reaction);			
			//Core.publish("displayMessage",{message: "Your reaction was removed.", messageType: "success"});
		}else{
			Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-ErrorMessage").html(), messageType: "failure"});
		}
		
	}
	function _reactionAdded(reaction){
		if(reaction.txnStatus == 'SUCCESS'){
			_updateTextReactionView(reaction);
			//Core.publish("displayMessage",{message: "Story was highlighted.", messageType: "success"});
		}else{
			Core.publish("displayMessage",{message: "There was a problem adding your response to the story. Please try again later.", messageType: "failure"});
		}
		
	}

	function _loadPageReaction(){
		var documentPageId = sb.dom.find(this).attr("id").split("-")[1];
		var txtReactionListDivVisible = sb.dom.find(this).visible('partial');

		if(sb.dom.find(this).hasClass("Comments") && txtReactionListDivVisible){
			if(!sb.dom.find(this).hasClass(reactionsLoadedStatus)){
				sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: "", documentPageId: documentPageId, pageReactionTitle: "Comments", pageReactionType: "PBRTRMK", reactionCount: reactionCountPerPage, retrieveSummary: "false"},_loadReactionList);
			}						
		}else{
			if(txtReactionListDivVisible){
				var noReactionsMessage = sb.dom.find("#jstemplate-NoCommentsLabel").html();
				var reactionsDiv=sb.dom.find("#CommentsDiv-"+documentPageId);
				var reactionsDivMessageArea=reactionsDiv.find(".TextReactionList-message");
				var reactionsListArea=reactionsDiv.find(".textReactionList");
				
				reactionsDivMessageArea.html(noReactionsMessage);
				reactionsDivMessageArea.show();
				var textReactionTitleLabel = sb.dom.find("#jstemplate-CommentsLabel").html();			
				sb.dom.find("#Comments-"+documentPageId).html(textReactionTitleLabel);
				reactionsListArea.html("");
			}
		}
		if(sb.dom.find(this).hasClass("Replies") && txtReactionListDivVisible){
			if(!sb.dom.find(this).hasClass(reactionsLoadedStatus)){
				sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: "", documentPageId: documentPageId, pageReactionTitle: "Replies", pageReactionType: "PRRTRMK", reactionCount: reactionCountPerPage, retrieveSummary: "false"},_loadReactionList);
			}			
		}else{
			if(txtReactionListDivVisible){
				var noReactionsMessage = sb.dom.find("#jstemplate-NoRepliesLabel").html();
				var reactionsDiv=sb.dom.find("#RepliesDiv-"+documentPageId);
				var reactionsDivMessageArea=reactionsDiv.find(".TextReactionList-message");
				var reactionsListArea=reactionsDiv.find(".textReactionList");
				
				reactionsDivMessageArea.html(noReactionsMessage);
				reactionsDivMessageArea.show();
				var textReactionTitleLabel = sb.dom.find("#jstemplate-RepliesLabel").html();			
				sb.dom.find("#Replies-"+documentPageId).html(textReactionTitleLabel);
				reactionsListArea.html("");
			}
		}
		
		
		//sb.dom.find("#submitTxtReaction-"+documentPageId).attr("value",sb.dom.find("#jstemplate-commentMsg").html());
		sb.dom.find("#CommentReplyArea-"+documentPageId).html(sb.dom.find("#jstemplate-commentMsg").html());
		
	}
	
	function _hideRemark(){
		sb.dom.find(this).hide();
	}
	
	function _loadTextPageReactionList(TxtReactionListDiv){		
		TxtReactionListDiv.each(_loadPageReaction);
	}
	
	function serverLog(err){
		   sb.utilities.log("Error Message From Module - Albums Controller : " + err);
	}
	
	function _toggleReactionList(){
		sb.dom.find(this).parent().find('.clickReactionList').slideToggle();
	}
	
	function _commentsSelectedEvent(e){
		pgReacInfo=e.currentTarget.id.split("-");
		pgReactionTitle=pgReacInfo[0];
		docPageId=pgReacInfo[1];

		_commentsSelected(pgReactionTitle,docPageId);
	}
	function _commentsSelected(inputPgReactionTitle, docPageId){

   		reactionType="PBRTRMK";    
   		pageReactionType="PBRTRMK";
   		pgReactionTitle=inputPgReactionTitle;
		sb.dom.find('#TxtReactionList-'+docPageId).find('.textReacSelection').html('Comments');
		sb.dom.find('#CommentsDiv-'+docPageId).hide();
		sb.dom.find('#RepliesDiv-'+docPageId).hide();
		var reacTypeToShow = inputPgReactionTitle;
		sb.dom.find('#'+reacTypeToShow+'Div-'+docPageId).fadeIn();
		
		sb.dom.find("#submitTxtCommentReaction-"+docPageId).attr("value",sb.dom.find("#jstemplate-commentMsg").html());
		sb.dom.find("#CommentArea-"+docPageId).val(sb.dom.find("#jstemplate-commentMsg").html());
		sb.dom.find("#Comments-"+docPageId).addClass("cmt");sb.dom.find("#Replies-"+docPageId).removeClass("cmt");
		sb.dom.find("#Comments-"+docPageId).addClass("ca");sb.dom.find("#Replies-"+docPageId).removeClass("ca");
		sb.dom.find("#Comments-"+docPageId).removeClass("ui-btn-icon-left");
		sb.dom.find("#Comments-"+docPageId).removeClass("ui-icon-alert");
		sb.dom.find('#TxtReactionList-'+docPageId).find('.clickReacMessage').removeClass("cmt");
		sb.dom.find('#TxtReactionList-'+docPageId).find('.clickReacMessage').removeClass("ca");
		sb.dom.find('#TxtReactionList-'+docPageId).find('.defaultClickReactionList').hide();
		sb.dom.find('#TxtReactionList-'+docPageId).find('.textAreaSection').show();
	}
	function _repliesSelectedEvent(e){		
		pgReacInfo=e.currentTarget.id.split("-");
		pgReactionTitle=pgReacInfo[0];
		docPageId=pgReacInfo[1];

		_repliesSelected(pgReactionTitle, docPageId);
	}
	function _repliesSelected(inputPgReactionTitle, docPageId){
   		reactionType="PRRTRMK";    
   		pageReactionType="PRRTRMK";
   		pgReactionTitle=inputPgReactionTitle;
		sb.dom.find('#TxtReactionList-'+docPageId).find('.textReacSelection').html('Replies');
		sb.dom.find('#CommentsDiv-'+docPageId).hide();
		sb.dom.find('#RepliesDiv-'+docPageId).hide();
		var reacTypeToShow = inputPgReactionTitle;
		sb.dom.find('#'+reacTypeToShow+'Div-'+docPageId).fadeIn();
		
		sb.dom.find("#submitTxtReplyReaction-"+docPageId).attr("value",sb.dom.find("#jstemplate-replyMsg").html());
		sb.dom.find("#ReplyArea-"+docPageId).val(sb.dom.find("#jstemplate-replyMsg").html());
		sb.dom.find("#Replies-"+docPageId).addClass("cmt");sb.dom.find("#Comments-"+docPageId).removeClass("cmt");
		sb.dom.find("#Replies-"+docPageId).addClass("ca");sb.dom.find("#Comments-"+docPageId).removeClass("ca");	
		sb.dom.find("#Replies-"+docPageId).removeClass("ui-btn-icon-left");
		sb.dom.find("#Replies-"+docPageId).removeClass("ui-icon-alert");
		
		sb.dom.find('#TxtReactionList-'+docPageId).find('.clickReacMessage').removeClass("cmt");
		sb.dom.find('#TxtReactionList-'+docPageId).find('.clickReacMessage').removeClass("ca");
		sb.dom.find('#TxtReactionList-'+docPageId).find('.defaultClickReactionList').hide();		
		sb.dom.find('#TxtReactionList-'+docPageId).find('.textAreaSection').show();
	}
	
	function _replyLinkClicked(e){
		sb.dom.find('#'+e.currentTarget.id).parent().find('.replyarea').fadeIn();
	}
	function _replyCancelled(e){
		sb.dom.find('#'+e.currentTarget.id).parent().fadeOut();
	}
	
	function _replySubmit(e){
		sb.dom.find('#'+e.currentTarget.id).parent().fadeOut();
		 try{
			if(sb.utilities.isUserLoggedIn()){
				reactionText = sb.dom.find('#'+e.currentTarget.id).parent().find('.rplytxtara').val();
				sb.dom.find('#'+e.currentTarget.id).parent().find('.rplytxtara').val("");
				docPageId = e.currentTarget.id.split("-")[1];
				toReactionId=e.currentTarget.id.split("-")[2];			
				if(reactionText != "" && reactionText != null && reactionText != sb.dom.find("#jstemplate-commentMsg").html() &&  reactionText != sb.dom.find("#jstemplate-replyMsg").html()){
					sb.utilities.postV2(relPathIn+'reaction.pvt?mediaType=json',{reactionId: "", pageReactionId: "", documentPageId: docPageId, pageReactionType: "PRRTRMK", reactionType: "PRRTRPL", pageReactionTitle: pgReactionTitle, reactionRichText: sb.utilities.htmlEncode(reactionText), toReactionId: toReactionId},_reactionAdded);
				}else{
					Core.publish("displayMessage",{message: sb.dom.find("#jstemplate-plsEntrTxt").html(), messageType: "failure"});
				}
			}else{
				Core.publish('unAuthorizedFunctionality', {module: 'Comment or Reply'});
			}
		 }
		 catch(err){
			 serverLog(err);
		 }
	}
	
	
	function _textBoxClickEvent(e){
		var textareacontent = sb.dom.find(this).val();
		if(textareacontent == sb.dom.find("#jstemplate-commentMsg").html() || textareacontent == sb.dom.find("#jstemplate-replyMsg").html()){
			sb.dom.find(this).val("");
		}
	}
	
	function _cancelButtonClickEvent(e){
		var textareacontent = sb.dom.find(this).parent().find('.txtara').val();
		if(textareacontent == sb.dom.find("#jstemplate-commentMsg").html() || textareacontent == sb.dom.find("#jstemplate-replyMsg").html()){
			
		}else{
			sb.dom.find(this).parent().find('.txtara').val("");
		}
	}
	
	function _textBoxKeyDownEvent(e){
		 var keycode = (e.keyCode ? e.keyCode : e.which);
		 if(keycode == 13){
			 e.preventDefault();
			 _addTextReaction(e);
		 }
	}
	
	function _replySubmitKeyPressed(e){
		var keycode = (e.keyCode ? e.keyCode : e.which);
		 if(keycode == 13){
			 e.preventDefault();
			 _replySubmit(e);
		 }
	}

	function _txtReactionWindowScroll(e){		
		TxtReactionListDiv.each(_loadPageReaction);
	}
	
	function _reloadReactionsMessageReceived(input){
		_loadTextPageReactionList(TxtReactionListDiv);
	}
	
	function _showMoreReactions(pageReactionDetail){
		_updateReactionList(pageReactionDetail, "SHOWMORE"); 
	}
	function _showMoreButtonClickEvent(e){
		var showMoreData = sb.dom.find(this).data("showMoreData");

		
		sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: "", documentPageId: showMoreData.documentPageId, pageReactionType: showMoreData.pageReactionType, pageReactionTitle: showMoreData.pageReactionTitle, reactionCount: reactionCountPerPage, retrieveSummary: "false", lastReactionCreatedDate: showMoreData.latestReactionDate}, _showMoreReactions);
	}
	
	function _newStoryAddedMessageReceived(message){
		//TxtReactionListDiv = sb.dom.find('.storyItemFooter');
		//_loadTextPageReactionList(TxtReactionListDiv);
		
		sb.dom.find(message.storyItemDivId).find('.rpltxtreac').bind('click',_replyLinkClicked);
		sb.dom.find(message.storyItemDivId).find('.cancelrpltxtreac').bind('click',_replyCancelled);
		sb.dom.find(message.storyItemDivId).find('.ReplyReacSubmit').bind('click',_replySubmit);
		sb.dom.find(message.storyItemDivId).find('.rplytxtara').bind('keydown', _replySubmitKeyPressed);
		sb.dom.find(message.storyItemDivId).find('a.remtxtreac').bind('click', _removeReaction);
		sb.dom.find(message.storyItemDivId).find('a.remtxtreacall').bind('click', _removeAllReactionsFromUser);
		sb.dom.find(message.storyItemDivId).find('.txtreaction').bind('click',_addTextReaction);
		sb.dom.find(message.storyItemDivId).find('.cmntsection').bind('click',_commentsSelectedEvent);
		sb.dom.find(message.storyItemDivId).find('.rplysection').bind('click',_repliesSelectedEvent);
		sb.dom.find(message.storyItemDivId).find('.txtara').bind('click', _textBoxClickEvent);
		sb.dom.find(message.storyItemDivId).find('.txtaracancel').bind('click', _cancelButtonClickEvent);
		sb.dom.find(message.storyItemDivId).find('.txtara').bind('keydown', _textBoxKeyDownEvent);
		sb.dom.find(message.storyItemDivId).find('.showMoreTextReactions').click(_showMoreButtonClickEventFirst);
		sb.dom.find(message.storyItemDivId).find('.timeago').timeago();
	}
	
	function _showMoreButtonClickEventFirst(e){
		var documentPageId = sb.dom.find(this).attr("id").split("-")[1];
		var pageReactionTitle = sb.dom.find(this).attr("id").split("-")[2];
		var pageReactionType = sb.dom.find(this).attr("id").split("-")[3];
		sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: "", documentPageId: documentPageId, pageReactionType: pageReactionType, pageReactionTitle: pageReactionTitle, reactionCount: 10, retrieveSummary: "false"}, _showMoreReactions);
		sb.dom.find(this).parent().find('.textReactionList').html("");
	}
	
	function _pageSnippetAddedReceived(message){
   		sb.dom.find(message.snippetId).find('.storyItem').each(
   				function(){
   					console.log("Sniipet Added Recieved : Story ID " + sb.dom.find(this).attr("id"));
   					sb.dom.find(this).find('.rpltxtreac').bind('click',_replyLinkClicked);
   					sb.dom.find(this).find('.cancelrpltxtreac').bind('click',_replyCancelled);
   					sb.dom.find(this).find('.ReplyReacSubmit').bind('click',_replySubmit);
   					sb.dom.find(this).find('.rplytxtara').bind('keydown', _replySubmitKeyPressed);
   					sb.dom.find(this).find('a.remtxtreac').bind('click', _removeReaction);
   					sb.dom.find(this).find('a.remtxtreacall').bind('click', _removeAllReactionsFromUser);
   					sb.dom.find(this).find('.txtreaction').bind('click',_addTextReaction);
   					sb.dom.find(this).find('.cmntsection').bind('click',_commentsSelectedEvent);
   					sb.dom.find(this).find('.rplysection').bind('click',_repliesSelectedEvent);
   					sb.dom.find(this).find('.txtara').bind('click', _textBoxClickEvent);
   					sb.dom.find(this).find('.txtaracancel').bind('click', _cancelButtonClickEvent);
   					sb.dom.find(this).find('.txtara').bind('keydown', _textBoxKeyDownEvent);
   					sb.dom.find(this).find('.showMoreTextReactions').click(_showMoreButtonClickEventFirst);
   					sb.dom.find(this).find('.timeago').timeago();
   				}
   		);
	}	
	
	function _reloadPageReactionMessageReceived(pageReactionInfo){
		if(pageReactionInfo.pageReactionType != 'CLICK'){
			sb.utilities.get(relPathIn+'pageReaction.pvt?mediaType=json',{pageReactionId: pageReactionInfo.pageReactionId, reactionCount: reactionCountPerPage, retrieveSummary: "false"},_reLoadReactionList);
		}
	}
	function _startController(msg){
       		sb.dom.find('.txtreaction').bind('click',_addTextReaction);
       		sb.dom.find('.cmntsection').bind('click',_commentsSelectedEvent);
       		sb.dom.find('.rplysection').bind('click',_repliesSelectedEvent);
       		sb.dom.find('.txtara').bind('click', _textBoxClickEvent);
       		sb.dom.find('.txtaracancel').bind('click', _cancelButtonClickEvent);
       		sb.dom.find('.txtara').bind('keydown', _textBoxKeyDownEvent);
       		sb.dom.find('.showMoreTextReactions').click(_showMoreButtonClickEventFirst);
       		sb.dom.find('.rpltxtreac').bind('click',_replyLinkClicked);
       		sb.dom.find('.cancelrpltxtreac').bind('click',_replyCancelled);
       		sb.dom.find('.ReplyReacSubmit').bind('click',_replySubmit);
       		sb.dom.find('.rplytxtara').bind('keydown', _replySubmitKeyPressed);
       		sb.dom.find('a.remtxtreac').bind('click', _removeReaction);
       		sb.dom.find('a.remtxtreacall').bind('click', _removeAllReactionsFromUser);       		
       		//TxtReactionListDiv = sb.dom.find('.storyItemFooter');
       		//TxtReactionListDiv.find(".textReactionList").html(sb.dom.find("#jstemplate-Loading").html());
       		//_loadTextPageReactionList(TxtReactionListDiv);
       		//sb.dom.find(window).scroll(_txtReactionWindowScroll);
       		Core.subscribe('reloadReactions', _reloadReactionsMessageReceived);
       		Core.subscribe('newStoryAdded', _newStoryAddedMessageReceived);		
			Core.subscribe('pageSnippetAdded', _pageSnippetAddedReceived);
			Core.subscribe('reloadPageReaction', _reloadPageReactionMessageReceived);
	}
   return{
	   init:function() {
       	try{       	
       		pgReactionTitle="Comments";
       		reactionType="PBRTRMK";    
       		pageReactionType="PBRTRMK";
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