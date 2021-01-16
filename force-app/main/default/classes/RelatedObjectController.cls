public with sharing class RelatedObjectController {

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
    private static SObject getRelatedObjectIdByRelatedStandardObject(String relatedStandardObjectApiName, Id relatedStandardObjectId) {
        System.debug(relatedStandardObjectId);
        List<SObject> res = Database.query(
          'SELECT Id FROM Related_Object__c ' +
          'WHERE Related_' + relatedStandardObjectApiName + '__c =: relatedStandardObjectId' +
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

}
