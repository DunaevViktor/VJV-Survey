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

  @AuraEnabled(cacheable=true)
  public static String findNameByRecordId(String objectApiName, String id) {
    System.debug(objectApiName);
    SObject res = Database.query(
      'SELECT Name FROM ' +
      objectApiName +
      ' WHERE Id = ' +
      id +
      ' WITH SECURITY_ENFORCED'
    );
    String name = '';
    if (res != null) {
      name = res.get('Name') + '';
    }
    return name;
  }
}
