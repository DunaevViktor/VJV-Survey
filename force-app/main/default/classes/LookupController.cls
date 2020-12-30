public with sharing class LookupController {
  @AuraEnabled(cacheable=true)
  public static List<SObject> findRecords(
    String searchKey,
    List<String> objectsApiNames
  ) {
    System.debug(objectsApiNames);
    List<SObject> result = new List<SObject>();
    string searchText = '\'' + String.escapeSingleQuotes(searchKey) + '%\'';
    for (String objectApiName : objectsApiNames) {
      List<sObject> res = Database.query(
        'SELECT Id, Name FROM ' +
        objectApiName +
        ' WHERE Name LIKE ' +
        searchText +
        'WITH SECURITY_ENFORCED LIMIT 10'
      );
      for (SObject singleSObject : res) {
        result.add(singleSObject);
      }
    }
    return result;
  }
}
