public with sharing class DecimalFieldComparator implements DateNumberFieldComparable {
    public Boolean isNull(Object recordFieldValue, Object ruleFieldValue){
        return (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
    }
    
    public Boolean isEquals(Object recordFieldValue, Object ruleFieldValue){
        return ((Decimal)recordFieldValue == Decimal.valueOf(String.valueOf(ruleFieldValue)));
    }

    public Boolean isNotEquals(Object recordFieldValue, Object ruleFieldValue){
        return ((Decimal)recordFieldValue != Decimal.valueOf(String.valueOf(ruleFieldValue)));
    }

    public Boolean isLess(Object recordFieldValue, Object ruleFieldValue){
        return ((Decimal)recordFieldValue < Decimal.valueOf(String.valueOf(ruleFieldValue)));
    }

    public Boolean isGreater(Object recordFieldValue, Object ruleFieldValue){
        return ((Decimal)recordFieldValue > Decimal.valueOf(String.valueOf(ruleFieldValue)));
    }
}