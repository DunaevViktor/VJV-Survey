@IsTest
public with sharing class SaverControllerTest {
    
    private static final Integer TEST_AMOUNT = 5;
    private static final String TEST_TAB_URL = '/Survey_Test_Url';
    private static final String TEST_COMMUNITY_URL = 'https://something.test';
    
    private static final String EXPECTED_NOT_BE_NULL = 'The value was not expected to be null.';
    private static final String INVALID_SURVEY_ID = 'Actual survey id doesn\'t equal to expected.';
    private static final String INVALUD_QUESTIONS_AMOUNT = 'Actual amount of questions doesn\'t equal to expected.';
    private static final String INVALID_QUESTION_ID = 'Actual question id doesn\'t equal to expected.';
    private static final String INVALID_OPTIONS_AMOUNT = 'Actual amount of question options doesn\'t equal to expected.';
    private static final String INVALID_RULES_AMOUNT = 'Actual amount of rules doesn\'t equal to expected.';
    private static final String INVALID_VALIDATIONS_AMOUNT = 'Actual amount of validations doesn\'t equal to expected.';
    private static final String INVALID_RECEIVERS_AMOUNT = 'Actual amount of email receivers doesn\'t equal to expected.';
    private static final String INVALID_SURVEY_URL = 'Actual survey url doesn\'t equal to expected.';
    private static final String INVALID_SURVEY_GUEST_URL = 'Actual survey guest url doesn\'t equal to expected.';

    
    @IsTest  
    static void testSaveSurvey() {
        Survey__c survey = TestDataFactory.createSurvey();
        
        String surveyId = SaverController.saveSurvey(survey);
        System.assertNotEquals(null, surveyId, EXPECTED_NOT_BE_NULL);
        
        Survey__c databaseSurvey = [SELECT Id FROM Survey__c WHERE Name = : survey.Name];
        System.assertEquals(surveyId, databaseSurvey.Id, INVALID_SURVEY_ID);
    }

    @IsTest
    static void testSaveSurveyUrl(){
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;

        String baseUrl = System.Url.getSalesforceBaseURL().toExternalForm();
        String expectedUrl = baseUrl + TEST_TAB_URL;

        String actualUrl = SaverController.saveSurveyUrl(survey.Id, TEST_TAB_URL);

        System.assertEquals(expectedUrl, actualUrl, INVALID_SURVEY_URL);
    }
    
    @IsTest 
    static void testSaveTriggerRules() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Trigger_Rule__c> rules = TestDataFactory.createTriggerRules(survey.Id);
        List<Trigger_Rule__c> savedRules = SaverController.saveTriggerRules(rules);
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            Trigger_Rule__c savedRule = savedRules[i];
            System.assertNotEquals(null, savedRule.Id, EXPECTED_NOT_BE_NULL);
        }
        
        List<Trigger_Rule__c> databaseRules = [SELECT Id FROM Trigger_Rule__c];
        System.assertEquals(rules.size(), databaseRules.size(), INVALID_RULES_AMOUNT);
    }
    
    @IsTest
    static void testSaveQuestions() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Question__c> questions = TestDataFactory.createQuestions(TEST_AMOUNT, survey.Id);
        List<Question__c> savedQuestions = SaverController.saveQuestions(questions);
        List<Question__c> databaseQuestions = [SELECT Id, Label__c FROM Question__c WHERE Survey__c = :survey.Id];
        System.assertEquals(TEST_AMOUNT, databaseQuestions.size(), INVALUD_QUESTIONS_AMOUNT);
    }
    
    @IsTest
    static void testSaveOptions() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Question__c> questions = TestDataFactory.createQuestions(TEST_AMOUNT, survey.Id);
        insert questions;
        
        List<Question_Option__c> newOptions = new List<Question_Option__c>();
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            newOptions.addAll(TestDataFactory.createQuestionOptions(TEST_AMOUNT, questions[i].Id));
        }
        
        List<Question_Option__c> savedOptions = SaverController.saveOptions(newOptions);
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            Question_Option__c savedOption = savedOptions[i];
            System.assertNotEquals(null, savedOption.Id, EXPECTED_NOT_BE_NULL);
        }
        
        List<Question_Option__c> databaseOptions = [SELECT Id FROM Question_Option__c];
        System.assertEquals(TEST_AMOUNT * TEST_AMOUNT, databaseOptions.size(), INVALID_OPTIONS_AMOUNT);
    }
    
    @IsTest
    static void testSaveValidations() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Question__c> questions = TestDataFactory.createQuestions(TEST_AMOUNT * 2, survey.Id);
        insert questions;
        
        List<Validation__c> validations = new List<Validation__c>();
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            validation__c validation = TestDataFactory.createValidation(questions[i * 2].Id, questions[i * 2 + 1].Id);
            validations.add(validation);
        }
        
        List<Validation__c> savedValidations = SaverController.saveValidations(validations);
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            Validation__c savedValidation = savedValidations[i];
            System.assertNotEquals(null, savedValidation.Id, EXPECTED_NOT_BE_NULL);
        }
        
        List<Validation__c> databaseValidations = [SELECT Id FROM Validation__c];
        System.assertEquals(TEST_AMOUNT, databaseValidations.size(), INVALID_VALIDATIONS_AMOUNT);
    }
    
    @IsTest
    static void testSaveEmailReceivers() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        List<Email_Receiver__c> receivers = TestDataFactory.createEmailReceivers(survey.Id);
        List<Email_Receiver__c> savedReceivers = SaverController.saveEmailReceivers(receivers);
        for(Integer i = 0; i < TEST_AMOUNT; i++) {
            Email_Receiver__c savedReceiver = savedReceivers[i];
            System.assertNotEquals(null, savedReceiver.Id, EXPECTED_NOT_BE_NULL);
        }
        
        List<Email_Receiver__c> databaseReceivers = [SELECT Id FROM Email_Receiver__c];
        System.assertEquals(TEST_AMOUNT, databaseReceivers.size(), INVALID_RECEIVERS_AMOUNT);
    }
    
    @IsTest  
    static void testSaveCommunityUrl() {
		Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        SaverController.saveCommunityUrl(survey.Id, TEST_COMMUNITY_URL);
        System.assertEquals(TEST_COMMUNITY_URL, survey.Guest_URL__c, INVALID_SURVEY_GUEST_URL);
    }
}