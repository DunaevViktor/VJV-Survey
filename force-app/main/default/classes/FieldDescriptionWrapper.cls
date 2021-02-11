public with sharing class FieldDescriptionWrapper {

    @AuraEnabled public String value {get; set;}
    @AuraEnabled public String label {get; set;}
    @AuraEnabled public String datatype {get; set;}
    @AuraEnabled public List<String> referencedObjects {get; set;}

    public FieldDescriptionWrapper(String fieldApiName, String fieldLabel, String fieldDatatype, List<String> referencedObjects) {
        this.value = fieldApiName;
        this.label = fieldLabel;
        this.datatype = fieldDatatype;
        this.referencedObjects = referencedObjects;
    }
}