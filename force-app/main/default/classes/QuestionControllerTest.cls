@IsTest
public with sharing class QuestionControllerTest {
  private static final String INVALID_AMOUNT = 'Actual length of questions list doesn\'t equal to expected';

  @IsTest
  public static void createQuestionListTest() {
    List<Question__c> questions = QuestionController.createQuestionList();
    System.assertEquals(questions.size(), 0, INVALID_AMOUNT);

    List<Question__c> questionsDatabase = [SELECT Id FROM Question__c];
    System.assertEquals(questionsDatabase.size(), 0, INVALID_AMOUNT);
  }

  @IsTest
  public static void createQuestionTest() {
    Question__c question = QuestionController.createQuestion();

    List<Question__c> questionsDatabase = [SELECT Id FROM Question__c];
    System.assertEquals(questionsDatabase.size(), 0, INVALID_AMOUNT);
  }
}
