@IsTest
public with sharing class SurveySettingControllerTest {
  private static final String MAX_QUESTION_AMOUNT_SETTING_NAME = 'Max Question Amount';
  private static final String MIN_QUESTION_AMOUNT_SETTING_NAME = 'Min Question Amount';
  private static final String PAGE_QUESTION_AMOUNT_SETTING_NAME = 'Page Question Amount';
  private static final String TEST_AMOUNT = '5';

  private static final String INVALID_SETTING_VALUE = 'Actual value of setting doesn\'t equal to expected';

  @IsTest
  static void testGetMaxQuestionAmount() {
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = MAX_QUESTION_AMOUNT_SETTING_NAME;
    setting.Value__c = TEST_AMOUNT;
    insert setting;

    Integer savedAmount = SurveySettingController.getMaxQuestionAmount();
    System.assertEquals(Integer.valueOf(TEST_AMOUNT), savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetMinQuestionAmount() {
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = MAX_QUESTION_AMOUNT_SETTING_NAME;
    setting.Value__c = TEST_AMOUNT;
    insert setting;

    Integer savedAmount = SurveySettingController.getMinQuestionAmount();
    System.assertEquals(Integer.valueOf(TEST_AMOUNT), savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetPageQuestionAmount() {
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = PAGE_QUESTION_AMOUNT_SETTING_NAME;
    setting.Value__c = TEST_AMOUNT;
    insert setting;

    Integer savedAmount = SurveySettingController.getPageQuestionAmount();
    System.assertEquals(Integer.valueOf(TEST_AMOUNT), savedAmount, INVALID_SETTING_VALUE);
  }
}