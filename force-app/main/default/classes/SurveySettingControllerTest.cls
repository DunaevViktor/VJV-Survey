@IsTest
public with sharing class SurveySettingControllerTest {
  private static final String AMOUNT_SETTING_NAME = 'Max Question Amount';
  private static final String MAX_TRIGGER_RULES_AMOUNT_SETTING_NAME = 'Max Trigger Rule Amount';
  private static final String TEST_AMOUNT = '5';
  private static final String MAX_TRIGGER_RULES_TEST_AMOUNT = '3';

  private static final String INVALID_SETTING_VALUE = 'Actual value of setting doesn\'t equal to expected';
  private static final String INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE = 'Actual value of max trigger rule amount setting doesn\'t equal to expected.';

  @TestSetup
  static void makeData(){
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = MAX_TRIGGER_RULES_AMOUNT_SETTING_NAME;
    setting.Value__c = MAX_TRIGGER_RULES_TEST_AMOUNT;
    insert setting;
  }

  @IsTest
  static void testGetMaxQuestionAmount() {
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = AMOUNT_SETTING_NAME;
    setting.Value__c = TEST_AMOUNT;
    insert setting;

    Integer savedAmount = SurveySettingController.getMaxQuestionAmount();
    System.assertEquals(Integer.valueOf(TEST_AMOUNT), savedAmount, INVALID_SETTING_VALUE);
  }

  @IsTest
  static void testGetMaxTriggerRuleAmount() {    
    Integer fetchedValue = SurveySettingController.getMaxTriggerRuleAmount();
    System.assertEquals(Integer.valueOf(MAX_TRIGGER_RULES_TEST_AMOUNT), fetchedValue, INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE);
  }
}