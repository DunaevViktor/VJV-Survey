@isTest
public with sharing class RelatedObjectControllerTest {

    private static final String INVALID_RELATED_OBJECT_RESULT = 'Actual related object must not be null.';

    @testSetup
    static void setup() {
        Contact testContact = new Contact(LastName = 'Happy Contact');
        insert testContact;

        Lead testLead = new Lead(LastName = 'Happy Lead', Company = 'Test Company');
        insert testLead;

        Case testCase = new Case();
        insert testCase;  

        Related_Object__c relatedCaseObject = new Related_Object__c(Related_Case__c = testCase.Id);
        insert relatedCaseObject;
    }

    @isTest
    public static void getRelatedObjectIdPositiveTest() {
        Id result = RelatedObjectController.getRelatedObjectId('Case');
        System.assertNotEquals(null, result, INVALID_RELATED_OBJECT_RESULT);
    }
}
