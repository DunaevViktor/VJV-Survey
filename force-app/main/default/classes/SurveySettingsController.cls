public with sharing class SurveySettingsController {

  @AuraEnabled
  public static String getLogoURL(String logoName, String logoBlobData) {
    ContentVersion logo = createContentVersion(logoName, logoBlobData);
    ContentDistribution distribution = createContentDistribution(logo);
    String url = [
      SELECT ContentDownloadUrl
      FROM ContentDistribution
      WHERE Id = :distribution.Id
      WITH SECURITY_ENFORCED
    ].ContentDownloadUrl;
    return url;
  }

  public static ContentVersion createContentVersion(String logoName, String logoBlobData) {
    ContentVersion newContentVersion = new ContentVersion();
    newContentVersion.VersionData = EncodingUtil.base64Decode(logoBlobData);
    newContentVersion.Title = logoName;
    newContentVersion.PathOnClient = logoName;

    if (ContentVersion.SObjectType.getDescribe().isAccessible() &&
      ContentVersion.SObjectType.getDescribe().isCreateable()) {
      insert newContentVersion;
      return newContentVersion;
    }
    return null;
  }

  public static ContentDistribution createContentDistribution(ContentVersion contentVersion) {
    ContentDistribution newContentDistribution = new ContentDistribution();
    newContentDistribution.Name = contentVersion.Title;
    newContentDistribution.ContentVersionId = contentVersion.id;
    newContentDistribution.PreferencesAllowViewInBrowser = true;
    newContentDistribution.PreferencesLinkLatestVersion = true;
    newContentDistribution.PreferencesNotifyOnVisit = false;
    newContentDistribution.PreferencesPasswordRequired = false;
    newContentDistribution.PreferencesAllowOriginalDownload = true;
    if (ContentDistribution.SObjectType.getDescribe().isAccessible() &&
      ContentDistribution.SObjectType.getDescribe().isCreateable()) {
      insert newContentDistribution;
      return newContentDistribution;
    }
    return null;
  }
}
