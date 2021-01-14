public with sharing class TextFieldComparator implements TextFieldComparable {
    public Boolean isNull(Object recordFieldValue, Object ruleFieldValue){
        return (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
    }
    
    public Boolean isEquals(Object recordFieldValue, Object ruleFieldValue){
        return String.valueOf(recordFieldValue) == String.valueOf(ruleFieldValue);
    }

    public Boolean isNotEquals(Object recordFieldValue, Object ruleFieldValue){
        return (String.valueOf(recordFieldValue) != String.valueOf(ruleFieldValue));
    }

    public Boolean isContains(Object recordFieldValue, Object ruleFieldValue){
        return (String.valueOf(recordFieldValue).contains(String.valueOf(ruleFieldValue)));
    }

    public Boolean isNotContains(Object recordFieldValue, Object ruleFieldValue){
        return (!String.valueOf(recordFieldValue).contains(String.valueOf(ruleFieldValue)));
    }
}