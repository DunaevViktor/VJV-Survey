public with sharing class SurveySettingController {
  private static final String AMOUNT_SETTING_NAME = 'Max Question Amount';
  private static final String MAX_TRIGGER_RULE_ANOUNT_SETTING_NAME = 'Max Trigger Rule Amount';

  @AuraEnabled(cacheable=true)
  public static Integer getMaxQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(AMOUNT_SETTING_NAME);
    return Integer.valueOf(setting.Value__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getMaxTriggerRuleAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(MAX_TRIGGER_RULE_ANOUNT_SETTING_NAME);
    return Integer.valueOf(setting.Value__c);
  }
}