@isTest
public with sharing class MetadataFetcherTest {

  private static final String TRIGGER_RULE_OBJECT_API_NAME = 'Trigger_Rule__c';
  private static final String OBJECT_API_NAME_FIELD = 'Object_Api_Name__c';
  private static final String CASE_OBJECT_API_NAME  = 'Case';
  private static final String CONTACT_OBJECT_API_NAME  = 'Contact';
  private static final String NON_EXISTENT_FIELD = 'Test__c';
  private static final String NON_EXISTENT_OBJECT_API_NAME  = 'Undefined';
  private static final String NAME_FIELD = 'Name';


  private static final String INVALID_OBJECT_API_NAMES_AMOUNT = 'Actual length of object api names is less than expected.';
  private static final String INVALID_OBJECT_FIELD_AMOUNT = 'Actual amount of object fields is less than expected.';
  private static final String INVALID_OBJECT_FIELD_DESCRIPTION_RESULT = 'Invalid object field description result.';
  private static final String INVALID_PICKLIST_OPTIONS_AMOUNT = 'Invalid picklist options amount.';


  @isTest
  static void getPicklistValuesPositiveTest() {
    Map<String, String> result = MetadataFetcher.getPicklistValues(TRIGGER_RULE_OBJECT_API_NAME, OBJECT_API_NAME_FIELD);
    System.assert(result.size() >= 3, INVALID_OBJECT_API_NAMES_AMOUNT);
  }

  @isTest
  static void getPicklistValuesFirstNegativeTest() {
    Map<String, String> result = MetadataFetcher.getPicklistValues(CASE_OBJECT_API_NAME, NON_EXISTENT_FIELD);
    System.assertEquals(0, result.size(), INVALID_PICKLIST_OPTIONS_AMOUNT);
  }

  @isTest
  static void getPicklistValuesSecondNegativeTest() {
    Map<String, String> result = MetadataFetcher.getPicklistValues(NON_EXISTENT_OBJECT_API_NAME, NAME_FIELD);
    System.assertEquals(0, result.size(), INVALID_PICKLIST_OPTIONS_AMOUNT);
  }

  @isTest
  static void getObjectFieldsDescriptionListPositiveTest() {
    List<List<String>> result = MetadataFetcher.getObjectFieldsDescriptionList(CONTACT_OBJECT_API_NAME);
    System.assert(result.size() >= 29, INVALID_OBJECT_FIELD_AMOUNT);
  }

  @isTest
  static void getObjectFieldsDescriptionListNegativeTest() {
    List<List<String>> result = MetadataFetcher.getObjectFieldsDescriptionList(NON_EXISTENT_OBJECT_API_NAME);
    System.assertEquals(0, result.size(), INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
  } 
  
}
