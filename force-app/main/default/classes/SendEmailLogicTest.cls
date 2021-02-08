@IsTest
public with sharing class SendEmailLogicTest {

    private static final String TEST_EMAIL = 'test@gmail.ru';
    private static final String TEST_GROUP_NAME = 'TestGroup';
    private static final String TEST_DEVELOPER_NAME = 'TestDeveloperGroup';
    private static final String TEST_URL = 'https://test2.com';

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
        SurveyEmailConfig__c config = TestDataFactory.createSurveyEmailConfig();
        insert config;
        
        Profile profile = TestDataFactory.getStandardProfile();
        
        User newUser = TestDataFactory.createStandardUser(profile);
        newUser.Email = TEST_EMAIL;
        insert newUser;

        Lead lead = TestDataFactory.createLead();
        lead.Email = TEST_EMAIL;
        insert lead;

        Contact contact = TestDataFactory.createContact(); 
        contact.Email = TEST_EMAIL;
        insert contact;

        Campaign campaign = TestDataFactory.createCampaign();
        insert campaign;

        CampaignMember campaignMember = TestDataFactory.createCampaignMember(campaign.Id, lead.Id);
        campaignMember.ContactId = contact.Id;
        insert campaignMember;
        
        Group testGroup = TestDataFactory.createGroup(TEST_GROUP_NAME, TEST_DEVELOPER_NAME);
        insert testGroup;
        
        System.runAs(new User(Id = UserInfo.getUserId())) {
            GroupMember groupMember = new GroupMember(GroupId = testGroup.Id, UserOrGroupId = newUser.Id);
            insert groupMember;
        }
        
        Survey__c simpleSurvey = TestDataFactory.createSurvey();
        simpleSurvey.URL__c = TEST_URL;
        insert simpleSurvey;
        
        Email_Receiver__c groupReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_GROUP, TEST_GROUP_NAME, simpleSurvey.Id);
        insert groupReceiver;
        
        Email_Receiver__c campaignReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_CAMPAIGN, campaign.Name, simpleSurvey.Id);
        insert campaignReceiver;

        Email_Receiver__c recordReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_RECORD, lead.Id, simpleSurvey.Id);                                                        
        insert recordReceiver;
    }
    
    /*@IsTest
    static void testSendEmails(){
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c 
                                                FROM Email_Receiver__c WITH SECURITY_ENFORCED];

        Test.startTest();
        SendEmailLogic.sendEmails(receiverList);
        Integer invocations = Limits.getEmailInvocations();
        Test.stopTest();

        System.assertEquals(1, invocations, EMAIL_ERROR);
    } 
    
    @IsTest
    static void testCreateEmailMessages() {
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c 
                                                FROM Email_Receiver__c WITH SECURITY_ENFORCED];

        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        List<Messaging.SingleEmailMessage> messageList = SendEmailLogic.createEmailMessages(receiverList, surveyMap);

        System.assertEquals(4, messageList.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testCreateEmailBody(){
        Survey__c survey = [SELECT Id, Name, URL__c 
                            FROM Survey__c WHERE Name = :TestDataFactory.TEST_VALUE WITH SECURITY_ENFORCED LIMIT 1];

        Organization currentOrg = SendEmailLogicHelper.getOrganization();
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        String body = SendEmailLogicHelper.createEmailBody(template.body, survey, currentOrg);

        System.assertNotEquals(null, body, EMAIL_BODY_ERROR);
    }
    
    @IsTest
    static void testGetMethods(){
        Group currentGroup = [SELECT Id, Name FROM Group WHERE Name = :TEST_GROUP_NAME WITH SECURITY_ENFORCED LIMIT 1];
        GroupMember currentMember = [SELECT Id, GroupId, UserOrGroupId FROM GroupMember WHERE GroupId = :currentGroup.Id WITH SECURITY_ENFORCED LIMIT 1];
        User currentUser = [SELECT Id, Name, Email FROM User WHERE Email = :TEST_EMAIL WITH SECURITY_ENFORCED LIMIT 1];

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
        Group currentGroup = [SELECT Id, Name FROM Group WHERE Name = :TEST_GROUP_NAME WITH SECURITY_ENFORCED LIMIT 1];

        Map<Id, Group> groupMap = SendEmailLogicHelper.createGroupMap();
        Boolean actualGroup = groupMap.containsKey(currentGroup.Id);
        System.assertEquals(true, actualGroup, CONTAIN_ERROR);

        Map<String, List<User>> userMap = SendEmailLogicHelper.createUserByGroupMap();
        Boolean actualUser = userMap.containsKey(TEST_GROUP_NAME);
        System.assertEquals(true, actualUser, CONTAIN_ERROR);

        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        System.assertEquals(1, surveyMap.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testInitializeUserByGroupMap(){
        Map<String, List<User>> userMap = SendEmailLogicHelper.initializeUserByGroupMap();
        Boolean actualUser = userMap.containsKey(TEST_GROUP_NAME);
        System.assertEquals(true, actualUser, CONTAIN_ERROR);
    }*/
}