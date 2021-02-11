@isTest
public class TestDataFactory {
    
    public static final String TEST_VALUE = 'Test';
    public static final String TEST_POSITION = '1';

    private static final Integer AMOUNT = 5;
    private static final String TEST_QUESTION_TYPE = 'Picklist';
    private static final String TEST_VALIDATION_OPERATOR = 'CONTAINS';
    private static final String TEST_OBJECT_API_NAME = 'Contact';

    private static final String EMAIL_RECEIVER_TYPE_GROUP = 'User Group';
    private static final String EMAIL_RECEIVER_TYPE_CAMPAIGN = 'Campaign';
    private static final String EMAIL_RECEIVER_TYPE_RECORD = 'Record';

    private static Integer sNum = 1;
    
    static final List<String> NUMBER_DATE_OPERATORS = new List<String>{'IS NULL', 'EQUALS', 'NOT EQUALS', 'LESS THAN', 'GREATER THAN'};
    static final List<String> OTHER_FIELD_OPERATORS = new List<String>{'IS NULL', 'EQUALS', 'NOT EQUALS', 'CONTAINS', 'NOT CONTAINS'};

    public static Survey__c createSurvey() {
        Survey__c survey = new Survey__c();
        survey.Name = TEST_VALUE;

        return survey;
    }

    public static Question__c createQuestion(String surveyId) {
        Question__c question = new Question__c();
        question.Survey__c = surveyId;
        question.Label__c = TEST_VALUE;
        question.Type__c = TEST_QUESTION_TYPE;
        question.Position__c = TEST_POSITION;
        return question;
    }

    public static Question_Option__c createQuestionOption(String questionId) {
        Question_Option__c option = new Question_Option__c();
        option.Question__c = questionId;
        option.Value__c = TEST_VALUE;
        return option;
    }

    public static Validation__c  createValidation(String relatedQuestionId, String dependentQuestionId) {
        Validation__c validation = new validation__c();
        validation.Related_Question__c = relatedQuestionId;
        validation.Dependent_Question__c = dependentQuestionId;
        validation.Operator__c = TEST_VALIDATION_OPERATOR;
        validation.Value__c = TEST_VALUE;
        return validation;
    }

    public static Email_Receiver__c createReceiver(String type, String value, String surveyId) {
        Email_Receiver__c receiver = new Email_Receiver__c();
        receiver.Type__c = type;
        receiver.Value__c = value;
        receiver.Survey__c = surveyId;
        return receiver;
    }

    public static Lead createLead() {
        Lead lead = new Lead();
        lead.Company = TEST_VALUE;
        lead.LastName = TEST_VALUE;
        return lead;
    }

    public static Contact createContact() {
        Contact contact = new Contact();
        contact.LastName = TEST_VALUE;
        return contact;
    }

    public static Campaign createCampaign() {
        Campaign campaign = new Campaign();
        campaign.Name = TEST_VALUE;
        return campaign;
    }

    public static CampaignMember createCampaignMember(String campaignId, String leadId) {
        CampaignMember campaignMember = new CampaignMember();
        campaignMember.CampaignId = campaignId;
        campaignMember.LeadId = leadId;
        return campaignMember;
    }

    public static Profile getStandardProfile() {
        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Standard User' WITH SECURITY_ENFORCED];
        return profile;
    }

    public static User createStandardUser(Profile profile) {
        User user = new User();
        user.Alias = 'standt';
        user.Email = 'standarduser@testorg.com';
        user.EmailEncodingKey = 'UTF-8';
        user.LastName = TEST_VALUE;
        user.LanguageLocaleKey = 'en_US';
        user.LocaleSidKey = 'en_US';
        user.ProfileId = profile.Id;
        user.TimeZoneSidKey = 'America/Los_Angeles';
        user.UserName = 'uniquetestusername@gmail.com';
        return user;
    }

    public static SurveyEmailConfig__c createSurveyEmailConfig() {
        SurveyEmailConfig__c config = new SurveyEmailConfig__c();
        config.Name = 'Main';
        config.Display_Name__c = 'Display Name';
        config.Template_Name__c = 'Main Template';
        return config;
    }

    public static Group createGroup(String name, String developerName) {
        Group testGroup = new Group();
        testGroup.Name = name;
        testGroup.DeveloperName = developerName;
        return testGroup;
    }

    public static List<Question__c> createQuestions(Integer amount, String surveyId) {
        List<Question__c> questions = new List<Question__c>();
        for(Integer i = 0; i < amount; i++) {
          Question__c question = TestDataFactory.createQuestion(surveyId);
          questions.add(question);
        }
        return questions;
    }

