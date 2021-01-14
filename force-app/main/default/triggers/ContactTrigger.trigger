trigger ContactTrigger on Contact (after update) {
    TriggerHandler.processRecordChanges(Trigger.oldMap, Trigger.New);
}