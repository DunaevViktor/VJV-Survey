public with sharing class FieldDescriptionWrapper {

    private String fieldApiName;
    private String fieldLabel;
    private String fieldDatatype;
    private List<String> referencedObjectsApiNames;

    public FieldDescriptionWrapper(String fieldApiName, String fieldLabel, String fieldDatatype) {
        this.fieldApiName = fieldApiName;
        this.fieldLabel = fieldLabel;
        this.fieldDatatype = fieldDatatype;
    }

    public String getFieldApiName() {
        return this.fieldApiName;
    }

    public String getFieldLabel() {
        return this.fieldLabel;
    }

    public String getFieldDatatype() {
        return this.fieldDatatype;
    }

    public void setReferencedObjectsApiNames(List<String> referencedObjectsApiNames) {
        this.referencedObjectsApiNames = referencedObjectsApiNames;
    }

    public List<String> getReferencedObjectsApiNames() {
        return this.referencedObjectsApiNames;
    }
}
