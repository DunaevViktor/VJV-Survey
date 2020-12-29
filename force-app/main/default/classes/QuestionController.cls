public with sharing class QuestionController {
  @AuraEnabled(cacheable=false)
  public static List<Question__c> createQuestionList() {
    return new List<Question__c>();
  }

  @AuraEnabled(cacheable=false)
  public static Question__c createQuestion() {
    return new Question__c();
  }
}
