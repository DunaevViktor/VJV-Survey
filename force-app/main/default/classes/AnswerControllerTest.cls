@isTest
public with sharing class AnswerControllerTest {

    private static final String INVALID_SAVE_ANSWERS_RESULT = 'Invalid answer/answers saving.';

    @TestSetup
    static void setup() {
        Survey__c testSurvey = new Survey__c(Name = 'Test', Background_Color__c = '#A3FF88');
        insert testSurvey;

        Group_Answer__c testGroupAnswer = new Group_Answer__c(Survey__c = testSurvey.Id);
        insert testGroupAnswer;

        Question__c testQuestion = new Question__c();
    }

    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id
                                FROM Survey__c
                                WHERE Name = 'Test'];
        return testSurvey.Id;      
    }

    private static Id getTestGroupAnswerId() {
        Group_Answer__c testGroupAnswer = [SELECT Id
                                           FROM Group_Answer__c
                                           WHERE Survey__c =: getTestSurveyId()];
        return testGroupAnswer.Id;
    }

    @isTest
    static void testPositiveSaveAnswer() {
        Answer__c testAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), );
        Id savedAnswerId = AnswerController.saveAnswer(testAnswer);
        System.assertNotEquals(null, savedAnswerId, INVALID_SAVE_ANSWERS_RESULT);
    }
}
