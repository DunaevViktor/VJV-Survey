public with sharing class MetadataFetcher {
  @AuraEnabled(cacheable=true)
  public static Map<String, String> getObjectApiNamePickListValues() {
    Map<String, String> pickListValuesMap = new Map<String, String>();
    Schema.DescribeFieldResult fieldResult = Trigger_Rule__c.Object_Api_Name__c.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for (Schema.PicklistEntry pickListVal : ple) {
      pickListValuesMap.put(pickListVal.getValue(), pickListVal.getLabel());
    }
    return pickListValuesMap;
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, String> getTriggerRuleOperatorPickListValues() {
    Map<String, String> pickListValuesMap = new Map<String, String>();
    Schema.DescribeFieldResult fieldResult = Trigger_Rule__c.Operator__c.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for (Schema.PicklistEntry pickListVal : ple) {
      pickListValuesMap.put(pickListVal.getValue(), pickListVal.getLabel());
    }
    return pickListValuesMap;
  }

  @AuraEnabled(cacheable=true)
  public static List<List<String>> getObjectFieldsDescriptionList(
    String objectApiName
  ) {
    SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
    Map<String, Schema.SObjectField> sobjectfields = sobjectType.getDescribe().fields.getMap();
    List<List<String>> sObjectFieldList = new List<List<String>>();
    for (String s : sobjectfields.keySet()) {
      List<String> fieldDescriptionList = new List<String>(); // [0] - field api name; [1] - field label; [2] - datatype; [3...] - referenced objects api names (if it is lookup field)
      fieldDescriptionList.add(String.valueOf(sobjectfields.get(s)));
      fieldDescriptionList.add(
        String.valueOf(sobjectfields.get(s).getDescribe().getLabel())
      );
      String datatype = String.valueOf(
        sobjectfields.get(s).getDescribe().getType()
      );
      fieldDescriptionList.add(datatype);
      if (datatype == 'REFERENCE') {
        populateListWithReferencedObjectNames(
          sobjectfields.get(s).getDescribe(),
          fieldDescriptionList
        );
      }
      sObjectFieldList.add(fieldDescriptionList);
    }
    return sObjectFieldList;
  }

  private static void populateListWithReferencedObjectNames(
    Schema.DescribeFieldResult result,
    List<String> destination
  ) {
    if (destination == null) {
      destination = new List<String>();
    }

    for (Schema.SObjectType reference : result.getReferenceTo()) {
      destination.add(reference.getDescribe().getName());
    }
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, String> getFieldPicklistValues(
    String objApiName,
    String field
  ) {
    Map<String, String> options = new Map<String, String>();
    Schema.sObjectType objType = Schema.getGlobalDescribe().get(objApiName);
    Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
    Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
    list<Schema.PicklistEntry> values = fieldMap.get(field).getDescribe().getPickListValues();
    for (Schema.PicklistEntry a : values) {
      options.put(a.getLabel(), a.getValue());
    }
    return options;
  }
}