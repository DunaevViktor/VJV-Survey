public with sharing class SendEmailLogic {
    
    /**
	Запись объекта SurveyEmailConfig__c с необходимыми настройками будет создана в
	"global class PostInstallClass implements InstallHandler"
	в данный момент для тестирования кода можно создать запись (Name = 'Main') вручную через Setup
	доступные поля: Display_Name__c, Subject__c, Template_Name__c, Url_Config__c, Company_Config__c
	*/
    
    public static void sendEmails(List<Email_Receiver__c> emailReceiverList){
        Map<Id, Survey__c> surveyMap = createSurveyMap();
        List<Email_Receiver__c> receiverForProcessing = new List<Email_Receiver__c>();
        
        for(Email_Receiver__c receiver: emailReceiverList){
            Survey__c survey = surveyMap.get(receiver.Survey__c);
            if(survey.IsResending__c == false){
                if(receiver.IsSend__c == false){
                    receiverForProcessing.add(receiver);
                }
            }
            else{
                receiverForProcessing.add(receiver);
            }
        }
        
        List<Messaging.SingleEmailMessage> emailsForSend = createEmailMessages(receiverForProcessing, surveyMap);
        if(emailsForSend.size() > 0){
            Messaging.sendEmail(emailsForSend);
        }
    }
    
    public static List<Messaging.SingleEmailMessage> createEmailMessages(List<Email_Receiver__c> receiverList, Map<Id, Survey__c> surveyMap){
        Organization currentOrg = getOrganization();
        EmailTemplate template = getEmailTemplate();
        Map<String, List<User>> userMap = initializeUserByGroupMap();
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues('Main');
        
        for(Email_Receiver__c receiver: receiverList){
            Survey__c survey = surveyMap.get(receiver.Survey__c);
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            if(receiver.Type__c == 'Email'){
                List<String> toAddresses = new List<String>{receiver.Value__c};
                    mail.setToAddresses(toAddresses);
            }
            else{
                String groupName = receiver.Value__c;
                List<User> userForSend = userMap.get(groupName);
                for(User user: userForSend){
                    mail.setTargetObjectId(user.Id);
                    mail.setSaveAsActivity(false);
                }         
            }
            
            mail.setSenderDisplayName(config.Display_Name__c);
            mail.setSubject(config.Subject__c);
            mail.setBccSender(false);
            mail.setUseSignature(false);
            mail.setPlainTextBody(createEmailBody(template.Body, survey, currentOrg));
            
            emails.add(mail);
            receiver.IsSend__c = true;
        }
        
        if(Schema.sObjectType.Email_Receiver__c.isUpdateable()){
            update receiverList;
        }
        return emails;
    }
    
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
        return [SELECT Id, Name, URL__c, IsResending__c FROM Survey__c WITH SECURITY_ENFORCED];
    }
    
    public static Organization getOrganization(){
        return [SELECT Id, Name FROM Organization WITH SECURITY_ENFORCED LIMIT 1];
    }
    
    public static EmailTemplate getEmailTemplate(){
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues('Main');
        return [SELECT Id, Name, Body FROM EmailTemplate WHERE Name = :config.Template_Name__c WITH SECURITY_ENFORCED LIMIT 1];
    }
}