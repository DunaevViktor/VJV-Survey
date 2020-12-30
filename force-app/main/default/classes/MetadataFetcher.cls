public with sharing class MetadataFetcher {
  @AuraEnabled(cacheable=true)
  public static List<String> getObjectApiNamePickListValues() {
    List<String> pickListValuesList = new List<String>();
    Schema.DescribeFieldResult fieldResult = Trigger_Rule__c.Object_Api_Name__c.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for (Schema.PicklistEntry pickListVal : ple) {
      pickListValuesList.add(pickListVal.getLabel());
    }
    return pickListValuesList;
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getTriggerRuleOpearatorPickListValues() {
    List<String> pickListValuesList = new List<String>();
    Schema.DescribeFieldResult fieldResult = Trigger_Rule__c.Operator__c.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for (Schema.PicklistEntry pickListVal : ple) {
      pickListValuesList.add(pickListVal.getLabel());
    }
    return pickListValuesList;
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, String> getObjectFields(String objectApiName) {
    SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
    Map<String, Schema.SObjectField> sobjectfields = sobjectType.getDescribe()
      .fields.getMap();

    Map<String, String> sObjectFieldMap = new Map<String, String>();
    for (String s : sobjectfields.keySet()) {
      sObjectFieldMap.put(
        String.valueOf(sobjectfields.get(s)),
        String.valueOf(sobjectfields.get(s).getDescribe().getType())
      );
    }
    return sObjectFieldMap;
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, String> getFieldPicklistValues(
    String objApiName,
    String field
  ) {
    Map<String, String> options = new Map<String, String>();

    // Get the object type of the SObject.
    Schema.sObjectType objType = Schema.getGlobalDescribe().get(objApiName);

    // Describe the SObject using its object type.
    Schema.DescribeSObjectResult objDescribe = objType.getDescribe();

    // Get a map of fields for the SObject
    Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();

    // Get the list of picklist values for this field.
    list<Schema.PicklistEntry> values = fieldMap.get(field)
      .getDescribe()
      .getPickListValues();

    // Add these values to the selectoption list.
    for (Schema.PicklistEntry a : values) {
      options.put(a.getLabel(), a.getValue());
    }
    return options;
  }
}
