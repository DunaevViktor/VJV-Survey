@isTest
public with sharing class PostInstallConfigTest {

    private static final String SURVEY_SETTING_WASNT_INSTALLED = 'Survey setting record wasn\'t installed in post install script.';
    private static final String EMAIL_SETTING_WASNT_INSTALLED = 'Email setting record wasn\'t installed in post install script.';
    private static final String SURVEY_SETTING_FIELD_WASNT_INSTALLED = 'Survey setting record field wasn\'t installed in post install script.';
    private static final String EMAIL_SETTING_FIELD_WASNT_INSTALLED = 'Email setting record field wasn\'t installed in post install script.';

    @isTest
    static void testInstallScriptForSurveySettingFirstVersion() {
        PostInstallConfig postinstall = new PostInstallConfig();
        Test.testInstall(postinstall, null);
        List<Survey_Setting__c> settings = [Select ID, Name, Max_Question_Amount__c, Min_Question_Amount__c, 
                                            Max_Trigger_Rule_Amount__c, Page_Question_Amount__c, Background_Color__c 
                                            FROM Survey_Setting__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_QUESTIONS_AMOUNT, settings[0].Max_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MIN_QUESTIONS_AMOUNT, settings[0].Min_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_TRIGGER_RULE_AMOUNT, settings[0].Max_Trigger_Rule_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_PAGE_QUESTION_AMOUNT, settings[0].Page_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_BACKGROUND_COLOR, settings[0].Background_Color__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
    }

    @isTest
    static void testInstallScriptForEmailSettingFirstVersion() {
        PostInstallConfig postinstall = new PostInstallConfig();
        Test.testInstall(postinstall, null);
        List<SurveyEmailConfig__c> settings = [Select ID, Name, Company_Config__c, Display_Name__c, 
                                               Subject__c, Template_Name__c, Url_Config__c 
                                               FROM SurveyEmailConfig__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_COMPANY_CONFIG, settings[0].Company_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_DISPLAY_NAME, settings[0].Display_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_SUBJECT, settings[0].Subject__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_TEMPLATE_NAME, settings[0].Template_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_URL_CONFIG, settings[0].Url_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
    }

    @isTest
    static void testInstallScriptForSurveySettingSecondVersionNonExistingRecord() {
        PostInstallConfig postinstall = new PostInstallConfig();
        Version version = new Version(2, 0);
        Test.testInstall(postinstall, version);
        List<Survey_Setting__c> settings = [Select ID, Name, Max_Question_Amount__c, Min_Question_Amount__c, 
                                            Max_Trigger_Rule_Amount__c, Page_Question_Amount__c, Background_Color__c 
                                            FROM Survey_Setting__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_QUESTIONS_AMOUNT, settings[0].Max_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MIN_QUESTIONS_AMOUNT, settings[0].Min_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_TRIGGER_RULE_AMOUNT, settings[0].Max_Trigger_Rule_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_PAGE_QUESTION_AMOUNT, settings[0].Page_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_BACKGROUND_COLOR, settings[0].Background_Color__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
    }

    @isTest
    static void testInstallScriptForEmailSettingSecondVersionNonExistingRecord() {
        PostInstallConfig postinstall = new PostInstallConfig();
        Version version = new Version(2, 0);
        Test.testInstall(postinstall, version);
        List<SurveyEmailConfig__c> settings = [Select ID, Name, Company_Config__c, Display_Name__c, 
                                               Subject__c, Template_Name__c, Url_Config__c 
                                               FROM SurveyEmailConfig__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_COMPANY_CONFIG, settings[0].Company_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_DISPLAY_NAME, settings[0].Display_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_SUBJECT, settings[0].Subject__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_TEMPLATE_NAME, settings[0].Template_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_URL_CONFIG, settings[0].Url_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
    }

    @isTest
    static void testInstallScriptForSurveySettingSecondVersionExistingRecord() {
        PostInstallConfig postinstall = new PostInstallConfig();
        PostInstallConfig.createSurveyCustomSettingRecord();
        Version version = new Version(2, 0);
        Test.testInstall(postinstall, version);
        List<Survey_Setting__c> settings = [Select ID, Name, Max_Question_Amount__c, Min_Question_Amount__c, 
                                            Max_Trigger_Rule_Amount__c, Page_Question_Amount__c, Background_Color__c 
                                            FROM Survey_Setting__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_QUESTIONS_AMOUNT, settings[0].Max_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MIN_QUESTIONS_AMOUNT, settings[0].Min_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_MAX_TRIGGER_RULE_AMOUNT, settings[0].Max_Trigger_Rule_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_PAGE_QUESTION_AMOUNT, settings[0].Page_Question_Amount__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_BACKGROUND_COLOR, settings[0].Background_Color__c, SURVEY_SETTING_FIELD_WASNT_INSTALLED);
    }

    @isTest
    static void testInstallScriptForEmailSettingSecondVersionExistingRecord() {
        PostInstallConfig postinstall = new PostInstallConfig();
        PostInstallConfig.createEmailCustomSettingRecord();
        Version version = new Version(2, 0);
        Test.testInstall(postinstall, version);
        List<SurveyEmailConfig__c> settings = [Select ID, Name, Company_Config__c, Display_Name__c, 
                                               Subject__c, Template_Name__c, Url_Config__c 
                                               FROM SurveyEmailConfig__c];
        System.assertEquals(1, settings.size(), SURVEY_SETTING_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.CUSTOM_SETTING_RECORD_NAME, settings[0].Name, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_COMPANY_CONFIG, settings[0].Company_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_DISPLAY_NAME, settings[0].Display_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_SUBJECT, settings[0].Subject__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_TEMPLATE_NAME, settings[0].Template_Name__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
        System.assertEquals(PostInstallConfig.DEFAULT_URL_CONFIG, settings[0].Url_Config__c, EMAIL_SETTING_FIELD_WASNT_INSTALLED);
    }
}
