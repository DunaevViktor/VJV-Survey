@IsTest
public with sharing class SurveyUserControllerTest {
    
    private static final String INVALID_RELATED_OBJECT_ID_RESULT = 'Invalid related object id result.';
    private static final String INVALID_SAVE_ANSWERS_RESULT = 'Invalid answers saving.';
    private static final String INVALID_SAVE_GROUP_ANSWER_RESULT = 'Invalid group answer saving.';
    private static final String INVALID_QUESTIONS_AMOUNT = 'Invalid questions amount.';
    private static final String INVALID_SURVEY_NAME = 'Actual survey name doesn\'t equal to expected.';
    
    private static final String TEST_CASE_SUBJECT = 'Printing Gives Error on Internet Explorer';
    
    @TestSetup
    static void makeData() {
        Survey__c testSurvey = TestDataFactory.createSurvey();
        insert testSurvey;
        
        Case testCaseFirst = new Case(Subject = TEST_CASE_SUBJECT);
        insert testCaseFirst;
        
        Related_Object__c testCaseRelatedObject = new Related_Object__c(Related_Case__c = testCaseFirst.Id);
        insert testCaseRelatedObject;
        
        Group_Answer__c testGroupAnswer = new Group_Answer__c();
        testGroupAnswer.Survey__c = testSurvey.Id;
        insert testGroupAnswer;
        
        List<Question__c> testQuestions = TestDataFactory.createQuestions(5, testSurvey.Id);
        insert testQuestions;
    }
    
    private static Id getTestSurveyId() {
        Survey__c testSurvey = [SELECT Id FROM Survey__c WHERE Name = :TestDataFactory.TEST_VALUE];
        return testSurvey.Id;      
    }
    
    private static Id getTestCaseId() {
        Case testCase = [SELECT Id, Subject FROM Case WHERE Subject =: TEST_CASE_SUBJECT];
        return testCase.Id;                 
    }
    
    private static Id getTestQuestionId() {
        Question__c testQuestion = [SELECT Id FROM Question__c WHERE Survey__c = :getTestSurveyId() LIMIT 1];
        return testQuestion.Id;
    }
    
    private static List<Question__c> getTestQuestions() {
        List<Question__c> testQuestions = [SELECT Id FROM Question__c WHERE Survey__c = :getTestSurveyId()];
        return testQuestions;
    }
    
    private static Id getTestGroupAnswerId() {
        Group_Answer__c testGroupAnswer = [SELECT Id FROM Group_Answer__c WHERE Survey__c =: getTestSurveyId()];
        return testGroupAnswer.Id;
    }
    
    
    @isTest
    static void testRelatedObjectIdByStandardObjectId() {
        Id res = SurveyUserController.getRelatedObjectIdByStandardObjectId(getTestCaseId());
        System.assertNotEquals(null, res, INVALID_RELATED_OBJECT_ID_RESULT);
    }
    
    @isTest
    static void testSaveAnswers() {
        AuraHandledException auraExc = null;
        try {
            Answer__c testAnswer = new Answer__c(Group_Answer__c = getTestGroupAnswerId(), Question__c = getTestQuestionId(), Value__c = 'Test Value');
            List<Answer__c> answers = new List<Answer__c>();
            answers.add(testAnswer);
            SurveyUserController.saveAnswers(answers);
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertEquals(null, auraExc, INVALID_SAVE_ANSWERS_RESULT);
    }
    
    @isTest
    static void testPositiveSaveGroupAnswer() {
        Group_Answer__c testGroupAnswer = new Group_Answer__c(Survey__c = getTestSurveyId());
        Id savedGroupAnswerId = SurveyUserController.saveGroupAnswer(testGroupAnswer);
        System.assertNotEquals(null, savedGroupAnswerId, INVALID_SAVE_GROUP_ANSWER_RESULT);
    }
    
    @isTest
    static void testGetQuestions(){
        Integer expectedSize = getTestQuestions().size();
        Integer actualSize = SurveyUserController.getQuestions(getTestSurveyId()).size();
        System.assertEquals(expectedSize, actualSize, INVALID_QUESTIONS_AMOUNT);
    }
    
    @isTest
    static void testGetSurveyById(){
        Survey__c survey = SurveyUserController.getSurveyById(getTestSurveyId());
        System.assertEquals(TestDataFactory.TEST_VALUE, survey.Name, INVALID_SURVEY_NAME);
    }
}