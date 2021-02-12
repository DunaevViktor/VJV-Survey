@isTest
public with sharing class RelatedObjectControllerTest {
    
    private static final String INVALID_STANDARD_OBJECT_API_NAMES_AMOUNT = 'Invalid standard object api name amount.';
    private static final String INVALID_RELATED_OBJECT_ID_RESULT = 'Invalid related object id result.';
    private static final String INVALID_STANDARD_OBJECT_CHECK_RESULT = 'Invalid standard object record check result.';
    private static final String INVALID_RELATED_OBJECT_CREATION_RESULT = 'Invalid creation of related object by related standard record id.';
    
    private static final String FIRST_TEST_CASE_SUBJECT = 'Printing Gives Error on Internet Explorer';
    private static final String SECOND_TEST_CASE_SUBJECT = 'Printing Gives Error on Firefox';
    
    
    @TestSetup
    static void makeData(){
        Case testCaseFirst = new Case(Subject = FIRST_TEST_CASE_SUBJECT);
        insert testCaseFirst;
        
        Related_Object__c testCaseRelatedObject = new Related_Object__c(Related_Case__c = testCaseFirst.Id);
        insert testCaseRelatedObject;
        
        Case testCaseSecond = new Case(Subject = SECOND_TEST_CASE_SUBJECT);
        insert testCaseSecond; 
        
        Profile profile = TestDataFactory.getStandardProfile();
        User testUser = TestDataFactory.createStandardUser(profile);
        testUser.LastName = TestDataFactory.TEST_VALUE;
        insert testUser; 
    }  
    
    private static User getTestUser() {
        User testUser = [SELECT Id FROM User WHERE LastName = :TestDataFactory.TEST_VALUE LIMIT 1];
        return testUser;
    }
    
    private static Id getTestCaseRelatedObjectId() {
        Case testCase = [SELECT Id, Subject FROM Case WHERE Subject =: FIRST_TEST_CASE_SUBJECT];
        Related_Object__c testCaseRelatedObject = [SELECT Id, Related_Case__c FROM Related_Object__c WHERE Related_Case__c =: testCase.Id];                 
        return testCaseRelatedObject.Id;
    }
    
    private static Id getFirstTestCaseId() {
        Case testCase = [SELECT Id, Subject FROM Case WHERE Subject =: FIRST_TEST_CASE_SUBJECT];
        return testCase.Id;                 
    }
    
    private static Id getSecondTestCaseId() {
        Case testCase = [SELECT Id, Subject FROM Case WHERE Subject =: SECOND_TEST_CASE_SUBJECT];
        return testCase.Id;                 
    }
    
    @isTest
    static void testFirstGetRelatedObjectIdByRelatedStandardObject() {
        Id testCaseId = getFirstTestCaseId();
        Id result = RelatedObjectController.getRelatedObjectIdByRelatedStandardObject('Case', testCaseId);
        System.assertNotEquals(null, result, INVALID_RELATED_OBJECT_ID_RESULT);
    }
    
    @isTest
    static void testPositiveCreateRelatedObjectWithRelatedStandardObjectId() {
        Id relatedObjectId = RelatedObjectController.createRelatedObjectWithRelatedStandardObjectId('Case', getSecondTestCaseId());
        System.assertNotEquals(null, relatedObjectId, INVALID_RELATED_OBJECT_CREATION_RESULT);
    }
    
    @isTest
    static void testNegativeCreateRelatedObjectWithRelatedStandardObjectId() {
        User testUser = getTestUser();
        Id secondTestCaseId = getSecondTestCaseId();
        AuraHandledException auraExc = null;
        System.runAs(testUser) { 
            try {
                Id res = RelatedObjectController.createRelatedObjectWithRelatedStandardObjectId('Case', secondTestCaseId);
            } catch(AuraHandledException exc) {
                auraExc = exc;
            }
            System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
        } 
    }
    
    @isTest
    static void testNegativeGetRelatedObjectWithRelatedStandardObjectId() {
        User testUser = getTestUser();
        Id secondTestCaseId = getSecondTestCaseId();
        AuraHandledException auraExc = null;
        System.runAs(testUser) { 
            try {
                Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(secondTestCaseId);
            } catch(AuraHandledException exc) {
                auraExc = exc;
            }
            System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
        } 
    }
    
    @isTest
    static void testFirstPositiveGetRelatedObjectIdByStandardObjectId() {
        Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(getFirstTestCaseId());
        System.assertNotEquals(null, res, INVALID_RELATED_OBJECT_ID_RESULT);
    }
    
    @isTest
    static void testFirstNegativeGetRelatedObjectIdByStandardObjectId() {
        User testUser = getTestUser();
        Id secondTestCaseId = getSecondTestCaseId();
        Exception auraExc = null;
        System.runAs(testUser) { 
            try {
                Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(secondTestCaseId);
            } catch(Exception exc) {
                auraExc = exc;
            }
            System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
        }               
    }
    
    @isTest
    static void testGetRelatedObjectIdByStandardObjectId() {
        User testUser = getTestUser();
        Id secondTestCaseId = getSecondTestCaseId();
        Exception auraExc = null;
        System.runAs(testUser) { 
            try {
                Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(TestDataFactory.getFakeId('Case'));
            } catch(Exception exc) {
                auraExc = exc;
            }
            System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
        }               
    }
    
    @isTest
    static void testFirstNegativeGetRelatedObjectIdByRelatedStandardObject() {
        User testUser = getTestUser();
        Id secondTestCaseId = getSecondTestCaseId();
        Exception auraExc = null;
        System.runAs(testUser) { 
            try {
                Id res = RelatedObjectController.getRelatedObjectIdByRelatedStandardObject('Case', secondTestCaseId);
            } catch(Exception exc) {
                auraExc = exc;
            }
            System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
        }
    }
    
    @isTest
    static void testSecondNegativeGetRelatedObjectIdByStandardObjectId() {
        AuraHandledException auraExc = null;
        try {
            Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(TestDataFactory.getFakeId('Case'));
        } catch(AuraHandledException exc) {
            auraExc = exc;
        }
        System.assertNotEquals(null, auraExc, INVALID_RELATED_OBJECT_ID_RESULT);
    } 
    
    @isTest
    static void testPositiveGetRelatedObjectIdByStandardObjectId() {
        Id res = RelatedObjectController.getRelatedObjectIdByStandardObjectId(getSecondTestCaseId());
        System.assertNotEquals(null, res, INVALID_RELATED_OBJECT_ID_RESULT);
    } 
}