public with sharing class MetadataFetcher {

  @AuraEnabled(cacheable=true)
  public static Map<String, String> getPicklistValues(String objectApiName, String fieldApiName) {
    Map<String, String> pickListValuesMap = new Map<String, String>();
    Map<String, Schema.SObjectField> fieldMap = getObjectFieldMap(objectApiName);
    if(fieldMap.size() == 0 || fieldMap.get(fieldApiName) == null) {
      return pickListValuesMap;
    }
    List<Schema.PicklistEntry> options = fieldMap.get(fieldApiName).getDescribe().getPickListValues();
    for (Schema.PicklistEntry option : options) { 
      pickListValuesMap.put(option.getValue(), option.getLabel());
    }
    return pickListValuesMap;
  }  

  @AuraEnabled(cacheable=true)
  public static List<List<String>> getObjectFieldsDescriptionList(String objectApiName) {
    Map<String, Schema.SObjectField> sobjectFields = getObjectFieldMap(objectApiName);
    
    List<List<String>> sObjectFieldList = new List<List<String>>();
    for (String key : sobjectFields.keySet()) {
      List<String> fieldDescriptionList = new List<String>(); // [0] - field api name; [1] - field label; [2] - datatype; [3...] - referenced objects api names (if it is lookup field)
      fieldDescriptionList.add(String.valueOf(sobjectfields.get(key)));
      fieldDescriptionList.add(String.valueOf(sobjectfields.get(key).getDescribe().getLabel()));
      String datatype = String.valueOf(sobjectfields.get(key).getDescribe().getType());
      fieldDescriptionList.add(datatype);
      if (datatype == 'REFERENCE') {
        populateListWithReferencedObjectNames(sobjectfields.get(key).getDescribe(), fieldDescriptionList);
      }
      sObjectFieldList.add(fieldDescriptionList);
    }
    return sObjectFieldList;
  }

  private static Map<String, Schema.SObjectField> getObjectFieldMap(String objectApiName) {
    SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
    if(sobjectType == null) {
      return new Map<String, Schema.SObjectField>();
    }
    Map<String, Schema.SObjectField> sobjectFields = sobjectType.getDescribe().fields.getMap();
    return sobjectFields;
  }

  @TestVisible
  private static void populateListWithReferencedObjectNames(Schema.DescribeFieldResult result, List<String> destination) {
    if (destination == null) {
      destination = new List<String>();
    }
    for (Schema.SObjectType reference : result.getReferenceTo()) {
      destination.add(reference.getDescribe().getName());
    }
  }
}
