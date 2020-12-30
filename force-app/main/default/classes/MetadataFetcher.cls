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
  public static Map<String, List<String>> getObjectFields(
    String objectApiName
  ) {
    SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
    Map<String, Schema.SObjectField> sobjectfields = sobjectType.getDescribe()
      .fields.getMap();

    Map<String, List<String>> sObjectFieldMap = new Map<String, List<String>>();
    for (String s : sobjectfields.keySet()) {
      List<String> extraInfo = new List<String>();
      Schema.SObjectField field = sobjectfields.get(s);
      //extraInfo.add(field.getDescribe().getValue());
      populateListWithReferencedObjectNames(field.getDescribe(), extraInfo);
      /*sObjectFieldMap.put(
        String.valueOf(sobjectfields.get(s).getDescribe().getLabel()),
        String.valueOf(sobjectfields.get(s).getDescribe().getType())
      );*/
    }
    return sObjectFieldMap;
  }

  @AuraEnabled(cacheable=true)
  public static List<List<String>> getObjectFieldsDescriptionList(
    String objectApiName
  ) {
    SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
    Map<String, Schema.SObjectField> sobjectfields = sobjectType.getDescribe()
      .fields.getMap();

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
      System.debug(
        'Lookup reference object name: ' + reference.getDescribe().getName()
      );
      destination.add(reference.getDescribe().getName());
    }
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
