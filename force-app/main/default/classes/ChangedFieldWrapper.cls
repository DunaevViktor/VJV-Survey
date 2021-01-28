public with sharing class ChangedFieldWrapper {

    private static final String OWNER_FIELD_NAME = 'OwnerId';

    public String fieldName;
    public Object newValue;
    public Schema.DisplayType fieldType;
    public Id recordId;
    public String ownerId;
    
    public ChangedFieldWrapper(String fieldName, Schema.DisplayType fieldType, SObject newRecord){
        this.fieldName = fieldName;
        this.newValue = newRecord.get(fieldName);
        this.fieldType = fieldType;
        this.recordId = newRecord.Id;
        this.ownerId = String.valueOf(newRecord.get(OWNER_FIELD_NAME));
    }
}