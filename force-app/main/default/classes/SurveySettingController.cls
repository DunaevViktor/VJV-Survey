public with sharing class SurveySettingController {

  private static final String SURVEY_SETTING_RECORD_NAME = 'Main';

  @AuraEnabled(cacheable=true)
  public static Decimal getMaxQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Max_Question_Amount__c;
  }

  @AuraEnabled(cacheable=true)
  public static Decimal getMinQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Min_Question_Amount__c;
  }

  @AuraEnabled(cacheable=true)
  public static Decimal getPageQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Page_Question_Amount__c;
  }

  @AuraEnabled(cacheable=true)
  public static Decimal getMaxTriggerRuleAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Max_Trigger_Rule_Amount__c;
  }

  @AuraEnabled(cacheable=true)
  public static String getDefaultBackgroundColor() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Background_Color__c;
  }
}