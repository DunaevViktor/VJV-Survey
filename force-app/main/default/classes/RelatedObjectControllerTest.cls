@isTest
public with sharing class RelatedObjectControllerTest {

    private static final String INVALID_STANDARD_OBJECT_API_NAMES_AMOUNT = 'Invalid standard object api name amount.';
    private static final String INVALID_RELATED_OBJECT_ID_RESULT = 'Invalid related object id result.';

    @TestSetup
    static void createCaseRelatedObject(){
        Case testCase = new Case();
        insert testCase;
        Related_Object__c testCaseRelatedObject = new Related_Object__c(Related_Case__c = testCase.Id);
        insert testCaseRelatedObject;
    }    

    @isTest
    static void testGetStandardObjectApiNames() {
        Set<String> result = RelatedObjectController.getStandardObjectApiNames();
        System.assert(result.size() >= 3, INVALID_STANDARD_OBJECT_API_NAMES_AMOUNT);
    }

    @isTest
    static void testGetRelatedObjectIdByRelatedStandardObject() {
        Id testCaseId = insertCaseRelatedObject();
        SObject result = RelatedObjectController.getRelatedObjectIdByRelatedStandardObject('Case', testCaseId);
        System.assertNotEquals(null, result, INVALID_RELATED_OBJECT_ID_RESULT);
    }

    static Id insertCaseRelatedObject() {
        Case testCase = new Case();
        insert testCase;
        Related_Object__c testCaseRelatedObject = new Related_Object__c(Related_Case__c = testCase.Id);
        insert testCaseRelatedObject;
        return testCase.Id;
    }
}
