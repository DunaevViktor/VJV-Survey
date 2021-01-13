public with sharing class DateFieldComparator implements FieldComparable {
    
    public Boolean compareFields(Object recordFieldValue, String operator, Object ruleFieldValue){
        Boolean isConditionMet = false;
        
        switch on operator{
            when 'IS NULL'{
                isConditionMet = (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
            }
            when 'EQUALS'{
                isConditionMet = (Date)recordFieldValue == Date.parse(String.valueof(ruleFieldValue));
            }
            when 'NOT EQUALS'{ 
                isConditionMet = (Date)recordFieldValue != Date.parse(String.valueof(ruleFieldValue));
            }
            when 'GREATER THAN'{
                isConditionMet = ((Date)recordFieldValue > Date.parse(String.valueof(ruleFieldValue)));
            }
            when 'LESS THAN'{
                isConditionMet = ((Date)recordFieldValue < Date.parse(String.valueof(ruleFieldValue)));
            }
        }
        
        return isConditionMet;
    }   
}