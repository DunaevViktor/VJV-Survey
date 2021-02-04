public with sharing class SendEmailLogic {
    
    private static final String EMAIL_SETTINGS_NAME = 'Main';

    @AuraEnabled(cacheable=true)
    public static void sendEmails(List<Email_Receiver__c> emailReceiverList){
        Map<Id, Survey__c> surveyMap = SendEmailLogicHelper.createSurveyMap();
 
        List<Messaging.SingleEmailMessage> emailsForSend = createEmailMessages(emailReceiverList, surveyMap);
        if(emailsForSend.size() > 0){
            Messaging.sendEmail(emailsForSend);
        }
    }
    
    public static List<Messaging.SingleEmailMessage> createEmailMessages(List<Email_Receiver__c> receiverList, Map<Id, Survey__c> surveyMap){
        Organization currentOrg = SendEmailLogicHelper.getOrganization();
        EmailTemplate template = SendEmailLogicHelper.getEmailTemplate();
        List<CampaignMember> allCampaignMember = SendEmailLogicHelper.getCampaignMember();
        List<GroupMember> allGroupMember = SendEmailLogicHelper.getGroupMemeber();
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        SurveyEmailConfig__c config = SurveyEmailConfig__c.getValues(EMAIL_SETTINGS_NAME);

        for(Email_Receiver__c receiver: receiverList){
            Survey__c survey = surveyMap.get(receiver.Survey__c);
            String body = SendEmailLogicHelper.createEmailBody(template.Body, survey, currentOrg);
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            switch on receiver.Type__c {
                when 'User Group' {
                    Id groupId = receiver.Value__c;
                    List<Id> userForSend = SendEmailLogicHelper.getUserByGroup(allGroupMember, groupId);
                    for(Id userId: userForSend){
                        mail = createSingleEmail(userId, body, config);
                        emails.add(mail);
                    }
                }
                when 'Campaign' {
                    Id campaignId = receiver.Value__c;
                    List<Id> contactForSend = SendEmailLogicHelper.getContactByCampaign(allCampaignMember, campaignId);
                    List<Id> leadForSend = SendEmailLogicHelper.getLeadByCampaign(allCampaignMember, campaignId);

                    for(Id contactId: contactForSend){
                        mail = createSingleEmail(contactId, body, config);
                        emails.add(mail);
                    }

                    for(Id leadId: leadForSend){
                        mail = createSingleEmail(leadId, body, config);
                        emails.add(mail);
                    }
                }
                when 'Record'{
                    mail = createSingleEmail(receiver.Value__c, body, config);
                    emails.add(mail);
                }
            }
        }
        
        return emails;
    }

    public static Messaging.SingleEmailMessage createSingleEmail(Id idForSent, String mailBody, SurveyEmailConfig__c config){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        mail.setTargetObjectId(idForSent);
        mail.setSaveAsActivity(false);
        mail.setSenderDisplayName(config.Display_Name__c);
        mail.setSubject(config.Subject__c);
        mail.setBccSender(false);
        mail.setUseSignature(false);
        mail.setPlainTextBody(mailBody);

        return mail;
    }
}