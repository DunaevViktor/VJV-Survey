public with sharing class AnswerFormController {
    
    @AuraEnabled(cacheable=true)
    public static List<Question__c> getQuestions(Id surveyId){
        return [SELECT Id, Label__c, IsVisible__c, Position__c, Required__c, Type__c,
        (SELECT Id, Question__c, Value__c FROM Question_Options__r LIMIT 16666),
        (SELECT Id, Related_Question__c, Dependent_Question__c, Operator__c, Value__c FROM Related_Question_Validations__r LIMIT 16666)
        FROM Question__c 
        WHERE Survey__c =: surveyId
        WITH SECURITY_ENFORCED
        LIMIT 16666];
    }
}