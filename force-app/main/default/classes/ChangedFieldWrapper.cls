public with sharing class ChangedFieldWrapper {
    public String fieldName;
    public Object newValue;
    public String fieldType;
    
    public ChangedFieldWrapper(String fieldName, Object newValue, String fieldType){
        this.fieldName = fieldName;
        this.newValue = newValue;
        this.fieldType = fieldType;
    }
}