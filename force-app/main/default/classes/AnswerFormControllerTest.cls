@isTest
public with sharing class AnswerFormControllerTest {
    
    private static final String INVALID_QUESTIONS_AMOUNT = 'Invalid questions amount.';
    
    @TestSetup
    static void makeData(){
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Question__c> questions = TestDataFactory.createQuestions(5, survey.Id);
        insert questions; 
    }
    
    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id FROM Survey__c WHERE Name = 'Test'];
        return testSurvey.Id;      
    }
    
    private static List<Question__c> getTestQuestions() {
        List<Question__c> questions = [SELECT Id FROM Question__c];
        return questions;      
    }
    
    @isTest
    static void testGetQuestions(){
        Integer expectedSize = getTestQuestions().size();
        Integer actualSize = AnswerFormController.getQuestions(getTestSurveyId()).size();
        System.assertEquals(expectedSize, actualSize, INVALID_QUESTIONS_AMOUNT);
    }
}