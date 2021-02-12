public with sharing class AnswerFormController {
    @AuraEnabled(cacheable=true)
    public static List<QuestionWrapper> getQuestions(Id surveyId){
        List<Question__c> questions = [
        SELECT Id, Label__c, IsVisible__c, Position__c, Required__c, Type__c,
        (SELECT Id, Question__c, Value__c FROM Question_Options__r),
        (SELECT Id, Related_Question__c, Dependent_Question__c, Operator__c, Value__c FROM Related_Question_Validations__r)
        FROM Question__c 
        WHERE Survey__c =: surveyId
        WITH SECURITY_ENFORCED];

        List<QuestionWrapper> questionsWrappers = new List<QuestionWrapper>();

        for(Question__c question: questions) {
            QuestionWrapper wrapper = new QuestionWrapper(question, question.Question_Options__r, question.Related_Question_Validations__r);
            questionsWrappers.add(wrapper);
          }
      
        return questionsWrappers;
    }
}