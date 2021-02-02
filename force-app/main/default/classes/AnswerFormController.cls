public with sharing class AnswerFormController {
    @AuraEnabled(cacheable=true)
    public static List<Question__c> getQuestions(Id surveyId){
        return [SELECT Id, Label__c, IsVisible__c, Position__c, Required__c, Type__c,
        (SELECT Id, Question__c, Value__c FROM Question_Options__r),
        (SELECT Id, Related_Question__c, Dependent_Question__c, Operator__c, Value__c FROM Related_Question_Validations__r)
        FROM Question__c 
        WHERE Survey__c =: surveyId
        WITH SECURITY_ENFORCED];
    }

    @AuraEnabled(cacheable=true)
    public static Id getConnectedSurveyId(Id surveyId){
        Survey__c relatedSurvey = [SELECT (SELECT Id FROM Surveys__r LIMIT 1)
                                   FROM Survey__c WHERE Id =: surveyId WITH SECURITY_ENFORCED LIMIT 1];
                                   
        Id connectedSurveyId;
        for(Survey__c connectedSurvey: relatedSurvey.Surveys__r){
            connectedSurveyId = connectedSurvey.Id;
        }
        return connectedSurveyId;
    }
}