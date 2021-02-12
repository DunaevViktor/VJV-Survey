@isTest
public with sharing class AnswerControllerTest {
    
    private static final String INVALID_SAVE_ANSWERS_RESULT = 'Invalid answers saving.';
    private static final String INVALID_PARTIAL_SAVE_ANSWERS_RESULT = 'Invalid partial answers saving.';
    
    @TestSetup
    static void setup() {
        Survey__c testSurvey = TestDataFactory.createSurvey();
        insert testSurvey;
        
        Group_Answer__c testGroupAnswer = new Group_Answer__c();
        testGroupAnswer.Survey__c = testSurvey.Id;
        insert testGroupAnswer;
        
        Question__c testQuestion = TestDataFactory.createQuestion(testSurvey.Id);
        insert testQuestion;
    }
    
    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id FROM Survey__c WHERE Name = :TestDataFactory.TEST_VALUE];
        return testSurvey.Id;      
    }
    
    private static Id getTestGroupAnswerId() {
        Group_Answer__c testGroupAnswer = [SELECT Id FROM Group_Answer__c WHERE Survey__c =: getTestSurveyId()];
        return testGroupAnswer.Id;
    }
    
    private static Id getTestQuestionId() {
        Question__c testQuestion = [SELECT Id FROM Question__c WHERE Position__c = :TestDataFactory.TEST_POSITION];
        return testQuestion.Id;      
    }
    
    @isTest
    static void testSaveAnswersPartially() {
        Exception auraExc = null;
        try {
            Answer__c testCorrectAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), Question__c = getTestQuestionId(), Value__c = 'Test Value');
            Answer__c testIncorrectAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), Question__c = getTestQuestionId());
            List<Answer__c> testAnswerList = new List<Answer__c>();
            testAnswerList.add(testCorrectAnswer);
            testAnswerList.add(testIncorrectAnswer);
            AnswerController.saveAnswersPartially(testAnswerList);
        } catch(Exception exc) {
            auraExc = exc;
        }
        System.assertEquals(null, auraExc, INVALID_PARTIAL_SAVE_ANSWERS_RESULT);
    }
    
    @isTest
    static void testPositiveSaveAnswers() {
        AuraHandledException auraExc = null;
        try {
            Answer__c testAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), Question__c = getTestQuestionId(), Value__c = 'Test Value');
            List<Answer__c> answers = new List<Answer__c>();
            answers.add(testAnswer);
            AnswerController.saveAnswers(answers);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertEquals(null, auraExc, INVALID_SAVE_ANSWERS_RESULT);
    }
    
    @isTest
    static void testNegativeSaveAnswers() {
        AuraHandledException auraExc = null;
        try {
            Answer__c testAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), Question__c = getTestQuestionId());
            List<Answer__c> answers = new List<Answer__c>();
            answers.add(testAnswer);
            AnswerController.saveAnswers(answers);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertNotEquals(null, auraExc, INVALID_SAVE_ANSWERS_RESULT);
    }
}