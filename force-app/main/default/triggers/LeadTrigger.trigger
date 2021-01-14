trigger LeadTrigger on Lead (after update) {
    TriggerHandler.processRecordChanges(Trigger.oldMap, Trigger.New);
}