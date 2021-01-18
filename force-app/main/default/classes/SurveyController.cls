public with sharing class SurveyController {
  @AuraEnabled(cacheable=true)
  public static List<Survey__c> getAllSurveys() {
    return [
      SELECT Id, Name 
      FROM Survey__c
      WITH SECURITY_ENFORCED
    ];
  }

  @AuraEnabled(cacheable=false)
  public static List<Survey__c> getTemplateSurveys() {
    return [
      SELECT Id, Name
      FROM Survey__c
      WHERE IsStandard__c = TRUE
      WITH SECURITY_ENFORCED
    ];
  }
}
