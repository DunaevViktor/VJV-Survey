public with sharing class TextFieldComparator implements FieldComparable {
    
    public Boolean compareFields(Object recordFieldValue, String operator, Object ruleFieldValue){
        Boolean isConditionMet = false;
        
        switch on operator{
            when 'IS NULL'{
                isConditionMet = (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
            }
            when 'EQUALS'{
                isConditionMet = String.valueOf(recordFieldValue) == String.valueOf(ruleFieldValue);
            }
            when 'NOT EQUALS'{ 
                isConditionMet = (String.valueOf(recordFieldValue) != String.valueOf(ruleFieldValue));
            }
            when 'CONTAINS'{
                isConditionMet = (String.valueOf(recordFieldValue).contains(String.valueOf(ruleFieldValue)));
            }
            when 'NOT CONTAINS'{
                isConditionMet = (!String.valueOf(recordFieldValue).contains(String.valueOf(ruleFieldValue)));
            }
        } 
        
        return isConditionMet;
    }
}