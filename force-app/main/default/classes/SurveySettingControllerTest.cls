@IsTest
public with sharing class SurveySettingControllerTest {
    private static final Integer TEST_AMOUNT = 5;
    private static final String TEST_COLOR = '#5E8AC0';
    
    private static final String SURVEY_SETTING_RECORD_NAME = 'Main';
    private static final String INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE = 'Actual value of max trigger rule amount setting doesn\'t equal to expected.';
    private static final String INVALID_BACKGROUND_COLOR_VALUE = 'Actual value of background color doesn\'t equal to expected.';
    private static final String INVALID_MAX_QUESTION_AMOUNT_SETTING_VALUE = 'Actual value of max question amount setting doesn\'t equal to expected.';
    private static final String INVALID_MIN_QUESTION_AMOUNT_SETTING_VALUE = 'Actual value of min question rule amount setting doesn\'t equal to expected.';
    private static final String INVALID_PAGE_QUESTION_AMOUNT_SETTING_VALUE = 'Actual value of page question amount setting doesn\'t equal to expected.';
    private static final String INVALID_COMMUNITY_NAME_SETTING_VALUE = 'Actual value of community name setting doesn\'t equal to expected.';
    
    @TestSetup
    static void makeData() {
        Survey_Setting__c setting = new Survey_Setting__c();
        setting.Name = SURVEY_SETTING_RECORD_NAME;
        setting.Max_Question_Amount__c = TEST_AMOUNT;
        setting.Max_Trigger_Rule_Amount__c = TEST_AMOUNT;
        setting.Min_Question_Amount__c = TEST_AMOUNT;
        setting.Page_Question_Amount__c = TEST_AMOUNT;
        setting.Background_Color__c = TEST_COLOR;
        insert setting;
    }
    
    @IsTest
    static void testGetMaxQuestionAmount() {
        Integer savedAmount = SurveySettingController.getMaxQuestionAmount();
        System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_MAX_QUESTION_AMOUNT_SETTING_VALUE);
    }
    
    @IsTest
    static void testGetMinQuestionAmount() {
        Integer savedAmount = SurveySettingController.getMinQuestionAmount();
        System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_MIN_QUESTION_AMOUNT_SETTING_VALUE);
    }
    
    @IsTest
    static void testGetPageQuestionAmount() {
        Integer savedAmount = SurveySettingController.getPageQuestionAmount();
        System.assertEquals(TEST_AMOUNT, savedAmount, INVALID_PAGE_QUESTION_AMOUNT_SETTING_VALUE);
    }
    
    @IsTest
    static void testGetMaxTriggerRuleAmount() {    
        Integer fetchedValue = SurveySettingController.getMaxTriggerRuleAmount();
        System.assertEquals(TEST_AMOUNT, fetchedValue, INVALID_MAX_TRIGGER_RULE_AMOUNT_SETTING_VALUE);
    }
    
    @IsTest
    static void testGetDefaultBackgroundColor() {    
        String fetchedValue = SurveySettingController.getDefaultBackgroundColor();
        System.assertEquals(TEST_COLOR, fetchedValue, INVALID_BACKGROUND_COLOR_VALUE);
    }

    @IsTest
    static void testGetDefaultCommunityName() {    
        String fetchedValue = SurveySettingController.getDefaultCommunityName();
        System.assertEquals(null, fetchedValue, INVALID_COMMUNITY_NAME_SETTING_VALUE);
    }
}