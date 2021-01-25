public with sharing class SurveySettingController {
  private static final String MAX_QUESTION_AMOUNT_SETTING_NAME = 'Max Question Amount';
  private static final String MIN_QUESTION_AMOUNT_SETTING_NAME = 'Min Question Amount';
  private static final String PAGE_QUESTION_AMOUNT_SETTING_NAME = 'Page Question Amount';

  @AuraEnabled(cacheable=true)
  public static Integer getMaxQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(MAX_QUESTION_AMOUNT_SETTING_NAME);
    return Integer.valueOf(setting.Value__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getMinQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(MIN_QUESTION_AMOUNT_SETTING_NAME);
    return Integer.valueOf(setting.Value__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getPageQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(PAGE_QUESTION_AMOUNT_SETTING_NAME);
    return Integer.valueOf(setting.Value__c);
  }
}