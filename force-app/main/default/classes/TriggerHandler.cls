public with sharing class TriggerHandler {
    public static List<ChangedFieldWrapper> getChangedFields(Map<Id,SObject> oldRecords, List<SObject> newRecords){
        List<ChangedFieldWrapper> changedRecordsFields = new List<ChangedFieldWrapper>();
        
        String sObjectName = newRecords[0].getSObjectType().getDescribe().getName();
        Map<String,Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
        
        for(SObject newRecord: newRecords){
            ChangedFieldWrapper changedField;
            SObject oldRecord = oldRecords.get(newRecord.Id);
            
            for(String fieldName: fieldMap.keyset()){
                if(newRecord.get(fieldName) != oldRecord.get(fieldName)){
                    String fieldType = fieldMap.get(fieldName).getDescribe().getType().name();
                    changedField = new ChangedFieldWrapper(fieldName, newRecord.get(fieldName), fieldType);
                    changedRecordsFields.add(changedField);
                }
            }
        }
        
        return changedRecordsFields;
    }
    
    public static void processRecordChanges (Map<Id,SObject> oldRecords, List<SObject> newRecords){
        String sObjectName = newRecords[0].getSObjectType().getDescribe().getName();
        List<ChangedFieldWrapper> changedRecordsFields = getChangedFields(oldRecords, newRecords);
        
        if(changedRecordsFields.size() > 0){
            TriggerRulesHandler.checkRuleCriterias(sObjectName, changedRecordsFields);
        }
    }
}