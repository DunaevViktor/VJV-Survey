@IsTest
public with sharing class SurveySettingControllerTest {
  private static final Decimal TEST_AMOUNT = 5;

  private static final String SURVEY_SETTING_RECORD_NAME = 'Main';
  private static final String INVALID_SETTING_VALUE = 'Actual value of setting doesn\'t equal to expected';
  private static final String INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE = 'Actual value of max trigger rule amount setting doesn\'t equal to expected.';

  @TestSetup
  static void makeData(){
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = SURVEY_SETTING_RECORD_NAME;
    setting.Max_Question_Amount__c = TEST_AMOUNT;
    setting.Max_Trigger_Rule_Amount__c = TEST_AMOUNT;
    setting.Min_Question_Amount__c = TEST_AMOUNT;
    setting.Page_Question_Amount__c = TEST_AMOUNT;
    insert setting;
  }

  @IsTest
  static void testGetMaxQuestionAmount() {

    Decimal savedAmount = SurveySettingController.getMaxQuestionAmount();
    System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetMinQuestionAmount() {

    Decimal savedAmount = SurveySettingController.getMinQuestionAmount();
    System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetPageQuestionAmount() {

    Decimal savedAmount = SurveySettingController.getPageQuestionAmount();
    System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetMaxTriggerRuleAmount() {    
    Decimal fetchedValue = SurveySettingController.getMaxTriggerRuleAmount();
    System.assertEquals(TEST_AMOUNT, fetchedValue, INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE);
  }
}