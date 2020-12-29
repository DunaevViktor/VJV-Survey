public with sharing class SurveyController {
  @AuraEnabled(cacheable=false)
  public static List<Survey__c> getTemplateSurveys() {
    return [SELECT Id, Name FROM Survey__c WHERE IsStandard__c = TRUE];
  }
}
