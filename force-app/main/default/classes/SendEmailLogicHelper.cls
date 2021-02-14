public with sharing class SendEmailLogicHelper {

    private static final String EMAIL_SETTINGS_NAME = 'Main';
    private static final String USER_GROUP = 'User Group';
    private static final String CAMPAIGN = 'Campaign';

    public static List<GroupMember> getGroupMemeber(List<Id> currentGroups){
        List<GroupMember> memberList = new List<GroupMember>();

        if(currentGroups.size() == 0) { return memberList; }

        List<Group> groupList = [SELECT Id, Name, Type 
                                 FROM Group 
                                 WHERE Id IN :currentGroups 
                                 WITH SECURITY_ENFORCED
                                 LIMIT 50000];
        List<Id> groupId = new List<Id>();
        for(Group groupItem: groupList){
            groupId.add(groupItem.Id);
        }
        memberList = [SELECT Id, GroupId, UserOrGroupId 
                      FROM GroupMember 
                      WHERE GroupId IN :groupId 
                      WITH SECURITY_ENFORCED
                      LIMIT 50000];

        return memberList;
    }

    public static List<CampaignMember> getCampaignMember(List<Id> currentCampaigns){
        List<CampaignMember> membersList = new List<CampaignMember>();

        if(currentCampaigns.size() == 0) { return membersList; }

        List<Campaign> campaignList = [SELECT Id, Name 
                                       FROM Campaign 
                                       WHERE Id IN :currentCampaigns 
                                       WITH SECURITY_ENFORCED
                                       LIMIT 50000];
        List<Id> campaignId = new List<Id>();
        for(Campaign campaignItem: campaignList){
            campaignId.add(campaignItem.Id);
        }
        membersList = [SELECT Id, ContactId, LeadId, CampaignId 
                       FROM CampaignMember
                       WHERE CampaignId IN :campaignId 
                       WITH SECURITY_ENFORCED
                       LIMIT 50000];
        
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
 
    public static Map<Id, Survey__c> createSurveyMap(){
        List<Survey__c> surveyList = getSurvey();
        Map<Id, Survey__c> surveyMap = new Map<Id, Survey__c>();
        for(Survey__c surveyItem: surveyList){
            surveyMap.put(surveyItem.Id, surveyItem);
        }
        return surveyMap;
    }

    public static List<Id> getCurrentGroups(List<Email_Receiver__c> receiverList){
        List<Id> allCurrentGroup = new List<Id>();
        for(Email_Receiver__c receiverItem: receiverList){
            if(receiverItem.Type__c == USER_GROUP){
                allCurrentGroup.add(receiverItem.Value__c);
            }
        }
        return allCurrentGroup;
    }

    public static List<Id> gerCurrentCampaigns(List<Email_Receiver__c> receiverList){
        List<Id> allCurrentCampaign = new List<Id>();
        for(Email_Receiver__c receiverItem: receiverList){
            if(receiverItem.Type__c == CAMPAIGN){
                allCurrentCampaign.add(receiverItem.Value__c);
            }
        }
        return allCurrentCampaign;
    }

    public static List<Survey__c> getSurvey(){
        return [SELECT Id, Name, URL__c 
                FROM Survey__c 
                WITH SECURITY_ENFORCED
                LIMIT 50000];
    }
    
    public static EmailTemplate getEmailTemplate(){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_SETTINGS_NAME);
        return [SELECT Id, Name, HtmlValue 
                FROM EmailTemplate 
                WHERE Name = :config.Template_Name__c 
                WITH SECURITY_ENFORCED 
                LIMIT 1];
    }
}