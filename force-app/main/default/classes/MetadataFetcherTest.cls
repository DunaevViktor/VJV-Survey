@isTest
public with sharing class MetadataFetcherTest {
  private static final String INVALID_OBJECT_API_NAMES_AMOUNT = 'Actual length of object api names is less than expected.';
  private static final String INVALID_OPERATORS_AMOUNT = 'Actual length of operators is less than expected.';
  private static final String INVALID_OBJECT_FIELD_AMOUNT = 'Actual amount of object fields is less than expected.';
  private static final String INVALID_OBJECT_FIELD_DESCRIPTION_RESULT = 'Invalid object field description result.';
  private static final String INVALID_PICKLIST_OPTIONS_AMOUNT = 'Invalid picklist options amount.';
  private static final String INVALID_PICKLIST_OPTIONS = 'Invalid retrieved picklist options.';

  @isTest
  static void getObjectApiNamePickListValuesTest() {
    Map<String, String> result = MetadataFetcher.getObjectApiNamePickListValues();
    System.assert(result.size() >= 3, INVALID_OBJECT_API_NAMES_AMOUNT);
  }

  @isTest
  static void getTriggerRuleOperatorPickListValuesTest() {
    Map<String, String> result = MetadataFetcher.getTriggerRuleOperatorPickListValues();
    System.assert(result.size() > 0, INVALID_OPERATORS_AMOUNT);
  }

  @isTest
  static void getObjectFieldsDescriptionListPositiveTest() {
    List<List<String>> result = MetadataFetcher.getObjectFieldsDescriptionList(
      'Contact'
    );
    System.assert(result.size() >= 29, INVALID_OBJECT_FIELD_AMOUNT);
  }

  @isTest
  static void getObjectFieldsDescriptionListNegativeTest() {
    Exception expectedException;
    try {
      List<List<String>> result = MetadataFetcher.getObjectFieldsDescriptionList(
        'Test'
      );
    } catch (NullPointerException npe) {
      expectedException = npe;
    }
    System.assertNotEquals(
      null,
      expectedException,
      INVALID_OBJECT_FIELD_DESCRIPTION_RESULT
    );
  }

  @isTest
  static void getFieldPicklistValuesPositiveTest() {
    Map<String, String> result = MetadataFetcher.getFieldPicklistValues(
      'Case',
      'Origin'
    );
    System.assertEquals(3, result.size(), INVALID_PICKLIST_OPTIONS_AMOUNT);
  }

  @isTest
  static void getFieldPicklistValuesNegativeFirstTest() {
    Exception expectedException;
    try {
      Map<String, String> result = MetadataFetcher.getFieldPicklistValues(
        'Undefined',
        'Origin'
      );
    } catch (NullPointerException npe) {
      expectedException = npe;
    }
    System.assertNotEquals(
      null,
      expectedException,
      INVALID_OBJECT_FIELD_DESCRIPTION_RESULT
    );
  }

  @isTest
  static void getFieldPicklistValuesNegativeSecondTest() {
    Exception expectedException;
    try {
      Map<String, String> result = MetadataFetcher.getFieldPicklistValues(
        'Case',
        'Undefined'
      );
    } catch (NullPointerException npe) {
      expectedException = npe;
    }
    System.assertNotEquals(
      null,
      expectedException,
      INVALID_OBJECT_FIELD_DESCRIPTION_RESULT
    );
  }
}