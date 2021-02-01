@isTest
public with sharing class PostInstallConfigTest {

    private static final String SURVEY_SETTING_WASNT_INSTALLED = 'Survey setting record wasn\'t installed in post install script.';

    @isTest
    static void testInstallScript() {
        PostInstallConfig postinstall = new PostInstallConfig();
        Test.testInstall(postinstall, null);
        List<Survey_Setting__c> settings = [Select id, name from Survey_Setting__c];
        System.assertEquals(settings.size(), 1, SURVEY_SETTING_WASNT_INSTALLED);
    }
}
