public with sharing class DateTimeFieldComparator implements FieldComparable {
    
    public Boolean compareFields(Object recordFieldValue, String operator, Object ruleFieldValue){
        Boolean isConditionMet = false;
        
        switch on operator{
            when 'IS NULL'{
                isConditionMet = (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
            }
            when 'EQUALS'{
                isConditionMet = (DateTime)recordFieldValue == DateTime.parse(String.valueof(ruleFieldValue));
            }
            when 'NOT EQUALS'{ 
                isConditionMet = (DateTime)recordFieldValue != DateTime.parse(String.valueof(ruleFieldValue));
            }
            when 'GREATER THAN'{
                isConditionMet = ((DateTime)recordFieldValue > DateTime.parse(String.valueof(ruleFieldValue)));
            }
            when 'LESS THAN'{
                isConditionMet = ((DateTime)recordFieldValue < DateTime.parse(String.valueof(ruleFieldValue)));
            }
        }
        
        return isConditionMet;
    }  
}