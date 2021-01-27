public with sharing class AnswerFormController {
    @AuraEnabled(cacheable=true)
    public static List<Question__c> getQuestions(Id surveyId){
        return [SELECT Id, Label__c, IsVisible__c, Position__c, Required__c, Type__c,
        (SELECT Id, Question__c, Value__c FROM Question_Options__r),
        (SELECT Id, Related_Question__c, Dependent_Question__c, Operator__c, Value__c FROM Validations1__r)
        FROM Question__c 
        WHERE Survey__c =: surveyId
        WITH SECURITY_ENFORCED];
    }
}