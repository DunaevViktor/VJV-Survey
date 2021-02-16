public with sharing class SurveySettingController {

  private static final String SURVEY_SETTING_RECORD_NAME = 'Main';

  @AuraEnabled(cacheable=true)
  public static Integer getMaxQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return Integer.valueOf(setting.Max_Question_Amount__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getMinQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return Integer.valueOf(setting.Min_Question_Amount__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getPageQuestionAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return Integer.valueOf(setting.Page_Question_Amount__c);
  }

  @AuraEnabled(cacheable=true)
  public static Integer getMaxTriggerRuleAmount() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return Integer.valueOf(setting.Max_Trigger_Rule_Amount__c);
  }

  @AuraEnabled(cacheable=true)
  public static String getDefaultBackgroundColor() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Background_Color__c;
  }
  
  @AuraEnabled(cacheable=true)
  public static String getCommunityName() {
    Survey_Setting__c setting = Survey_Setting__c.getValues(SURVEY_SETTING_RECORD_NAME);
    return setting.Community_Name__c;
  }
}