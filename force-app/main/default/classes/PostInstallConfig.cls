global with sharing class PostInstallConfig implements InstallHandler {

    @testVisible private static final String CUSTOM_SETTING_RECORD_NAME = 'Main';
    
    @testVisible private static final Decimal DEFAULT_MAX_QUESTIONS_AMOUNT = 15;
    @testVisible private static final Decimal DEFAULT_MIN_QUESTIONS_AMOUNT = 1;
    @testVisible private static final Decimal DEFAULT_MAX_TRIGGER_RULE_AMOUNT = 5;
    @testVisible private static final Decimal DEFAULT_PAGE_QUESTION_AMOUNT = 5;
    @testVisible private static final String DEFAULT_BACKGROUND_COLOR = '#5E8AC0';

    @testVisible private static final String DEFAULT_COMPANY_CONFIG = 'COMPANY';
    @testVisible private static final String DEFAULT_DISPLAY_NAME = 'Survey';
    @testVisible private static final String DEFAULT_SUBJECT = 'Survey';
    @testVisible private static final String DEFAULT_TEMPLATE_NAME = 'Main Template';
    @testVisible private static final String DEFAULT_URL_CONFIG = 'URL';

    global void onInstall(InstallContext context) {
        if(context.previousVersion() == null) {
            createSurveyCustomSettingRecord();
            createEmailCustomSettingRecord();
        } else {
            if(!isSurveySettingRecordExisting()) {
                createSurveyCustomSettingRecord();
            }
            if(!isEmailSettingRecordExisting()) {
                createEmailCustomSettingRecord();
            }
        }
    }

    @testVisible private static void createSurveyCustomSettingRecord() {
        Survey_Setting__c surveySetting = new Survey_Setting__c(
            Name = CUSTOM_SETTING_RECORD_NAME,
            Max_Question_Amount__c = DEFAULT_MAX_QUESTIONS_AMOUNT,
            Min_Question_Amount__c = DEFAULT_MIN_QUESTIONS_AMOUNT,
            Max_Trigger_Rule_Amount__c = DEFAULT_MAX_TRIGGER_RULE_AMOUNT,
            Page_Question_Amount__c = DEFAULT_PAGE_QUESTION_AMOUNT,
            Background_Color__c = DEFAULT_BACKGROUND_COLOR
        );

        insert surveySetting;
    }

    @testVisible private static void createEmailCustomSettingRecord() {
        SurveyEmailConfig__c surveySetting = new SurveyEmailConfig__c(
            Name = CUSTOM_SETTING_RECORD_NAME,
            Company_Config__c = DEFAULT_COMPANY_CONFIG,
            Display_Name__c = DEFAULT_DISPLAY_NAME,
            Subject__c = DEFAULT_SUBJECT,
            Template_Name__c = DEFAULT_TEMPLATE_NAME,
            Url_Config__c = DEFAULT_URL_CONFIG
        );

        insert surveySetting;
    }

    private Boolean isSurveySettingRecordExisting() {
        List<Survey_Setting__c> settings = [SELECT Id
                                            FROM Survey_Setting__c
                                            LIMIT 1];
        if(settings.size() == 0) {
            return false;
        }
        return true;
    }

    private Boolean isEmailSettingRecordExisting() {
        List<SurveyEmailConfig__c> settings = [SELECT Id
                                               FROM SurveyEmailConfig__c
                                               LIMIT 1];
        if(settings.size() == 0) {
            return false;
        }
        return true;
    }    
}
