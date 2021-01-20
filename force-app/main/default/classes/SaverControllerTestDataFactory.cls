@IsTest
public with sharing class SaverControllerTestDataFactory {

  private static final String TEST_SURVEY_NAME = 'Test Survey Name';
  private static final String TEST_QUESTION_NAME = 'Test Question Name';
  private static final String TEST_QUESTION_TYPE = 'Picklist';
  private static final String TEST_OPTION_VALUE = 'Test Option value';
  private static final String TEST_FIELD_NAME = 'Test Field Name';
  private static final String TEST_RULE_OPERATOR = 'EQUALS';
  private static final String TEST_FIELD_VALUE = 'Test Field value';
  private static final String TEST_OBJECT_API_NAME = 'Contact';
  private static final String TEST_VALIDATION_OPERATOR = 'CONTAINS';
  private static final String TEST_VALUE = 'Test Value';
  private static final String TEST_RECEIVER_TYPE = 'Email';
  private static final String TEST_RECEIVER_VALUE = 'test@bk.ru';

  public static Survey__c createSurvey() {
    Survey__c survey = new Survey__c();
    survey.Name = TEST_SURVEY_NAME;
    return survey;
  }

  public static List<Trigger_Rule__c> createTriggerRuleList(Integer amount, String surveyId) {
    List<Trigger_Rule__c> rules = new List<Trigger_Rule__c>();
    for(Integer i = 0; i < amount; i++) {
      Trigger_Rule__c rule = SaverControllerTestDataFactory.createTriggerRule(surveyId);
      rules.add(rule);
    }
    return rules;
  }

  public static List<Question__c> createQuestionList(Integer amount, String surveyId) {
    List<Question__c> questions = new List<Question__c>();
    for(Integer i = 0; i < amount; i++) {
      Question__c question = SaverControllerTestDataFactory.createQuestion(surveyId, i+ 1);
      questions.add(question);
    }
    return questions;
  }

  public static List<Question_Option__c> createOptionList(Integer amount, String questionId) {
    List<Question_Option__c> options = new List<Question_Option__c>();
    for(Integer j = 0; j < amount; j++) {
      Question_Option__c option = SaverControllerTestDataFactory.createOption(questionId);
      options.add(option);
    } 
    return options;
  }

  public static List<Email_Receiver__c> createEmailReceiverList(Integer amount, String surveyId) {
    List<Email_Receiver__c> receivers = new List<Email_Receiver__c>();
    for(Integer j = 0; j < amount; j++) {
      Email_Receiver__c receiver = SaverControllerTestDataFactory.createEmailReceiver(surveyId);
      receivers.add(receiver);
    } 
    return receivers;
  }

  private static Question_Option__c createOption(String questionId) {
    Question_Option__c option = new Question_Option__c();
    option.Value__c = TEST_OPTION_VALUE;
    option.Question__c = questionId;
    return option;
  }

  private static Question__c createQuestion(String surveyId, Integer position) {
    Question__c question = new Question__c();
    question.Label__c =  TEST_QUESTION_NAME;
    question.Type__c = TEST_QUESTION_TYPE;
    question.Survey__c = surveyId;
    question.Position__c = position;
    return question;
  }

  public static Validation__c  createValidation(String relatedQuestionId, String dependentQuestionId) {
    Validation__c validation = new validation__c();
    validation.Related_Question__c = relatedQuestionId;
    validation.Dependent_Question__c = dependentQuestionId;
    validation.Operator__c = TEST_VALIDATION_OPERATOR;
    validation.Value__c = TEST_VALUE;
    return validation;
  }

  private static Trigger_Rule__c  createTriggerRule(String surveyId) {
    Trigger_Rule__c rule = new Trigger_Rule__c();
    rule.Field_Name__c = TEST_FIELD_NAME;
    rule.Operator__c = TEST_RULE_OPERATOR;
    rule.Field_Value__c = TEST_FIELD_VALUE;
    rule.Object_Api_Name__c = TEST_OBJECT_API_NAME;
    rule.Survey__c = surveyId;
    return rule;
  }

  private static Email_Receiver__c  createEmailReceiver(String surveyId) {
    Email_Receiver__c receiver = new Email_Receiver__c();
    receiver.Type__c = TEST_RECEIVER_TYPE;
    receiver.Value__c = TEST_RECEIVER_VALUE;
    receiver.Survey__c = surveyId;
    return receiver;
  }
}