public with sharing class DateTimeFieldComparator implements DateNumberFieldComparable {
    public Boolean isNull(Object recordFieldValue, Object ruleFieldValue){
        return (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
    }
    
    public Boolean isEquals(Object recordFieldValue, Object ruleFieldValue){
        return (DateTime)recordFieldValue == DateTime.parse(String.valueof(ruleFieldValue));
    }

    public Boolean isNotEquals(Object recordFieldValue, Object ruleFieldValue){
        return (DateTime)recordFieldValue != DateTime.parse(String.valueof(ruleFieldValue));
    }

    public Boolean isLess(Object recordFieldValue, Object ruleFieldValue){
        return ((DateTime)recordFieldValue < DateTime.parse(String.valueof(ruleFieldValue)));
    }

    public Boolean isGreater(Object recordFieldValue, Object ruleFieldValue){
        return ((DateTime)recordFieldValue > DateTime.parse(String.valueof(ruleFieldValue)));
    }
}