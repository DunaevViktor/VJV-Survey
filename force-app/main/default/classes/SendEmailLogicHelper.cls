public with sharing class SendEmailLogicHelper {

    private static final String EMAIL_SETTINGS_NAME = 'Main';
    private static final String REGULAR_TYPE = 'Regular';
    private static final String QUEUE_TYPE = 'Queue';

    public static List<GroupMember> getGroupMemeber(){
        List<Group> groupList = [SELECT Id, Name, Type FROM Group WHERE Type = :REGULAR_TYPE OR Type = :QUEUE_TYPE];
        List<Id> groupId = new List<Id>();
        for(Group groupItem: groupList){
            groupId.add(groupItem.Id);
        }
        List<GroupMember> memberList = [SELECT Id, GroupId, UserOrGroupId
                                        FROM GroupMember WHERE GroupId IN :groupId
                                        WITH SECURITY_ENFORCED];
        return memberList;
    }

    public static List<CampaignMember> getCampaignMember(){
        List<Campaign> campaignList = [SELECT Id, Name FROM Campaign WITH SECURITY_ENFORCED];
        List<Id> campaignId = new List<Id>();
        for(Campaign campaignItem: campaignList){
            campaignId.add(campaignItem.Id);
        }
        List<CampaignMember> membersList = [SELECT Id, ContactId, LeadId, CampaignId 
                                            FROM CampaignMember WHERE CampaignId IN :campaignId
                                            WITH SECURITY_ENFORCED];
        return membersList;
    }

    public static List<Id> getUserByGroup(List<GroupMember> memberList, Id groupId){
        List<Id> userIds = new List<Id>();
        for(GroupMember member: memberList){
            if(member.GroupId == groupId && member.UserOrGroupId != null){
                userIds.add(member.UserOrGroupId);
            }
        }
        return userIds;
    }

    public static List<Id> getContactByCampaign(List<CampaignMember> memberList, Id campaignId){
        List<Id> contactIds = new List<Id>();
        for(CampaignMember member: memberList){
            if(member.CampaignId == campaignId && member.ContactId != null){
                contactIds.add(member.ContactId);
            }
        }
        return contactIds;
    }

    public static List<Id> getLeadByCampaign(List<CampaignMember> memberList, Id campaignId){
        List<Id> leadIds = new List<Id>();
        for(CampaignMember member: memberList){
            if(member.CampaignId == campaignId && member.LeadId != null){
                leadIds.add(member.LeadId);
            }
        }
        return leadIds;
    }

    public static String createEmailBody(String templateBody, Survey__c currentSurvey, Organization currentOrg){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_SETTINGS_NAME);
        String surveyURL = currentSurvey.URL__c;
        String bodyWithUrl =  templateBody.replace(config.Url_Config__c, surveyURL);
        String organizationName = currentOrg.Name;
        return bodyWithUrl.replace(config.Company_Config__c, organizationName);
    }
    
    public static Map<Id, Survey__c> createSurveyMap(){
        List<Survey__c> surveyList = getSurvey();
        Map<Id, Survey__c> surveyMap = new Map<Id, Survey__c>();
        for(Survey__c surveyItem: surveyList){
            surveyMap.put(surveyItem.Id, surveyItem);
        }
        return surveyMap;
    }

    public static List<Survey__c> getSurvey(){
        return [SELECT Id, Name, URL__c FROM Survey__c WITH SECURITY_ENFORCED];
    }
    
    public static Organization getOrganization(){
        return [SELECT Id, Name FROM Organization WITH SECURITY_ENFORCED LIMIT 1];
    }
    
    public static EmailTemplate getEmailTemplate(){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_SETTINGS_NAME);
        return [SELECT Id, Name, Body FROM EmailTemplate WHERE Name = :config.Template_Name__c WITH SECURITY_ENFORCED LIMIT 1];
    }
}