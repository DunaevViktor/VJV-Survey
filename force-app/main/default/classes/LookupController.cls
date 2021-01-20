public with sharing class LookupController {
  @AuraEnabled(cacheable=true)
  public static List<SObject> findRecords(String searchKey, List<String> objectsApiNames) {
    List<SObject> result = new List<SObject>();
    try {
      for (String objectApiName : objectsApiNames) {
        List<sObject> res = Database.query(
          'SELECT Id, Name FROM ' +
          String.escapeSingleQuotes(objectApiName) +
          ' WHERE Name LIKE ' +
          String.escapeSingleQuotes(searchKey) +
          'WITH SECURITY_ENFORCED LIMIT 10'
        );
        for (SObject singleSObject : res) {
          result.add(singleSObject);
        }
      }
    } catch (QueryException q) {
      system.debug('Query exception.');
      system.debug(q);
    }
    return result;
  }
}