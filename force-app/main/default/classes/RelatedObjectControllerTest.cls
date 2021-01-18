@isTest
public with sharing class RelatedObjectControllerTest {

    private static final String INVALID_STANDARD_OBJECT_API_NAMES_AMOUNT = 'Invalid standard object api name amount.';
    private static final String INVALID_RELATED_OBJECT_ID_RESULT = 'Invalid related object id result.';
    private static final String INVALID_STANDARD_OBJECT_CHECK_RESULT = 'Invalid standard object record check result.';
    private static final String INVALID_RELATED_OBJECT_CREATION_RESULT = 'Invalid creation of related object by related standard record id.';

    private static final String FIRST_TEST_CASE_SUBJECT = 'Printing Gives Error on Internet Explorer';
    private static final String SECOND_TEST_CASE_SUBJECT = 'Printing Gives Error on Firefox';


    @TestSetup
    static void createCaseRelatedObject(){
        Case testCaseFirst = new Case(Subject = FIRST_TEST_CASE_SUBJECT);
        insert testCaseFirst;
        Related_Object__c testCaseRelatedObject = new Related_Object__c(Related_Case__c = testCaseFirst.Id);
        insert testCaseRelatedObject;

        Case testCaseSecond = new Case(Subject = SECOND_TEST_CASE_SUBJECT);
        insert testCaseSecond; 
    }    

    @isTest
    static void testGetStandardObjectApiNames() {
        Set<String> result = RelatedObjectController.getStandardObjectApiNames();
        System.assert(result.size() >= 3, INVALID_STANDARD_OBJECT_API_NAMES_AMOUNT);
    }

    @isTest
    static void testGetRelatedObjectIdByRelatedStandardObject() {
        Id testCaseId = getFirstTestCaseId();
        System.debug(testCaseId);
        Related_Object__c result = RelatedObjectController.getRelatedObjectIdByRelatedStandardObject('Case', testCaseId);
        System.assertNotEquals(null, result, INVALID_RELATED_OBJECT_ID_RESULT);
    }

    static Id getTestCaseRelatedObjectId() {
        Case testCase = [SELECT Id, Subject
                         FROM Case
                         WHERE Subject =: FIRST_TEST_CASE_SUBJECT];

        Related_Object__c testCaseRelatedObject = [SELECT Id, Related_Case__c
                                                   FROM Related_Object__c
                                                   WHERE Related_Case__c =: testCase.Id];                 

        return testCaseRelatedObject.Id;
    }

    static Id getFirstTestCaseId() {
        Case testCase = [SELECT Id, Subject
                         FROM Case
                         WHERE Subject =: FIRST_TEST_CASE_SUBJECT];
        return testCase.Id;                 
    }

    static Id getSecondTestCaseId() {
        Case testCase = [SELECT Id, Subject
                         FROM Case
                         WHERE Subject =: SECOND_TEST_CASE_SUBJECT];
        return testCase.Id;                 
    }

    @isTest
    static void testFirstCheckStandardObjectRecordExistence() {
        boolean res = RelatedObjectController.isStandardObjectRecordExisting('Case', getFirstTestCaseId());
        System.assertEquals(true, res, INVALID_STANDARD_OBJECT_CHECK_RESULT);
    }

    @isTest
    static void testSecondCheckStandardObjectRecordExistence() {
        boolean res = RelatedObjectController.isStandardObjectRecordExisting('Case', TestUtility.getFakeId('Case'));
        System.assertEquals(false, res, INVALID_STANDARD_OBJECT_CHECK_RESULT);
    }

    @isTest
    static void testPositiveCreateRelatedObjectWithRelatedStandardObjectId() {
        Id relatedObjectId = RelatedObjectController.createRelatedObjectWithRelatedStandardObjectId('Case', getSecondTestCaseId());
        System.assertNotEquals(null, relatedObjectId, INVALID_RELATED_OBJECT_CREATION_RESULT);
    }

    @isTest
    static void testNegativeCreateRelatedObjectWithRelatedStandardObjectId() {
        CustomDatabaseException customException = null;
        try {
            Id relatedObjectId = RelatedObjectController.createRelatedObjectWithRelatedStandardObjectId('Case', TestUtility.getFakeId('Case'));
        } catch(CustomDatabaseException cde) {
            customException = cde;
        }        
        System.assertNotEquals(null, customException, INVALID_RELATED_OBJECT_CREATION_RESULT);
    }

    /*@isTest
    static void createRelatedObjectWithRelatedStandardObjectId() {
        Id 
    }*/
}
