global with sharing class PostInstallConfig implements InstallHandler {

    private static final String SURVEY_CUSTOM_SETTING_RECORD_NAME = 'Main';
    private static final Decimal DEFAULT_MAX_QUESTIONS_AMOUNT = 15;
    private static final Decimal DEFAULT_MIN_QUESTIONS_AMOUNT = 1;
    private static final Decimal DEFAULT_MAX_TRIGGER_RULE_AMOUNT = 5;
    private static final Decimal DEFAULT_PAGE_QUESTION_AMOUNT = 5;
    private static final String DEFAULT_BACKGROUND_COLOR = '#5E8AC0';

    global void onInstall(InstallContext context) {
        if(context.previousVersion() == null) {
            createSurveyCustomSettingRecord();
        }
    }

    private void createSurveyCustomSettingRecord() {
        Survey_Setting__c surveySetting = new Survey_Setting__c(
            Name = SURVEY_CUSTOM_SETTING_RECORD_NAME,
            Max_Question_Amount__c = DEFAULT_MAX_QUESTIONS_AMOUNT,
            Min_Question_Amount__c = DEFAULT_MIN_QUESTIONS_AMOUNT,
            Max_Trigger_Rule_Amount__c = DEFAULT_MAX_TRIGGER_RULE_AMOUNT,
            Page_Question_Amount__c = DEFAULT_PAGE_QUESTION_AMOUNT,
            Background_Color__c = DEFAULT_BACKGROUND_COLOR
        );

        insert surveySetting;
    }

    private void createEmailCustomSettingRecord() {
        /*SurveyEmailConfig__c surveySetting = new SurveyEmailConfig__c(
            Name = SURVEY_CUSTOM_SETTING_RECORD_NAME,
            Max_Question_Amount__c = DEFAULT_MAX_QUESTIONS_AMOUNT,
            Min_Question_Amount__c = DEFAULT_MIN_QUESTIONS_AMOUNT,
            Max_Trigger_Rule_Amount__c = DEFAULT_MAX_TRIGGER_RULE_AMOUNT,
            Page_Question_Amount__c = DEFAULT_PAGE_QUESTION_AMOUNT
        );

        insert surveySetting;*/
    }
    
}
