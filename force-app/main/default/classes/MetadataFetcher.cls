public with sharing class MetadataFetcher {

  @TestVisible private static final String REFERENCE_DATATYPE = 'REFERENCE';

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
  public static List<FieldDescriptionWrapper> getObjectFieldsDescriptionList(String objectApiName) {
    Map<String, Schema.SObjectField> sobjectFields = getObjectFieldMap(objectApiName);    
    List<FieldDescriptionWrapper> fieldDescriptionsList = new List<FieldDescriptionWrapper>();
    for (String key : sobjectFields.keySet()) {
      String fieldApiName = String.valueOf(sobjectfields.get(key));
      String fieldLabel = String.valueOf(sobjectfields.get(key).getDescribe().getLabel());
      String fieldDatatype = String.valueOf(sobjectfields.get(key).getDescribe().getType());
      List<String> referencedObjectsApiNames = new List<String>();      
      if (fieldDatatype == REFERENCE_DATATYPE) {
        referencedObjectsApiNames = getListOfReferencedObjectNames(sobjectfields.get(key).getDescribe());
      }
      FieldDescriptionWrapper fieldDescription = new FieldDescriptionWrapper(fieldApiName, fieldLabel, fieldDatatype, referencedObjectsApiNames);
      fieldDescriptionsList.add(fieldDescription);
    }        
    return fieldDescriptionsList;
  }

  private static Map<String, Schema.SObjectField> getObjectFieldMap(String objectApiName) {
    return Schema.describeSObjects(new String[]{objectApiName})[0].fields.getMap();
  }

  @TestVisible
  private static List<String> getListOfReferencedObjectNames(Schema.DescribeFieldResult result) {
    List<String> referencedObjectsApiNames = new List<String>();
    for (Schema.SObjectType reference : result.getReferenceTo()) {
      referencedObjectsApiNames.add(reference.getDescribe().getName());
    }
    return referencedObjectsApiNames;
  }
}