public inherited sharing class RelatedObjectController {

    private static final String RELATED_OBJECT_API_NAME = 'Related_Object__c';

    private static final String RECORD_NOT_FOUND = 'Given standard record doesn\'t exist.';
    private static final String RELATED_OBJECT_IS_NOT_CREATEABLE = 'Related_Object__c is\'t createable.';
    private static final String RELATED_OBJECT_IS_NOT_ACCESSIBLE = 'Related_Object__c is\'t accessible.';
    private static final String GET_RELATED_OBJECT_EXCEPTION = 'GetRelatedObjectException';
    private static final String CREATE_RELATED_OBJECT_EXCEPTION = 'CreateRelatedObjectException';

    @AuraEnabled
    public static Id getRelatedObjectIdByStandardObjectId(Id standardObjectId) { 
        try {

            String standardObjectApiName = getSObjectNameById(String.valueOf(standardObjectId));

            checkStandardObjectRecordExisting(standardObjectApiName, standardObjectId);

            Id relatedObjectId = getRelatedObjectIdByRelatedStandardObject(standardObjectApiName, standardObjectId);
            if(relatedObjectId == null) {
                relatedObjectId = createRelatedObjectWithRelatedStandardObjectId(standardObjectApiName, standardObjectId);
            }
            return relatedObjectId;

        } catch(Exception exc) {
            throw exc;
        }
    }

    @TestVisible
    private static Id getRelatedObjectIdByRelatedStandardObject(String relatedStandardObjectApiName, Id relatedStandardObjectId) {
        Id result;        
        if(!Related_Object__c.SObjectType.getDescribe().isAccessible()) {
            CustomExceptionData excData = new CustomExceptionData(GET_RELATED_OBJECT_EXCEPTION, RELATED_OBJECT_IS_NOT_ACCESSIBLE);
            throw new AuraHandledException(JSON.serialize(excData));
        }
        String namespacePrefix = NamespaceService.namespacePrefix;
        List<Related_Object__c> res = Database.query(
          'SELECT ' + String.escapeSingleQuotes(namespacePrefix) + 'Id FROM ' + String.escapeSingleQuotes(namespacePrefix) + RELATED_OBJECT_API_NAME +
          ' WHERE ' + String.escapeSingleQuotes(namespacePrefix) + 'Related_' + String.escapeSingleQuotes(relatedStandardObjectApiName) + '__c =: relatedStandardObjectId' +
          ' WITH SECURITY_ENFORCED LIMIT 1'
        );
        if(res != null && res.size() > 0) {
            result = res[0].Id;
        } else {
            result = null;
        }

        return result;
    }

    @TestVisible
    private static Id createRelatedObjectWithRelatedStandardObjectId(String standardObjectApiName, Id relatedObjectId) {
        if(!Related_Object__c.SObjectType.getDescribe().isCreateable() || !Schema.SObjectType.Related_Object__c.fields.Related_Case__c.isAccessible()
        || !Schema.SObjectType.Related_Object__c.fields.Related_Contact__c.isAccessible() || !Schema.SObjectType.Related_Object__c.fields.Related_Lead__c.isAccessible()) {
            CustomExceptionData excData = new CustomExceptionData(CREATE_RELATED_OBJECT_EXCEPTION, RELATED_OBJECT_IS_NOT_CREATEABLE);
            throw new AuraHandledException(JSON.serialize(excData));
        }
        Related_Object__c relatedObjectToInsert = new Related_Object__c();
        String namespacePrefix = NamespaceService.namespacePrefix;
        relatedObjectToInsert.put(namespacePrefix + 'Related_' + standardObjectApiName + '__c', relatedObjectId + '');
        insert relatedObjectToInsert;
        return relatedObjectToInsert.Id;
    }

    @TestVisible
    private static boolean checkStandardObjectRecordExisting(String standardObjectApiName, Id recordId) { 
        boolean objectExists = false;
        if(!Related_Object__c.SObjectType.getDescribe().isAccessible()) {
            CustomExceptionData excData = new CustomExceptionData(GET_RELATED_OBJECT_EXCEPTION, RELATED_OBJECT_IS_NOT_ACCESSIBLE);
            throw new AuraHandledException(JSON.serialize(excData));
        }
        List<SObject> res = Database.query(
            'SELECT Id FROM ' + String.escapeSingleQuotes(standardObjectApiName) +
            ' WHERE Id =: recordId' +
            ' WITH SECURITY_ENFORCED LIMIT 1'
        );
        if(res != null && res.size() > 0) {
            objectExists = true;
        } else {
            CustomExceptionData excData = new CustomExceptionData(GET_RELATED_OBJECT_EXCEPTION, RECORD_NOT_FOUND);
            throw new AuraHandledException(JSON.serialize(excData));
        }
        return objectExists;
    }

    @TestVisible
    private static String getSObjectNameById(String recordId){
        String objectApiName;
        String keyCode = recordId.subString(0,3);

        Map<String, Schema.SObjectType> sObjectDescribe = Schema.getGlobalDescribe();
        for(Schema.SObjectType objectInstance : sObjectDescribe.values()){
            if(objectInstance.getDescribe().getKeyPrefix() == keyCode){
                objectApiName = objectInstance.getDescribe().getName();
            }
        }

        return objectApiName;
    }
}