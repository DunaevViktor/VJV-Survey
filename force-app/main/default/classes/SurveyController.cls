public with sharing class SurveyController {
    @AuraEnabled(cacheable=true)
    public static List<Survey__c> getSurveys(){
        return [SELECT Id, Name FROM Survey__c];
    }
}
