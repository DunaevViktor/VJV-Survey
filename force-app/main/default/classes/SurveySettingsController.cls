public with sharing class SurveySettingsController {
  @AuraEnabled(cacheable=true)
  public static Survey__c getSurveyData(String surveyId) {
    if (surveyId == null) {
      return null;
    } else {
      List<Survey__c> surveyList = [
        SELECT Name, Background_Color__c, Logo__c
        FROM Survey__c
        WHERE Id = :surveyId
        WITH SECURITY_ENFORCED
        LIMIT 1
      ];
      if (surveyList.isEmpty()) {
        return null;
      } else {
        return surveyList[0];
      }
    }
  }

  @AuraEnabled
  public static String getLogoURL(String logoName, String logoBlobData) {
    ContentVersion logo = createContentVersion(logoName, logoBlobData);
    if (logo == null) {
      return null;
    }
    ContentDistribution distribution = createContentDistribution(logo);
    if (distribution == null) {
      return null;
    }
    String url = [
      SELECT ContentDownloadUrl
      FROM ContentDistribution
      WHERE Id = :distribution.Id
      WITH SECURITY_ENFORCED
    ]
    .ContentDownloadUrl;
    return url;
  }

  public static ContentVersion createContentVersion(
    String logoName,
    String logoBlobData
  ) {
    ContentVersion newContentVersion = new ContentVersion();
    newContentVersion.VersionData = EncodingUtil.base64Decode(logoBlobData);
    newContentVersion.Title = logoName;
    newContentVersion.PathOnClient = logoName;

    if (
      ContentVersion.SObjectType.getDescribe().isAccessible() &&
      ContentVersion.SObjectType.getDescribe().isCreateable()
    ) {
      insert newContentVersion;
      return newContentVersion;
    }
    return null;
  }

  public static ContentDistribution createContentDistribution(
    ContentVersion contentVersion
  ) {
    ContentDistribution newContentDistribution = new ContentDistribution();
    newContentDistribution.Name = contentVersion.Title;
    newContentDistribution.ContentVersionId = contentVersion.id;
    newContentDistribution.PreferencesAllowViewInBrowser = true;
    newContentDistribution.PreferencesLinkLatestVersion = true;
    newContentDistribution.PreferencesNotifyOnVisit = false;
    newContentDistribution.PreferencesPasswordRequired = false;
    newContentDistribution.PreferencesAllowOriginalDownload = true;
    if (
      ContentDistribution.SObjectType.getDescribe().isAccessible() &&
      ContentDistribution.SObjectType.getDescribe().isCreateable()
    ) {
      insert newContentDistribution;
      return newContentDistribution;
    }
    return null;
  }
}