    public static List<Question_Option__c> createQuestionOptions(Integer amount, String questionId) {
        List<Question_Option__c> options = new List<Question_Option__c>();
        for(Integer j = 0; j < amount; j++) {
          Question_Option__c option = TestDataFactory.createQuestionOption(questionId);
          options.add(option);
        } 
        return options;
    }    
    
    public static List<Email_Receiver__c> createEmailReceivers(Id surveyId){
        List<Email_Receiver__c> receivers = new List<Email_Receiver__c>();
        String value = 'mail';

        for(Integer i = 0; i < AMOUNT; i++) {
            Email_Receiver__c receiver = TestDataFactory.createReceiver(
                EMAIL_RECEIVER_TYPE_GROUP, 
                TEST_VALUE + i, 
                surveyId);
            receivers.add(receiver);
        } 
        return receivers;
    }
    
    public static List<Case> createCases(){
        List<Case> caseList = new List<Case>();
        
        for(Integer i=0; i<AMOUNT; i++){
            Case testCase = new Case(SuppliedEmail = 'Email' + i + '@vjv.com');
            caseList.add(testCase);
        }
        
        return caseList;
    }
    
    public static List<Lead> createLeads(){
        List<Lead> leadList = new List<Lead>();
        
        for(Integer i=0; i<5; i++){
            Lead testLead = TestDataFactory.createLead();
            testLead.Industry='Apparel';
            leadList.add(testLead);
        }
        
        return leadList;
    }

    public static List<Contact> createContacts(){
        List<Contact> contactList = new List<Contact>();
        
        Date testBirthdate = Date.parse('4/28/2021'); 
        Datetime testEmailBouncedDate = Datetime.parse('10/14/2018, 11:46 AM');
        
        for(Integer i=0; i<AMOUNT; i++){
            Contact testContact = new Contact();
            testContact.LastName = 'Test Name';
            testContact.Birthdate = testBirthdate;
            testContact.EmailBouncedDate = testEmailBouncedDate;
            testContact.MailingLongitude = 15;
            testContact.MailingLatitude = 15;
            contactList.add(testContact);
        }
        
        return contactList;
    }

    public static List<Trigger_Rule__c> createTriggerRules(Id surveyId) {
        Map<String, List<String>> fieldTypeOperators = new Map<String, List<String>>();
                
        fieldTypeOperators.put('DATE', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('DATETIME', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('DOUBLE', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('TEXT', OTHER_FIELD_OPERATORS);
                
        List<Trigger_Rule__c> triggerRules = new List<Trigger_Rule__c>();
                
        for(String fieldType: fieldTypeOperators.keySet()){
            for(String operator: fieldTypeOperators.get(fieldType)){
                Trigger_Rule__c triggerRule;
                switch on fieldType{
                    when 'DATE'{
                        triggerRule = TestDataFactory.createTriggerRule('Birthdate', operator,  '4/28/2020');
                        triggerRule.Survey__c = surveyId;
                    }
                    when 'DATETIME'{
                        triggerRule = TestDataFactory.createTriggerRule('EmailBouncedDate', operator,  '10/14/2019, 11:46 AM');
                        triggerRule.Survey__c = surveyId;
                    }
                    when 'DOUBLE'{
                        triggerRule = TestDataFactory.createTriggerRule('MailingLatitude', operator,  '12345');
                        triggerRule.Survey__c = surveyId;
                    }
                    when else{
                        triggerRule = TestDataFactory.createTriggerRule('SuppliedEmail', operator,  'Test Email');
                        triggerRule.Object_Api_Name__c = 'Case';
                        triggerRule.Survey__c = surveyId;
                    }
                }
                triggerRules.add(triggerRule);
            }
        }
                
        return triggerRules;
    }

    private static Trigger_Rule__c  createTriggerRule(String fieldName, String operator, String value) {
        Trigger_Rule__c rule = new Trigger_Rule__c();
        rule.Field_Name__c = fieldName;
        rule.Operator__c = operator;
        rule.Field_Value__c = value;
        rule.Object_Api_Name__c = TEST_OBJECT_API_NAME;
        return rule;
    }

    public static String getFakeId(String objectApiName) {
        SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
        String result = String.valueOf(sNum++);
        return sobjectType.getDescribe().getKeyPrefix() + '0'.repeat(12-result.length()) + result;
   }
}