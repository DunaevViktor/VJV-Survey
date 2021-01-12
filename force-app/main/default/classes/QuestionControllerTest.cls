@IsTest
public with sharing class QuestionControllerTest {
  private static final String TEST_NAME = 'Test Name';
  private static final String TEST_LABEL = 'Test Label';
  private static final String TEST_VALUE = 'Test Value';
  private static final Integer TEST_POSITION = 1;

  private static final Integer AMOUNT = 5;

  private static final String INVALID_QUESTIONS_AMOUNT = 'Actual length of questions list doesn\'t equal to expected';
  private static final String INVALID_QUESTION_NAME = 'Actual question label doesn\'t equal to expected';
  private static final String INVALID_OPTIONS_AMOUNT = 'Actual length of question options list doesn\'t equal to expected';
  private static final String INVALID_OPTION_VALUE = 'Actual option value doesn\'t equal to expected';

  @IsTest
  static void getStandardQuestionsTest() {
    Survey__c survey = new Survey__c();
    insert survey;

    Question__c question = new Question__c();
    question.Label__c = TEST_LABEL;
    question.Position__c = TEST_POSITION;
    question.IsReusable__c = true;
    question.Survey__c = survey.Id;
    insert question;

    List<Question_Option__c> options = new List<Question_Option__c>();
    for (Integer i = 1; i <= 5; i++) {
      Question_Option__c option = new Question_Option__c();
      option.Value__c = TEST_VALUE + ' ' + i;
      option.Question__c = question.Id;
      options.add(option);
    }
    insert options;

    List<Question__c> standardQuestions = QuestionController.getStandardQuestions();

    System.assertEquals(1, standardQuestions.size(), INVALID_QUESTIONS_AMOUNT);

    Question__c standardQuestion = standardQuestions[0];

    System.assertEquals(
      TEST_LABEL,
      standardQuestion.Label__c,
      INVALID_QUESTION_NAME
    );
    System.assertEquals(
      options.size(),
      standardQuestion.Question_Options__r.size(),
      INVALID_OPTIONS_AMOUNT
    );

    List<Question_Option__c> savedOptions = standardQuestion.Question_Options__r;

    for (Integer i = 1; i <= savedOptions.size(); i++) {
      System.assertEquals(
        TEST_VALUE +
        ' ' +
        i,
        savedOptions[i - 1].Value__c,
        INVALID_OPTION_VALUE
      );
    }
  }

  @IsTest
  static void getTemplatesQuestions() {
    Survey__c survey = new Survey__c();
    survey.Name = TEST_NAME;
    survey.IsStandard__c = true;
    insert survey;

    List<Question__c> questions = new List<Question__c>();
    for (Integer i = 1; i <= AMOUNT; i++) {
      Question__c question = new Question__c();
      question.Label__c = TEST_LABEL;
      question.Position__c = TEST_POSITION;
      question.IsReusable__c = true;
      question.Survey__c = survey.Id;
      questions.add(question);
    }
    insert questions;

    List<Question_Option__c> options = new List<Question_Option__c>();
    for (Integer i = 0; i < AMOUNT; i++) {
      for (Integer j = 1; j <= AMOUNT; j++) {
        Question_Option__c option = new Question_Option__c();
        option.Value__c = TEST_VALUE + ' ' + j;
        option.Question__c = questions[i].Id;
        options.add(option);
      }
    }
    insert options;

    List<Id> surveysIds = new List<Id>();
    surveysIds.add(survey.Id);

    List<Question__c> templateQuestions = QuestionController.getTemplatesQuestions(
      surveysIds
    );

    System.assertEquals(
      AMOUNT,
      templateQuestions.size(),
      INVALID_QUESTIONS_AMOUNT
    );

    for (Integer i = 1; i <= AMOUNT; i++) {
      Question__c templateQuestion = templateQuestions[i - 1];
      System.assertEquals(
        TEST_LABEL,
        templateQuestion.Label__c,
        INVALID_QUESTION_NAME
      );
      System.assertEquals(
        AMOUNT,
        templateQuestion.Question_Options__r.size(),
        INVALID_OPTIONS_AMOUNT
      );
    }
  }
}
