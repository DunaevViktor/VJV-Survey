public with sharing class ImageUploadController {
  
    @AuraEnabled
    public static String uploadImage(String imageName, String imageBase64Data, String imageDocumentId) {
        ContentDocument imageDocument = getContentDocumentById(imageDocumentId);
        String imageId = (imageDocument == null) ? null : imageDocument.Id;
        ContentVersion imageVersion = createContentVersion(imageName, imageBase64Data, imageId);
        String imageUpdatedId = (imageVersion == null) ? '' : imageVersion.ContentDocumentId;
        ContentDistribution imageDistribution = createContentDistribution(imageVersion);
        String imageUrl = (imageDistribution == null) ? '' : imageDistribution.ContentDownloadUrl;
        ImageDataWrapper imageData = new ImageDataWrapper(imageUpdatedId, imageUrl);
        String serializedImageData = JSON.serialize(imageData);
        return serializedImageData;
    }
    
    @AuraEnabled
    public static void deleteImageById(String imageDocumentId) {
        if (ContentDocument.SObjectType.getDescribe().isAccessible() 
            && Schema.sObjectType.ContentDocument.isDeletable()) {
                ContentDocument imageDocument = [SELECT Id
                                                 FROM ContentDocument
                                                 WHERE Id = :imageDocumentId
                                                 WITH SECURITY_ENFORCED
                                                 LIMIT 1];
                delete imageDocument;
            }
    }
    
    @TestVisible
    static ContentVersion createContentVersion(String fileName, String fileBase64Data, String imageDocumentId) {
        if (!ContentVersion.SObjectType.getDescribe().isAccessible() ||
            !ContentVersion.SObjectType.getDescribe().isCreateable()) {
                return null;
            }
        ContentVersion fileContentVersion = new ContentVersion();
        fileContentVersion.VersionData = EncodingUtil.base64Decode(fileBase64Data);
        fileContentVersion.Title = fileName;
        fileContentVersion.PathOnClient = fileName;
        if (!String.isBlank(imageDocumentId)) {
            fileContentVersion.ContentDocumentId = imageDocumentId;
        }
        insert fileContentVersion;
        ContentVersion retrievedContentVersion = [SELECT Title, ContentDocumentId
                                                  FROM ContentVersion
                                                  WHERE Id = :fileContentVersion.Id
                                                  WITH SECURITY_ENFORCED
                                                  LIMIT 1];
        return retrievedContentVersion;
    }
    
    @TestVisible
    static ContentDistribution createContentDistribution(ContentVersion contentVersion) {
        if (!ContentDistribution.SObjectType.getDescribe().isAccessible() ||
            !ContentDistribution.SObjectType.getDescribe().isCreateable()) {
                return null;
            }
        ContentDistribution fileContentDistribution = new ContentDistribution();
        fileContentDistribution.Name = contentVersion.Title;
        fileContentDistribution.ContentVersionId = contentVersion.id;
        fileContentDistribution.PreferencesAllowViewInBrowser = true;
        fileContentDistribution.PreferencesLinkLatestVersion = true;
        fileContentDistribution.PreferencesNotifyOnVisit = false;
        fileContentDistribution.PreferencesPasswordRequired = false;
        fileContentDistribution.PreferencesAllowOriginalDownload = true;
        insert fileContentDistribution;
        ContentDistribution retrievedContentDistribution = [SELECT Name, ContentDownloadUrl
                                                            FROM ContentDistribution
                                                            WHERE Id = :fileContentDistribution.Id
                                                            WITH SECURITY_ENFORCED
                                                            LIMIT 1];
        return retrievedContentDistribution;
    }
    
    @TestVisible
    static ContentDocument getContentDocumentById(String documentId) {
        List<ContentDocument> documents = [SELECT Id
                                           FROM ContentDocument
                                           WHERE Id = :documentId
                                           WITH SECURITY_ENFORCED
                                           LIMIT 1];
        if (documents.size() > 0) {
            return documents[0];
        } else {
            return null;
        }
    }
}