public with sharing class ChangedFieldWrapper {
    public String fieldName;
    public Object newValue;
    public Schema.DisplayType fieldType;
    
    public ChangedFieldWrapper(String fieldName, Object newValue, Schema.DisplayType fieldType){
        this.fieldName = fieldName;
        this.newValue = newValue;
        this.fieldType = fieldType;
    }
}