function AntahDocument(){}
AntahDocument.prototype.documentId ='';
AntahDocument.prototype.documentTypeCd ='';
AntahDocument.prototype.documentStatusCd='';
AntahDocument.prototype.documentName='';
AntahDocument.prototype.documentSeqNo='';
AntahDocument.prototype.createDate='';
AntahDocument.prototype.endDate='';
AntahDocument.prototype.lastUpdatedDate='';
AntahDocument.prototype.lastUpdatedUser='';

AntahDocument.prototype.setDocumentId = function(documentId){
	this.documentId=documentId;
};
AntahDocument.prototype.setDocumentTypeCd = function(documentTypeCd){
	this.documentTypeCd=documentTypeCd;
};
AntahDocument.prototype.setDocumentStatusCd= function(documentStatusCd){
	this.documentStatusCd=documentStatusCd;
};
AntahDocument.prototype.setDocumentName = function(documentName){
	this.documentName=documentName;
};
AntahDocument.prototype.setDocumentSeqNo = function(documentSeqNo){
	this.documentSeqNo=documentSeqNo;
};
AntahDocument.prototype.setCreateDate = function(createDate){
	this.createDate=createDate;
};
AntahDocument.prototype.setEndDate = function(endDate){
	this.endDate=endDate;
};
AntahDocument.prototype.setLastUpdatedDate = function(lastUpdatedDate){
	this.lastUpdatedDate=lastUpdatedDate;
};
AntahDocument.prototype.setLastUpdatedUser = function(lastUpdatedUser){
	this.lastUpdatedUser=lastUpdatedUser;
};

AntahDocument.prototype.postSuccess = function(document){
	Core.publish('AntahDocumentPostSuccess', document);
};
AntahDocument.prototype.add = function(sb, relPath){
	var thisJsonString = JSON.stringify(this);
	sb.utilities.post(relPath+'document.pvt',thisJsonString, this.postSuccess);
};