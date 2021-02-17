@IsTest
public with sharing class SendEmailLogicTest {

    private static final String EMAIL_CUSTOM_SETTING_RECORD_NAME = 'Main';
    private static final String TEST_NAME = 'Test';
    
    private static final String TEST_EMAIL = 'test@gmail.ru';
    private static final String TEST_GROUP_NAME = 'UniqueTestGroup';
    private static final String TEST_DEVELOPER_NAME = 'TestDeveloperGroup';
    private static final String TEST_URL = 'https://test2.com';
    
    private static final String EMAIL_RECEIVER_TYPE_GROUP = 'User Group';
    private static final String EMAIL_RECEIVER_TYPE_CAMPAIGN = 'Campaign';
    private static final String EMAIL_RECEIVER_TYPE_RECORD = 'Record';
    
    private static final String EMAIL_ERROR = 'The email was not sent.';
    private static final String AMOUNT_ERROR = 'The received quantity is not what was expected.';
    private static final String TEMPLATE_ERROR = 'The current template was not found.';
    private static final String EMAIL_CREATE_ERROR = 'No email was created.';
    
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
        
        Email_Receiver__c groupReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_GROUP, testGroup.Id, simpleSurvey.Id);
        insert groupReceiver;
        
        Email_Receiver__c campaignReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_CAMPAIGN, campaign.Id, simpleSurvey.Id);
        insert campaignReceiver;
        
        Email_Receiver__c recordReceiver = TestDataFactory.createReceiver(EMAIL_RECEIVER_TYPE_RECORD, lead.Id, simpleSurvey.Id);                                                        
        insert recordReceiver;
    }
    
    @IsTest
    static void testSendEmails(){
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c FROM Email_Receiver__c];
        
        Test.startTest();
        SendEmailLogic.sendEmails(receiverList);
        Integer invocations = Limits.getEmailInvocations();
        Test.stopTest();
        
        System.assertEquals(1, invocations, EMAIL_ERROR);
    } 
    
    @IsTest
    static void testCreateEmailMessages() {
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c FROM Email_Receiver__c];
        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        
        List<Messaging.SingleEmailMessage> messageList = SendEmailLogic.createEmailMessages(receiverList, surveyMap);
        System.assertEquals(4, messageList.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testCreateSingleEmail(){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_CUSTOM_SETTING_RECORD_NAME);
        Contact currentContact = [SELECT Id FROM Contact LIMIT 1];
        Survey__c survey = [SELECT Id FROM Survey__c LIMIT 1];
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        List<Id> currentSurveyAndTemplateId = new List<Id>{survey.Id, template.Id};
            
        Messaging.SingleEmailMessage email = SendEmailLogic.createSingleEmail(currentContact.Id, config, currentSurveyAndTemplateId);
        System.assertNotEquals(null, email, EMAIL_CREATE_ERROR);
    }
    
    @IsTest
    static void testGetMethods(){
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        System.assertNotEquals(null, template, TEMPLATE_ERROR);
        
        List<Survey__c> surveyList = SendEmailLogicHelper.getSurvey();
        System.assertEquals(1, surveyList.size(), AMOUNT_ERROR);
        
        List<Group> groupList = [SELECT Id, Name FROM Group WHERE Name =:TEST_GROUP_NAME];
        List<Id> groupIds = new List<Id>();
        for(Group grItem: groupList){
            groupIds.add(grItem.Id);
        }
        List<GroupMember> groupMembers = SendEmailLogicHelper.getGroupMemeber(groupIds);
        System.assertEquals(1, groupMembers.size(), AMOUNT_ERROR);
        
        List<Id> userByGroupIds = SendEmailLogicHelper.getUserByGroup(groupMembers, groupIds[0]);
        System.assertEquals(1, userByGroupIds.size(), AMOUNT_ERROR);        
        
        List<Campaign> campaignList = [SELECT Id, Name FROM Campaign WHERE Name = :TEST_NAME];
        List<Id> campaignIds = new List<Id>();
        for(Campaign cmItem: campaignList){
            campaignIds.add(cmItem.Id);
        }
        List<CampaignMember> campaignMembers = SendEmailLogicHelper.getCampaignMember(campaignIds);
        System.assertEquals(1, campaignMembers.size(), AMOUNT_ERROR);
        
        List<Id> contactByCampaignIds = SendEmailLogicHelper.getContactByCampaign(campaignMembers, campaignIds[0]);
        System.assertEquals(1, contactByCampaignIds.size(), AMOUNT_ERROR);
        
        List<Id> leadByCampaignIds = SendEmailLogicHelper.getLeadByCampaign(campaignMembers, campaignIds[0]);
        System.assertEquals(1, leadByCampaignIds.size(), AMOUNT_ERROR);
        
        List<Email_Receiver__c> receiverList = [SELECT Id, Type__c, Value__c, Survey__c 
                                                FROM Email_Receiver__c WITH SECURITY_ENFORCED];
        List<Id> currentGroups = SendEmailLogicHelper.getCurrentGroups(receiverList);
        System.assertEquals(1, currentGroups.size(), AMOUNT_ERROR);
        
        List<Id> currentCampaigns = SendEmailLogicHelper.gerCurrentCampaigns(receiverList);
        System.assertEquals(1, currentCampaigns.size(), AMOUNT_ERROR);
    }
    
    @IsTest
    static void testCreateMapMethods(){
        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
        System.assertEquals(1, surveyMap.size(), AMOUNT_ERROR);
    }
}