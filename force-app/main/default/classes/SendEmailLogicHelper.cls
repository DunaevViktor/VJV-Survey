public with sharing class SendEmailLogicHelper {

    public static Map<String, List<User>> initializeUserByGroupMap(){
        List<User> userList = getUser();
        List<GroupMember> memberGroup = getGroupMember();
        Map<Id, Group> groupMap = createGroupMap();
        Map<String, List<User>> userMap = createUserByGroupMap();
        
        for(User user: userList){
            for(GroupMember member: memberGroup){
                if(user.Id == member.UserOrGroupId){
                    Group currentGroup = groupMap.get(member.GroupId);
                    List<User> listForUpdate = userMap.get(currentGroup.Name);
                    listForUpdate.add(user);
                    userMap.put(currentGroup.Name, listForUpdate);
                }
            }
        }
        return userMap;
    }

    public static Map<String, List<Id>> initializeContactByCampaignMap(){
        List<Contact> contactList = getContact();
        List<CampaignMember> memberCampaign = getCampaignMember();
        Map<Id, Campaign> campaignMap = createCampaignMap();
        Map<String, List<Id>> contactMap = createContactByCampaignMap();

        for(Contact contact: contactList){
            for(CampaignMember member: memberCampaign){
                if(contact.Id == member.ContactId){
                    Campaign currentCampaign = campaignMap.get(member.CampaignId);
                    List<Id> listForUpdate = contactMap.get(currentCampaign.Name);
                    listForUpdate.add(contact.Id);
                    contactMap.put(currentCampaign.Name, listForUpdate);
                }
            }
        }
        return contactMap;
    }

    public static Map<String, List<Id>> initializeLeadByCampaignMap(){
        List<Lead> leadList = getLead();
        List<CampaignMember> memberCampaign = getCampaignMember();
        Map<Id, Campaign> campaignMap = createCampaignMap();
        Map<String, List<Id>> leadMap = createLeadByCampaignMap();

        for(Lead lead: leadList){
            for(CampaignMember member: memberCampaign){
                if(lead.Id == member.LeadId){
                    Campaign currentCampaign = campaignMap.get(member.CampaignId);
                    List<Id> listForUpdate = leadMap.get(currentCampaign.Name);
                    listForUpdate.add(lead.Id);
                    leadMap.put(currentCampaign.Name, listForUpdate);
                }
            }
        }
        return leadMap;
    }
    
    public static String createEmailBody(String templateBody, Survey__c currentSurvey, Organization currentOrg){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues('Main');
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

    public static Map<Id, Campaign> createCampaignMap(){
        List<Campaign> campaignList = getCampaign();
        Map<Id, Campaign> campaignMap = new Map<Id, Campaign>();
        for(Campaign campItem: campaignList){
            campaignMap.put(campItem.Id, campItem);
        }
        return campaignMap;
    }
    
    public static Map<Id, Group> createGroupMap(){
        List<Group> groupList = getGroup();
        Map<Id, Group> groupMap = new Map<Id, Group>();
        for(Group groupItem: groupList){
            groupMap.put(groupItem.Id, groupItem);
        }
        return groupMap;
    }
    
    public static Map<String, List<User>> createUserByGroupMap(){
        List<Group> groupList = getGroup();
        Map<String, List<User>> userMap = new Map<String, List<User>>();
        for(Group groupItem: groupList){
            userMap.put(groupItem.Name, new List<User>());
        }
        return userMap;
    }

    public static Map<String, List<Id>> createContactByCampaignMap(){
        List<Campaign> campaignList = getCampaign();
        Map<String, List<Id>> contactMap = new Map<String, List<Id>>();
        for(Campaign campItem: campaignList){
            contactMap.put(campItem.Name, new List<Id>());
        }
        return contactMap;
    }

    public static Map<String, List<Id>> createLeadByCampaignMap(){
        List<Campaign> campaignList = getCampaign();
        Map<String, List<Id>> leadMap = new Map<String, List<Id>>();
        for(Campaign campItem: campaignList){
            leadMap.put(campItem.Name, new List<Id>());
        }
        return leadMap;
    }

    public static List<Campaign> getCampaign(){
        return [SELECT Id, Name FROM Campaign WITH SECURITY_ENFORCED];
    }

    public static List<CampaignMember> getCampaignMember(){
        return [SELECT Id, ContactId, LeadId, CampaignId FROM CampaignMember WITH SECURITY_ENFORCED];
    }
    
    public static List<Contact> getContact(){
        return [SELECT Id, Name FROM Contact WITH SECURITY_ENFORCED];
    }

    public static List<Lead> getLead(){
        return [SELECT Id, Name FROM Lead WITH SECURITY_ENFORCED];
    }

    public static List<Group> getGroup(){
        return [SELECT Id, Name FROM Group WITH SECURITY_ENFORCED];
    }
    
    public static List<User> getUser(){
        return [SELECT Id, Name, Email FROM User WITH SECURITY_ENFORCED];
    }
    
    public static List<GroupMember> getGroupMember(){
        return [SELECT Id, GroupId, UserOrGroupId FROM GroupMember WITH SECURITY_ENFORCED];
    }
    
    public static List<Survey__c> getSurvey(){
        return [SELECT Id, Name, URL__c FROM Survey__c WITH SECURITY_ENFORCED];
    }
    
    public static Organization getOrganization(){
        return [SELECT Id, Name FROM Organization WITH SECURITY_ENFORCED LIMIT 1];
    }
    
    public static EmailTemplate getEmailTemplate(){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues('Main');
        return [SELECT Id, Name, Body FROM EmailTemplate WHERE Name = :config.Template_Name__c WITH SECURITY_ENFORCED LIMIT 1];
    }
}