@isTest
public with sharing class GroupAnswerControllerTest {
    
    private static final String INVALID_SAVE_GROUP_ANSWERS_RESULT = 'Invalid group answer/answers saving.';

    @TestSetup
    static void setup() {
        Survey__c testSurvey = new Survey__c(Name = 'Test', Background_Color__c = '#A3FF88');
        insert testSurvey;
    }

    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id
                                FROM Survey__c
                                WHERE Name = 'Test'];
        return testSurvey.Id;      
    }
    
    @isTest
    static void testPositiveSaveGroupAnswer() {
        Group_Answer__c testGroupAnswer = new Group_Answer__c(Survey__c = getTestSurveyId());
        Id savedGroupAnswerId = GroupAnswerController.saveGroupAnswer(testGroupAnswer);
        System.assertNotEquals(null, savedGroupAnswerId, INVALID_SAVE_GROUP_ANSWERS_RESULT);
    }

    @isTest
    static void testNegativeSaveGroupAnswers() {
        AuraHandledException auraExc = null;
        try {
            Group_Answer__c testGroupAnswer = new Group_Answer__c();
            Id savedGroupAnswerId = GroupAnswerController.saveGroupAnswer(testGroupAnswer);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertNotEquals(null, auraExc, INVALID_SAVE_GROUP_ANSWERS_RESULT);
    }

    @isTest
    static void testPositiveSaveGroupAnswers() {
        AuraHandledException auraExc = null;
        try {
            Group_Answer__c testGroupAnswer = new Group_Answer__c(Survey__c = getTestSurveyId());
            Group_Answer__c[] groupAnswers = new List<Group_Answer__c>();
            groupAnswers.add(testGroupAnswer);
            GroupAnswerController.saveGroupAnswers(groupAnswers);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertEquals(null, auraExc, INVALID_SAVE_GROUP_ANSWERS_RESULT);
    }

    @isTest
    static void testNegativeSaveAnswers() {
        AuraHandledException auraExc = null;
        try {
            Group_Answer__c testGroupAnswer = new Group_Answer__c();
            Group_Answer__c[] groupAnswers = new List<Group_Answer__c>();
            groupAnswers.add(testGroupAnswer);
            GroupAnswerController.saveGroupAnswers(groupAnswers);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertNotEquals(null, auraExc, INVALID_SAVE_GROUP_ANSWERS_RESULT);
    }
}
