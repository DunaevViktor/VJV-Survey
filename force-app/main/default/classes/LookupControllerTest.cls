@isTest
public with sharing class LookupControllerTest {

  private static final String INVALID_FOUND_RECORDS_AMOUNT = 'Actual length of result records list isn\'t equal to expected.';

  @testSetup
  static void setup() {
    Contact testContact = new Contact(LastName = 'Happy Contact');
    insert testContact;

    Lead testLead = new Lead(LastName = 'Happy Lead', Company = 'Test Company');
    insert testLead;

    Case testCase = new Case();
    insert testCase;
  }

  @isTest
  static void testPositiveFindExsistingRecords() {
    List<String> objectApiNames = new List<String>();
    objectApiNames.add('Contact');
    objectApiNames.add('Lead');
    List<SObject> result = LookupController.findRecords('Happy', objectApiNames);
    System.assertEquals(2, result.size(), INVALID_FOUND_RECORDS_AMOUNT);
  }

  @isTest
  static void testPositiveFindMissingRecords() {
    List<String> objectApiNames = new List<String>();
    objectApiNames.add('Contact');
    objectApiNames.add('Lead');
    List<SObject> res = LookupController.findRecords('Harry', objectApiNames);
    System.assertEquals(0, res.size(), INVALID_FOUND_RECORDS_AMOUNT);
  }

  @isTest
  static void testNegativeFindRecordsMissingObjectName() {
    List<String> objectApiNames = new List<String>();
    objectApiNames.add('Test');
    List<SObject> res = LookupController.findRecords('Happy', objectApiNames);
    System.assertEquals(0, res.size(), INVALID_FOUND_RECORDS_AMOUNT);
  }

  @isTest
  static void testNegativeFindRecordsMissingFieldName() {
    List<String> objectApiNames = new List<String>();
    objectApiNames.add('Case');
    List<SObject> res = LookupController.findRecords('Happy', objectApiNames);
    System.assertEquals(0, res.size(), INVALID_FOUND_RECORDS_AMOUNT);
  }
}