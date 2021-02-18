trigger EmailRecieverTrigger on Email_Receiver__c (after insert) {
  TriggerHandler.updateSurveyUrl(Trigger.New);
}