@isTest
public with sharing class GroupAnswerControllerTest {
    
    private static final String INVALID_SAVE_GROUP_ANSWER_RESULT = 'Invalid group answer saving.';

    @TestSetup
    static void setup() {
        Survey__c testSurvey = TestDataFactory.createSurvey();
        insert testSurvey;
    }

    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id
                                FROM Survey__c
                                WHERE Name = :TestDataFactory.TEST_VALUE];
        return testSurvey.Id;      
    }
    
    @isTest
    static void testPositiveSaveGroupAnswer() {
        Group_Answer__c testGroupAnswer = new Group_Answer__c(Survey__c = getTestSurveyId());
        Id savedGroupAnswerId = GroupAnswerController.saveGroupAnswer(testGroupAnswer);
        System.assertNotEquals(null, savedGroupAnswerId, INVALID_SAVE_GROUP_ANSWER_RESULT);
    }

    @isTest
    static void testNegativeSaveGroupAnswer() {
        AuraHandledException auraExc = null;
        try {
            Group_Answer__c testGroupAnswer = new Group_Answer__c();
            Id savedGroupAnswerId = GroupAnswerController.saveGroupAnswer(testGroupAnswer);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertNotEquals(null, auraExc, INVALID_SAVE_GROUP_ANSWER_RESULT);
    }
    
}