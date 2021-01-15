public with sharing class SaverController {
  @AuraEnabled
  public static String saveSurvey(Survey__c survey) {
    insert survey;
    return survey.Id;
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
  public static List<Trigger_Rule__c> saveTriggerRules(List<Trigger_Rule__c> rules) {
    insert rules;
    return rules;
  }
}