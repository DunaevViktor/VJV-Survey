trigger CaseTrigger on Case (after update) {
    TriggerHandler.processRecordChanges(Trigger.oldMap, Trigger.New);
}