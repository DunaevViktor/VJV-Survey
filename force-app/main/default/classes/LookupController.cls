public with sharing class LookupController {
  @AuraEnabled(cacheable=true)
  public static List<sobject> findRecords(String searchKey, String objectName) {
    string searchText = '\'' + String.escapeSingleQuotes(searchKey) + '%\'';
    string query =
      'SELECT Id, Name FROM ' +
      objectName +
      ' WHERE Name LIKE ' +
      searchText +
      ' LIMIT 10';
    return Database.query(
      'SELECT Id, Name FROM ' +
      objectName +
      ' WHERE Name LIKE ' +
      searchText +
      ' LIMIT 10'
    );
  }
}
