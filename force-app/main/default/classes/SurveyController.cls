public inherited sharing class SurveyController {
  @AuraEnabled(cacheable=true)
  public static List<Survey__c> getAllSurveys() {
    return [SELECT Id, Name 
            FROM Survey__c
            WITH SECURITY_ENFORCED
            LIMIT 50000];
  }

  @AuraEnabled(cacheable=false)
  public static List<Survey__c> getTemplateSurveys() {
    return [SELECT Id, Name
            FROM Survey__c
            WHERE IsStandard__c = TRUE
            WITH SECURITY_ENFORCED
            LIMIT 50000];
  }

  @AuraEnabled(cacheable=false)
  public static Survey__c getSurveyById(Id surveyId) {
    return [SELECT Id, Name, Background_Color__c, Logo__c, Related_To__c, Description__c
            FROM Survey__c
            WHERE Id = :surveyId
            WITH SECURITY_ENFORCED
            LIMIT 1];
  }
}