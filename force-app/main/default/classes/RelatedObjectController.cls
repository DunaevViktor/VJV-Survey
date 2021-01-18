public with sharing class RelatedObjectController {

    private static final String RECORD_NOT_FOUND = 'Given standard record doesn\'t exist.';
    private static final String RELATED_OBJECT_IS_NOT_CREATEABLE = 'Related_Object__c is\'t createable.';

    /*public static Id getRelatedObjectIdByStandardObjectId(Id standardObjectId) {
        if(!getRelatedObjectId(standardObjectId)) {
            //insert
        }
    }*/

    /*private static Id getRelatedObjectId(Id standardObjectId) {

        Set<String> standardObjectApiNames = getStandardObjectApiNames();

        for(String objectApiName : standardObjectApiNames) {

        }

        //check in Case records
        Related_Object__c caseRelatedObjectFindResult = [SELECT Id
                                                         FROM Related_Object__c
                                                         WHERE Related_Case__c =: standardObjectId];
    }*/

    @TestVisible
    private static Related_Object__c getRelatedObjectIdByRelatedStandardObject(String relatedStandardObjectApiName, Id relatedStandardObjectId) {
        
        List<Related_Object__c> res = Database.query(
          'SELECT Id FROM Related_Object__c' +
          ' WHERE Related_' + String.escapeSingleQuotes(relatedStandardObjectApiName) + '__c =: relatedStandardObjectId' +
          ' WITH SECURITY_ENFORCED LIMIT 1'
        );
        if(res != null && res.size() > 0) {
            return res[0];
        }
        return null;
    }

    @TestVisible
    private static Set<String> getStandardObjectApiNames() {
        Map<String, String> standardObjectApiNames = MetadataFetcher.getPicklistValues('Trigger_Rule__c', 'Object_Api_Name__c');
        return standardObjectApiNames.keySet();
    }


    @TestVisible
    private static Id createRelatedObjectWithRelatedStandardObjectId(String standardObjectApiName, Id relatedObjectId) {
        if(!Related_Object__c.sObjectType.getDescribe().isCreateable()) {
            throw new CustomDatabaseException(RELATED_OBJECT_IS_NOT_CREATEABLE);
        }
        if(!isStandardObjectRecordExisting(standardObjectApiName, relatedObjectId)) {
            throw new CustomDatabaseException(RECORD_NOT_FOUND);
        }   
        Related_Object__c relatedObjectToInsert = new Related_Object__c();
        relatedObjectToInsert.put('Related_' + standardObjectApiName + '__c', relatedObjectId + '');
        insert relatedObjectToInsert;
        return relatedObjectToInsert.Id;
    }

    @TestVisible
    private static boolean isStandardObjectRecordExisting(String standardObjectApiName, Id recordId) { 
        boolean objectExists = false;
        List<SObject> res = Database.query(
            'SELECT Id FROM ' + String.escapeSingleQuotes(standardObjectApiName) +
            ' WHERE Id =: recordId' +
            ' WITH SECURITY_ENFORCED LIMIT 1'
        );
        if(res != null && res.size() > 0) {
            objectExists = true;
        }
        return objectExists;
    }
}
