@IsTest
public with sharing class SendEmailLogicTest {

    private static final String TEST_CAMPAIGN_NAME = 'Test Campaign Name';
    private static final String TEST_COMPANY_NAME = 'Test Company Name';
    private static final String TEST_LAST_NAME = 'Test';
    private static final String TEST_EMAIL = 'test@gmail.ru';

    private static final String EMAIL_RECEIVER_TYPE_GROUP = 'User Group';
    private static final String EMAIL_RECEIVER_TYPE_CAMPAIGN = 'Campaign';
    private static final String EMAIL_RECEIVER_TYPE_RECORD = 'Record';
    
    private static final String EMAIL_ERROR = 'The email was not sent.';
    private static final String AMOUNT_ERROR = 'The received quantity is not what was expected.';
    private static final String ORG_ERROR = 'The current organization was not found.';
    private static final String TEMPLATE_ERROR = 'The current template was not found.';
    private static final String EMAIL_BODY_ERROR = 'No email body was created.';
    private static final String CONTAIN_ERROR = 'The specified object will not be found.';
    
    @TestSetup
    static void makeData(){
        SurveyEmailConfig__c config = new SurveyEmailConfig__c(Name = 'Main',
                                                               Display_Name__c = 'Display Name',
                                                               Subject__c = 'Subject',
                                                               Template_Name__c = 'Main Template',
                                                               Url_Config__c = 'URL',
                                                               Company_Config__c = 'COMPANY');
        insert config;
        
        Profile profile = [SELECT Id, Name FROM Profile WHERE Name = 'Standard User' WITH SECURITY_ENFORCED LIMIT 1];
        
        User newUser = new User(LastName = 'TestName', Email = 'test@test.com', Alias = 'TName', 
                                Username = 't1n3a3m7e@test.com', LocaleSidKey = 'en_US', TimeZoneSidKey = 'GMT', 
                                ProfileID = profile.Id, LanguageLocaleKey = 'en_US', EmailEncodingKey = 'UTF-8');
        insert newUser;

        Lead lead = new Lead();
        lead.Company = TEST_COMPANY_NAME;
        lead.LastName = TEST_LAST_NAME;
        lead.Email = TEST_EMAIL;
        insert lead;

        Contact contact = new Contact();
        contact.LastName = TEST_LAST_NAME;
        contact.Email = TEST_EMAIL;
        insert contact;

        Campaign campaign = new Campaign(Name = TEST_CAMPAIGN_NAME);
        insert campaign;

        CampaignMember campaignMember = new CampaignMember();
        campaignMember.CampaignId = campaign.Id;
        campaignMember.LeadId = lead.Id;
        campaignMember.ContactId = contact.Id;
        insert campaignMember;
        
        Group testGroup = new Group(Name = 'TestGroup', DeveloperName='TestDeveloperGroup');
        insert testGroup;
        
        System.runAs(new User(Id = UserInfo.getUserId())) {
            GroupMember groupMember = new GroupMember(GroupId = testGroup.Id, UserOrGroupId = newUser.Id);
            insert groupMember;
        }
        
        Survey__c simpleSurvey = new Survey__c(Name = 'Simple Survey', URL__c = 'https://test2.com');
        insert simpleSurvey;
        
        Email_Receiver__c groupReceiver = new Email_Receiver__c(Type__c = EMAIL_RECEIVER_TYPE_GROUP, Value__c = 'TestGroup', 
                                                                Survey__c = simpleSurvey.Id);
        
        Email_Receiver__c campaignReceiver = new Email_Receiver__c(Type__c = EMAIL_RECEIVER_TYPE_CAMPAIGN, Value__c = campaign.Name, 
                                                                Survey__c = simpleSurvey.Id);

        Email_Receiver__c recordReceiver = new Email_Receiver__c(Type__c = EMAIL_RECEIVER_TYPE_RECORD, Value__c = lead.Id, 
                                                                Survey__c = simpleSurvey.Id);                                                        
        insert campaignReceiver;
        insert groupReceiver;
        insert recordReceiver;
    }
    
    @IsTest
    static void testSendEmails(){
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c FROM Email_Receiver__c WITH SECURITY_ENFORCED];
        Test.startTest();
        SendEmailLogic.sendEmails(receiverList);
        Integer invocations = Limits.getEmailInvocations();
        Test.stopTest();
        System.assertEquals(1, invocations, EMAIL_ERROR);
    } 
    
    @IsTest
    static void testCreateEmailMessages() {
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c FROM Email_Receiver__c WITH SECURITY_ENFORCED];
        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        List<Messaging.SingleEmailMessage> messageList = SendEmailLogic.createEmailMessages(receiverList, surveyMap);
        System.assertEquals(4, messageList.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testCreateEmailBody(){
        Survey__c survey = [SELECT Id, Name, URL__c 
                            FROM Survey__c WHERE Name = 'Simple Survey' WITH SECURITY_ENFORCED LIMIT 1];
        Organization currentOrg = SendEmailLogicHelper.getOrganization();
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        String body = SendEmailLogicHelper.createEmailBody(template.body, survey, currentOrg);
        System.assertNotEquals(null, body, EMAIL_BODY_ERROR);
    }
    
    @IsTest
    static void testGetMethods(){
        Group currentGroup = [SELECT Id, Name FROM Group WHERE Name = 'TestGroup' WITH SECURITY_ENFORCED LIMIT 1];
        GroupMember currentMember = [SELECT Id, GroupId, UserOrGroupId FROM GroupMember WHERE GroupId = :currentGroup.Id WITH SECURITY_ENFORCED LIMIT 1];
        User currentUser = [SELECT Id, Name, Email FROM User WHERE Email = 'test@test.com' WITH SECURITY_ENFORCED LIMIT 1];

        List<User> userList = SendEmailLogicHelper.getUser();
        Boolean actualUser = userList.contains(currentUser);
        System.assertEquals(true, actualUser, CONTAIN_ERROR);
        
        List<Group> groupList = SendEmailLogicHelper.getGroup();
        Boolean actualGroup = groupList.contains(currentGroup);
        System.assertEquals(true, actualGroup, CONTAIN_ERROR);
        
        List<GroupMember> memberList = SendEmailLogicHelper.getGroupMember();
        Boolean actualMember = memberList.contains(currentMember);
        System.assertEquals(true, actualMember, CONTAIN_ERROR);

        Organization currentOrg = SendEmailLogicHelper.getOrganization();
        System.assertNotEquals(null, currentOrg, ORG_ERROR);
        
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        System.assertNotEquals(null, template, TEMPLATE_ERROR);
        
        List<Survey__c> surveyList = SendEmailLogicHelper.getSurvey();
        System.assertEquals(1, surveyList.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testCreateMapMethods(){
        Group currentGroup = [SELECT Id, Name FROM Group WHERE Name = 'TestGroup' WITH SECURITY_ENFORCED LIMIT 1];

        Map<Id, Group> groupMap = SendEmailLogicHelper.createGroupMap();
        Boolean actualGroup = groupMap.containsKey(currentGroup.Id);
        System.assertEquals(true, actualGroup, CONTAIN_ERROR);

        Map<String, List<User>> userMap = SendEmailLogicHelper.createUserByGroupMap();
        Boolean actualUser = userMap.containsKey('TestGroup');
        System.assertEquals(true, actualUser, CONTAIN_ERROR);

        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        System.assertEquals(1, surveyMap.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testInitializeUserByGroupMap(){
        Map<String, List<User>> userMap = SendEmailLogicHelper.initializeUserByGroupMap();
        Boolean actualUser = userMap.containsKey('TestGroup');
        System.assertEquals(true, actualUser, CONTAIN_ERROR);
    }
}