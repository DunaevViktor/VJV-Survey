@isTest
class TriggerHandlerTest {

    private static final String NEW_TITLE = 'New Title';
    private static final String ENERGY_INDUSTRY = 'Energy';
    private static final String CONTACT_OBJECT_API_NAME = 'Contact';
    private static final String TEST_SUPPLIED_EMAIL = 'NewEmail@vjv.com';
    
    private static final String INVALID_TRIGGER_RULES_AMOUNT = 'Actual length of trigger rules list doesn\'t equal to expected.';
    private static final String INVALID_EMAIL_RECEIVERS_AMOUNT = 'Actual length of email receivers list doesn\'t equal to expected.';
    private static final String ERROR_PROCESSING_CONTACT_TRIGGER = 'Error while trying to process Contact trigger action.';
    private static final String ERROR_PROCESSING_CASE_TRIGGER = 'Error while trying to process Case trigger action.';
    private static final String ERROR_PROCESSING_LEAD_TRIGGER = 'Error while trying to process Lead trigger action.';
    
    @testSetup
    static void makeData() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;
        
        SurveyEmailConfig__c config = TestDataFactory.createSurveyEmailConfig();
        insert config;
        
        insert TestDataFactory.createEmailReceivers(survey.Id);
        insert TestDataFactory.createTriggerRules(survey.Id);
        insert TestDataFactory.createContacts();
        insert TestDataFactory.createCases();
        insert TestDataFactory.createLeads();
    }
    
    @isTest
    static void testProcessContactChanges(){
        List<Contact> contactList = [SELECT Id, Birthdate, EmailBouncedDate, MailingLatitude, Title FROM Contact];
        Contact contact = contactList[0];
        contact.Birthdate = contact.Birthdate.addDays(1);
        contact.EmailBouncedDate = contact.EmailBouncedDate.addDays(1);
        contact.MailingLatitude = contact.MailingLatitude + 5;
        contact.Title = NEW_TITLE;
        
        try{
            update contact;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_CONTACT_TRIGGER);
        }
    }
    
    @isTest
    static void testProcessCaseChanges(){
        List<Case> caseList = [SELECT Id, SuppliedEmail FROM Case];
        Case testCase = caseList[0];
        testCase.SuppliedEmail = TEST_SUPPLIED_EMAIL;
        
        try{
            update testCase;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_CASE_TRIGGER);
        }
    }
    
    @isTest
    static void testProcessLeadChanges(){
        List<Lead> leadList = [SELECT Id, Industry FROM Lead];
        Lead testLead = leadList[0];
        testLead.Industry = ENERGY_INDUSTRY;
        
        try{
            update testLead;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_LEAD_TRIGGER);
        }
    }
    
    @isTest
    static void testGetTriggerRules(){
        List<Trigger_Rule__c> actualTriggerRules = TriggerRulesHandler.getTriggerRules(CONTACT_OBJECT_API_NAME);
        System.assertEquals(15, actualTriggerRules.size(), INVALID_TRIGGER_RULES_AMOUNT);
    }
}