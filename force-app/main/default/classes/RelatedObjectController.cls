public with sharing class RelatedObjectController {

    public static void getRelatedObject(String objectName) {

        
    }

    /* private static Id createRelatedObject() {

    } */

    @TestVisible
    private static Id getRelatedObjectId(String objectName) {
        List<sObject> result = Database.query('SELECT Id, Related_' + objectName + '__c' +
        ' FROM Related_Object__c ' + 
        'WHERE Related_' + objectName + '__c' + ' != null' + 
        ' WITH SECURITY_ENFORCED'
        );        
        if(result.size() == 0) {
            return null;
        }
        return result[0].Id;
    }
}
