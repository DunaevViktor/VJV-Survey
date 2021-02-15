public with sharing class SaverController {
  @AuraEnabled
  public static Id saveSurvey(Survey__c survey) {
    insert survey;
    return survey.Id;
  }

  @AuraEnabled
  public static void saveSurveyUrl(Id surveyId, String surveyUrl){
    Survey__c survey = [SELECT Id, URL__c FROM Survey__c WHERE Id =: surveyId WITH SECURITY_ENFORCED];
    String baseUrl = System.Url.getSalesforceBaseURL().toExternalForm();
    survey.URL__c = baseUrl + surveyUrl;
    update survey;
  }

  @AuraEnabled
  public static List<Trigger_Rule__c> saveTriggerRules(List<Trigger_Rule__c> rules) {
    insert rules;
    return rules;
  }

  @AuraEnabled
  public static List<Question__c> saveQuestions(List<Question__c> questions) {
     insert questions;
     return questions;
  }

  @AuraEnabled
  public static List<Question_Option__c> saveOptions(List<Question_Option__c> options) {
     insert options;
     return options;
  }

  @AuraEnabled
  public static List<Validation__c> saveValidations(List<Validation__c> validations) {
     insert validations;
     return validations;
  }

  @AuraEnabled
  public static List<Email_Receiver__c> saveEmailReceivers(List<Email_Receiver__c> receivers) {
     insert receivers;
     return receivers;
  }
}