public with sharing class SendEmailLogic {
    
    private static final String EMAIL_SETTINGS_NAME = 'Main';

    @AuraEnabled(cacheable=true)
    public static void sendEmails(List<Email_Receiver__c> emailReceiverList){
        List<Messaging.SingleEmailMessage> emailsForSend = createEmailMessages(emailReceiverList);
        if(emailsForSend.size() > 0){
            Messaging.sendEmail(emailsForSend);
        }
    }
    
    public static List<Messaging.SingleEmailMessage> createEmailMessages(List<Email_Receiver__c> receiverList){
        List<Id> allCurrentGroup = SendEmailLogicHelper.getCurrentGroups(receiverList);
        List<Id> allCurrentCampaign = SendEmailLogicHelper.gerCurrentCampaigns(receiverList);
        List<GroupMember> currentGroupMember = SendEmailLogicHelper.getGroupMemeber(allCurrentGroup);
        List<CampaignMember> currentCampaignMember = SendEmailLogicHelper.getCampaignMember(allCurrentCampaign);
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_SETTINGS_NAME);
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        
        for(Email_Receiver__c receiver: receiverList){
            List<Id> currentSurveyAndTemplateId = new List<Id>{receiver.Id, template.Id};
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            switch on receiver.Type__c {
                when 'User Group' {
                    Id groupId = receiver.Value__c;
                    List<Id> userForSend = SendEmailLogicHelper.getUserByGroup(currentGroupMember, groupId);
                    for(Id userId: userForSend){
                        mail = createSingleEmail(userId, config, currentSurveyAndTemplateId);
                        emails.add(mail);
                    }
                }
                when 'Campaign' {
                    Id campaignId = receiver.Value__c;
                    List<Id> contactForSend = SendEmailLogicHelper.getContactByCampaign(currentCampaignMember, campaignId);
                    List<Id> leadForSend = SendEmailLogicHelper.getLeadByCampaign(currentCampaignMember, campaignId);

                    for(Id contactId: contactForSend){
                        mail = createSingleEmail(contactId, config, currentSurveyAndTemplateId);
                        emails.add(mail);
                    }

                    for(Id leadId: leadForSend){
                        mail = createSingleEmail(leadId, config, currentSurveyAndTemplateId);
                        emails.add(mail);
                    }
                }
                when 'Record'{
                    mail = createSingleEmail(receiver.Value__c, config, currentSurveyAndTemplateId);
                    emails.add(mail);
                }
            }
        }
        
        return emails;
    }

    public static Messaging.SingleEmailMessage createSingleEmail(Id idForSent, SurveyEmailConfig__c config, List<Id> idsList){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail = Messaging.renderStoredEmailTemplate(idsList[1], idForSent, idsList[0]);
        mail.setTargetObjectId(idForSent);
        mail.setSenderDisplayName(config.Display_Name__c);
        mail.setBccSender(false);
        mail.setUseSignature(false);
        mail.setSaveAsActivity(false);

        return mail;
    }
}