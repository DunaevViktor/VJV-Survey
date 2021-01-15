@IsTest
public with sharing class SaverControllerTest {

  private static final Integer TEST_AMOUNT = 5;

  private static final String EXPECTED_NOT_BE_NULL = 'The value was not expected to be null';
  private static final String INVALID_SURVEY_ID = 'Actual survey id doesn\'t equal to expected';
  private static final String INVALUD_QUESTIONS_AMOUNT = 'Actual amount of questions doesn\'t equal to expected';
  private static final String INVALID_QUESTION_ID = 'Actual question id doesn\'t equal to expected';
  private static final String INVALID_OPTIONS_AMOUNT = 'Actual amount of question options doesn\'t equal to expected';
  private static final String INVALID_RULES_AMOUNT = 'Actual amount of rules doesn\'t equal to expected';
  private static final String INVALID_VALIDATIONS_AMOUNT = 'Actual amount of validations doesn\'t equal to expected';

  @IsTest  
  static void testSaveSurvey() {
    Survey__c survey = SaverControllerTestDataFactory.createSurvey();
    
    String surveyId = SaverController.saveSurvey(survey);
    System.assertNotEquals(null, surveyId, EXPECTED_NOT_BE_NULL);

    Survey__c databaseSurvey = [SELECT Id FROM Survey__c WHERE Name = : survey.Name];
    System.assertEquals(surveyId, databaseSurvey.Id, INVALID_SURVEY_ID);
  }

  @IsTest
  static void testSaveQuestions() {
    Survey__c survey = SaverControllerTestDataFactory.createSurvey();
    insert survey;

    List<Question__c> questions = 
      SaverControllerTestDataFactory.createQuestionList(TEST_AMOUNT, survey.Id);

    List<Question__c> savedQuestions = SaverController.saveQuestions(questions);

    List<Question__c> databaseQuestions = [
        SELECT Id, Label__c
        FROM Question__c
        WHERE Survey__c = :survey.Id
        ORDER BY Position__c
    ];

    System.assertEquals(TEST_AMOUNT, databaseQuestions.size(), INVALUD_QUESTIONS_AMOUNT);

    for(Integer i = 0; i < TEST_AMOUNT; i++) {
      Question__c savedQuestion = savedQuestions[i];
      Question__c databaseQuestion = databaseQuestions[i];

      System.assertEquals(savedQuestion.Id, databaseQuestion.Id, INVALID_QUESTION_ID);
    }
  }

  @IsTest
  static void testSaveOptions() {
    Survey__c survey = SaverControllerTestDataFactory.createSurvey();
    insert survey;

    List<Question__c> questions = 
      SaverControllerTestDataFactory.createQuestionList(TEST_AMOUNT, survey.Id);
    insert questions;

    List<Question_Option__c> newOptions = new List<Question_Option__c>();
    for(Integer i = 0; i < TEST_AMOUNT; i++) {
      newOptions.addAll(SaverControllerTestDataFactory.createOptionList(TEST_AMOUNT, questions[i].Id));
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
    Survey__c survey = SaverControllerTestDataFactory.createSurvey();
    insert survey;

    List<Question__c> questions = 
      SaverControllerTestDataFactory.createQuestionList(TEST_AMOUNT * 2, survey.Id);
    insert questions;

    List<Validation__c> validations = new List<Validation__c>();
    for(Integer i = 0; i < TEST_AMOUNT; i++) {
      validation__c validation = SaverControllerTestDataFactory.createValidation(
          questions[i * 2].Id,
          questions[i * 2 + 1].Id
      );
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
  static void testSaveTriggerRules() {
    Survey__c survey = SaverControllerTestDataFactory.createSurvey();
    insert survey;

    List<Trigger_Rule__c> rules = SaverControllerTestDataFactory.createTriggerRuleList(TEST_AMOUNT, survey.Id);

    List<Trigger_Rule__c> savedRules = SaverController.saveTriggerRules(rules);

    for(Integer i = 0; i < TEST_AMOUNT; i++) {
      Trigger_Rule__c savedRule = savedRules[i];
      System.assertNotEquals(null, savedRule.Id, EXPECTED_NOT_BE_NULL);
    }

    List<Trigger_Rule__c> databaseRules = [SELECT Id FROM Trigger_Rule__c];
    System.assertEquals(TEST_AMOUNT, databaseRules.size(), INVALID_RULES_AMOUNT);
  }
}