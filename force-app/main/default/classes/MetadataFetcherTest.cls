@isTest
public with sharing class MetadataFetcherTest {
  @isTest
  static void getObjectFieldsDescriptionListTest() {
    List<List<String>> result = MetadataFetcher.getObjectFieldsDescriptionList(
      'Case'
    );
    System.debug(result);
    System.assertNotEquals(null, result.size(), 'Fields are not retrieved.');
  }
}
