@IsTest
public with sharing class SurveySettingControllerTest {
  private static final String AMOUNT_SETTING_NAME = 'Max Question Amount';
  private static final String TEST_AMOUNT = '5';

  private static final String INVALID_SETTING_VALUE = 'Actual value of setting doesn\'t equal to expected';

  @IsTest
  public static void getMaxQuestionAmountTest() {
    Survey_Setting__c setting = new Survey_Setting__c();
    setting.Name = AMOUNT_SETTING_NAME;
    setting.Value__c = TEST_AMOUNT;
    insert setting;

    Integer savedAmount = SurveySettingController.getMaxQuestionAmount();
    System.assertEquals(Integer.valueOf(TEST_AMOUNT), savedAmount, INVALID_SETTING_VALUE);
  }
}
