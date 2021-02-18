@IsTest
public with sharing class SurveyControllerTest {
    private static final String TEST_NAME = 'Test Name';
    
    private static final Integer AMOUNT = 5;
    
    private static final String INVALID_SURVEYS_AMOUNT = 'Actual length of surveys list doesn\'t equal to expected.';
    private static final String INVALID_SURVEY_NAME = 'Actual survey name doesn\'t equal to expected.';
    
    @IsTest
    static void testGetAllSurveys() {
        List<Survey__c> surveys = new List<Survey__c>();
        for (Integer i = 1; i <= AMOUNT; i++) {
            Survey__c survey = TestDataFactory.createSurvey();
            surveys.add(survey);
        }
        insert surveys;
        
        List<Survey__c> allSurveys = SurveyController.getAllSurveys();
        System.assertEquals(AMOUNT, allSurveys.size(), INVALID_SURVEYS_AMOUNT);
    }
    
    @IsTest
    static void testGetStandardSurvey() {
        List<Survey__c> surveys = new List<Survey__c>();
        for (Integer i = 1; i <= AMOUNT; i++) {
            Survey__c survey = TestDataFactory.createSurvey();
            survey.IsStandard__c = true;
            surveys.add(survey);
        }
        insert surveys;
        
        List<Survey__c> templateSurveys = SurveyController.getTemplateSurveys();
        System.assertEquals(AMOUNT, templateSurveys.size(), INVALID_SURVEYS_AMOUNT);
        
        for (Integer i = 1; i <= AMOUNT; i++) {
            Survey__c survey = templateSurveys[i - 1];
            System.assertEquals(TestDataFactory.TEST_VALUE, survey.Name, INVALID_SURVEY_NAME);
        }
    } 
    
    @IsTest
    static void testGetSurveyById() {
		Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        Survey__c savedSurvey = SurveyController.getSurveyById(survey.Id);
        System.assertEquals(TestDataFactory.TEST_VALUE, savedSurvey.Name, INVALID_SURVEY_NAME);
    }
}