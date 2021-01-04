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
}
