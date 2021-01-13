public with sharing class DecimalFieldComparator implements FieldComparable {
    
    public Boolean compareFields(Object recordFieldValue, String operator, Object ruleFieldValue){
        Boolean isConditionMet = false;
        
        switch on operator{
            when 'IS NULL'{
                isConditionMet = (recordFieldValue == null) == Boolean.valueOf(ruleFieldValue);
            }
            when 'EQUALS'{
                isConditionMet = ((Decimal)recordFieldValue == Decimal.valueOf(String.valueOf(ruleFieldValue)));
            }
            when 'NOT EQUALS'{ 
                isConditionMet = ((Decimal)recordFieldValue != Decimal.valueOf(String.valueOf(ruleFieldValue)));
            }
            when 'GREATER THAN'{
                isConditionMet = ((Decimal)recordFieldValue > Decimal.valueOf(String.valueOf(ruleFieldValue)));
            }
            when 'LESS THAN'{
                isConditionMet = ((Decimal)recordFieldValue < Decimal.valueOf(String.valueOf(ruleFieldValue)));
            }
        }
        
        return isConditionMet;
    }
}