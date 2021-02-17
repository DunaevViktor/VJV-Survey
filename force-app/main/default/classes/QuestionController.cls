public with sharing class QuestionController {
  @AuraEnabled(cacheable=false)
  public static List<QuestionWrapper> getStandardQuestions() {
    List<Question__c> questions = [SELECT Id, Label__c, Type__c, Required__c,
                                          (SELECT Value__c 
                                          FROM Question_Options__r 
                                          LIMIT 223)
                                  FROM Question__c
                                  WHERE IsReusable__c = TRUE
                                  WITH SECURITY_ENFORCED
                                  LIMIT 223];

    List<QuestionWrapper> questionsWrappers = new List<QuestionWrapper>();

    for(Question__c question: questions) {
      QuestionWrapper wrapper = new QuestionWrapper(question, question.Question_Options__r);
      questionsWrappers.add(wrapper);
    }

    return questionsWrappers;
  }

  @AuraEnabled(cacheable=false)
  public static List<QuestionWrapper>  getTemplatesQuestions(List<Id> surveyIds) {
    List<Question__c> questions = [SELECT Id, Label__c, Type__c, Required__c, Survey__c,
                                          (SELECT Value__c 
                                          FROM Question_Options__r 
                                          LIMIT 223)
                                  FROM Question__c
                                  WHERE Survey__c IN :surveyIds
                                  WITH SECURITY_ENFORCED
                                  LIMIT 223];

    List<QuestionWrapper> questionsWrappers = new List<QuestionWrapper>();

    for(Question__c question: questions) {
      QuestionWrapper wrapper = new QuestionWrapper(question, question.Question_Options__r);
      questionsWrappers.add(wrapper);
    }

    return questionsWrappers;
  }
}