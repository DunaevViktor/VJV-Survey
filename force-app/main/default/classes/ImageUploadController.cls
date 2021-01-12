public with sharing class ImageUploadController {
  
  @AuraEnabled
  public static String getImageURL(String imageName, String imageBase64Data) {
    ContentVersion imageVersion = createContentVersion(imageName, imageBase64Data);
    ContentDistribution imageDistribution = createContentDistribution(imageVersion);
    String imageUrl = [
      SELECT ContentDownloadUrl
      FROM ContentDistribution
      WHERE Id = :imageDistribution.Id
      WITH SECURITY_ENFORCED
    ].ContentDownloadUrl;
    return imageUrl;
  }

  public static ContentVersion createContentVersion(String fileName, String fileBase64Data) {
    ContentVersion fileContentVersion = new ContentVersion();
    fileContentVersion.VersionData = EncodingUtil.base64Decode(fileBase64Data);
    fileContentVersion.Title = fileName;
    fileContentVersion.PathOnClient = fileName;

    if (ContentVersion.SObjectType.getDescribe().isAccessible() &&
      ContentVersion.SObjectType.getDescribe().isCreateable()) {
      insert fileContentVersion;
      return fileContentVersion;
    }
    return null;
  }

  public static ContentDistribution createContentDistribution(ContentVersion contentVersion) {
    ContentDistribution fileContentDistribution = new ContentDistribution();
    fileContentDistribution.Name = contentVersion.Title;
    fileContentDistribution.ContentVersionId = contentVersion.id;
    fileContentDistribution.PreferencesAllowViewInBrowser = true;
    fileContentDistribution.PreferencesLinkLatestVersion = true;
    fileContentDistribution.PreferencesNotifyOnVisit = false;
    fileContentDistribution.PreferencesPasswordRequired = false;
    fileContentDistribution.PreferencesAllowOriginalDownload = true;
    if (ContentDistribution.SObjectType.getDescribe().isAccessible() &&
      ContentDistribution.SObjectType.getDescribe().isCreateable()) {
      insert fileContentDistribution;
      return fileContentDistribution;
    }
    return null;
  }
}
