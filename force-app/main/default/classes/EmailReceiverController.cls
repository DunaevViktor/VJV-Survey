public with sharing class EmailReceiverController {
    @AuraEnabled(cacheable=true)
    public static Email_Receiver__c getEmailReceiver(){
        return new Email_Receiver__c();
    }
}
