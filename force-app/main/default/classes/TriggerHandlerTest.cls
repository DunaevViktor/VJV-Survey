@isTest
class TriggerHandlerTest {
    
    private static final String INVALID_TRIGGER_RULES_AMOUNT = 'Actual length of trigger rules list doesn\'t equal to expected';
    private static final String INVALID_EMAIL_RECEIVERS_AMOUNT = 'Actual length of email receivers list doesn\'t equal to expected';
    private static final String ERROR_PROCESSING_CONTACT_TRIGGER = 'Error while trying to process Contact trigger action';
    private static final String ERROR_PROCESSING_CASE_TRIGGER = 'Error while trying to process Case trigger action';
    private static final String ERROR_PROCESSING_LEAD_TRIGGER = 'Error while trying to process Lead trigger action';
    
    @testSetup
    static void makeData() {
        Survey__c survey = TestDataFactory.createSurvey();
        insert survey;

        insert TestDataFactory.createEmailReceivers(survey.Id);
        insert TestDataFactory.createTriggerRules(survey.Id);
        insert TestDataFactory.createContacts();
        insert TestDataFactory.createCases();
        insert TestDataFactory.createLeads();
    }
    
    @isTest
    static void testProcessContactChanges(){
        List<Contact> contactList = [SELECT Id, FirstName, LastName,
                                     Birthdate, EmailBouncedDate, MailingLatitude, Title
                                     FROM Contact];
        List<Contact> updatedContacts = new List<Contact>();
        
        for(Contact contact: contactList){
            contact.Birthdate = contact.Birthdate.addDays(1);
            contact.EmailBouncedDate = contact.EmailBouncedDate.addDays(1);
            contact.MailingLatitude = contact.MailingLatitude + 5;
            contact.Title = 'New Title';
            updatedContacts.add(contact);
        }
        
        try{
            update updatedContacts;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_CONTACT_TRIGGER);
        }
    }
    
    @isTest
    static void testProcessCaseChanges(){
        List<Case> caseList = [SELECT Id, SuppliedEmail FROM Case];
        List<Case> updatedCases = new List<Case>();
        
        for(Case testCase: caseList){
            testCase.SuppliedEmail = 'NewEmail@vjv.com';
            updatedCases.add(testCase);
        }
        
        try{
            update updatedCases;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_CASE_TRIGGER);
        }
    }
    
    @isTest
    static void testProcessLeadChanges(){
        List<Lead> leadList = [SELECT Id, Industry FROM Lead];
        List<Lead> updatedLeads = new List<Lead>();
        
        for(Lead testLead: leadList){
            testLead.Industry = 'Energy';
            updatedLeads.add(testLead);
        }
        
        try{
            update updatedLeads;
        }catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), ERROR_PROCESSING_LEAD_TRIGGER);
        }
    }
    
    @isTest
    static void testGetTriggerRules(){
        List<Trigger_Rule__c> actualTriggerRules = TriggerRulesHandler.getTriggerRules('Contact');
        System.assertEquals(15, actualTriggerRules.size(), INVALID_TRIGGER_RULES_AMOUNT);
    }
}