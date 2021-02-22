public with sharing class TriggerHandler {

    private static final Set<String> OBJECT_NAMES = new Set<String>{'Case', 'Lead', 'Contact'};
    private static final String LINKED_RECORD_PARAMETER_NAME = 'c__linkedRecordId';

    public static List<ChangedFieldWrapper> getChangedFields(Map<Id,SObject> oldRecords, List<SObject> newRecords){
        List<ChangedFieldWrapper> changedRecordsFields = new List<ChangedFieldWrapper>();
        
        String sObjectName = newRecords[0].getSObjectType().getDescribe().getName();
        Map<String,Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
        
        for(SObject newRecord: newRecords){
            ChangedFieldWrapper changedField;
            SObject oldRecord = oldRecords.get(newRecord.Id);
            
            for(String fieldName: fieldMap.keyset()){
                if(newRecord.get(fieldName) != oldRecord.get(fieldName)){
                    Schema.DisplayType fieldType = fieldMap.get(fieldName).getDescribe().getType();
                    changedField = new ChangedFieldWrapper(fieldName, fieldType, newRecord);
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

    public static void updateSurveyUrl(List<Email_Receiver__c> newRecievers) {
        List<Email_Receiver__c> recieversCopy = [SELECT Id, Value__c, Survey_URL__c
                                                 FROM Email_Receiver__c
                                                 WHERE Id IN :newRecievers
                                                 WITH SECURITY_ENFORCED];
        for (Email_Receiver__c receiver : recieversCopy) {
          Id sObjectId = receiver.Value__c;
          String sObjectName = sObjectId.getSObjectType().getDescribe().getName();
          if (OBJECT_NAMES.contains(sObjectName)) {
            receiver.Survey_URL__c += '&' + LINKED_RECORD_PARAMETER_NAME + '=' + receiver.Value__c;
          }
        }
        
        if (Schema.sObjectType.Email_Receiver__c.fields.Survey_URL__c.isUpdateable()) {
          update recieversCopy;
        }
    }
}