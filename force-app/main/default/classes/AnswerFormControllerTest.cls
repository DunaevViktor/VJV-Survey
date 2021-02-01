@isTest
public with sharing class AnswerFormControllerTest {

    private static final String INVALID_QUESTIONS_AMOUNT = 'Invalid questions amount.';
    private static final String INVALID_CONNECTED_SURVEY_ID = 'Invalid connected survey Id.';

    @TestSetup
    static void setup(){
        Survey__c survey = new Survey__c(Name = 'Test', Background_Color__c = '#A3FF88');
        insert survey;

        Survey__c connectedSurvey = new Survey__c(Name = 'TestConnected', Background_Color__c = '#A3FF88', Related_To__c = survey.Id);
        insert connectedSurvey;

        List<Question__c> questions = new List<Question__c>();

        for(Integer i=0; i < 10; i++){
        Question__c testQuestion = new Question__c(Survey__c = survey.Id, Label__c = 'Test label' + i, Position__c = '2');
        questions.add(testQuestion);
        }

        insert questions; 
    }

    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id
                                FROM Survey__c
                                WHERE Name = 'Test'];
        return testSurvey.Id;      
    }

    private static Id getTestConnectedSurveyId() {
        Survey__c testSurvey = [SELECT Id
                                FROM Survey__c
                                WHERE Name = 'TestConnected'];
        return testSurvey.Id;      
    }

    private static List<Question__c> getTestQuestions() {
        List<Question__c> questions = [SELECT Id
                                       FROM Question__c];
        return questions;      
    }

    @isTest
    static void testGetQuestions(){
        Integer expectedSize = getTestQuestions().size();
        Integer actualSize = AnswerFormController.getQuestions(getTestSurveyId()).size();
        System.assertEquals(expectedSize, actualSize, INVALID_QUESTIONS_AMOUNT);
    }

    @isTest
    static void testGetConnectedSurveyId(){
        Id expectedId = getTestConnectedSurveyId();
        Id actualId = AnswerFormController.getConnectedSurveyId(getTestSurveyId());
        System.assertEquals(expectedId, actualId, INVALID_CONNECTED_SURVEY_ID);
    }
}