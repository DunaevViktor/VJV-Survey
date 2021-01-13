public with sharing class QuestionController {
  @AuraEnabled(cacheable=false)
  public static List<Question__c> createQuestionList() {
    return new List<Question__c>();
  }

  @AuraEnabled(cacheable=false)
  public static Question__c createQuestion() {
    return new Question__c();
  }

  @AuraEnabled(cacheable=false)
  public static List<Question__c> getStandardQuestions() {
    return [
      SELECT Id, Label__c, Type__c, Required__c,
      (SELECT Value__c FROM Question_Options__r)
      FROM Question__c
      WHERE IsReusable__c = TRUE
      WITH SECURITY_ENFORCED
    ];
  }

  @AuraEnabled(cacheable=false)
  public static List<Question__c> getTemplatesQuestions(List<Id> surveyIds) {
    return [
      SELECT Id, Label__c, Type__c, Required__c, Survey__c,
      (SELECT Value__c FROM Question_Options__r)
      FROM Question__c
      WHERE Survey__c IN :surveyIds
      WITH SECURITY_ENFORCED
    ];
  }
}