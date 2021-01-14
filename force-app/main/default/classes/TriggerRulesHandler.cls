public with sharing class TriggerRulesHandler {
    
    public static void checkRuleCriterias(String sObjectName, List<ChangedFieldWrapper> changedFields){
        List<Trigger_Rule__c> triggerRules = getTriggerRules(sObjectName);
        Set<Id> surveysToSend = new Set<Id>();
        
        for(ChangedFieldWrapper recordFields: changedFields){
            for(Trigger_Rule__c rule: triggerRules){
                String ruleFieldName = rule.Field_Name__c.tolowercase();
                
                if(recordFields.fieldname == ruleFieldName){
                    if(compareFieldValues(recordFields, rule.Operator__c, rule.Field_Value__c)){
                        surveysToSend.add(rule.Survey__c);
                    }  
                }
            }
        }
        
        if(surveysToSend.size() > 0){
            List<Email_Receiver__c> receiverList = getEmailReceivers(surveysToSend);
            SendEmailLogic.sendEmails(receiverList);
        }
    }  
    
    public static Boolean compareFieldValues(ChangedFieldWrapper changedField, String operator, Object ruleFieldValue){
        Boolean isConditionMet = false;
        FieldComparable comparator = defineComparingType(changedField);

        switch on operator {
            when 'IS NULL'{
                isConditionMet = comparator.isNull(changedField.newValue, ruleFieldValue);
            }
            when 'EQUALS'{
                isConditionMet = comparator.isEquals(changedField.newValue, ruleFieldValue);
            }
            when 'NOT EQUALS'{
                isConditionMet = comparator.isNotEquals(changedField.newValue, ruleFieldValue);
            }
            when 'CONTAINS'{
                TextFieldComparable textComparator = (TextFieldComparable)comparator;
                isConditionMet = textComparator.isContains(changedField.newValue, ruleFieldValue);
            }
            when 'NOT CONTAINS'{
                TextFieldComparable textComparator = (TextFieldComparable)comparator;
                isConditionMet = textComparator.isNotContains(changedField.newValue, ruleFieldValue);
            }
            when 'GREATER THAN'{
                DateNumberFieldComparable numberComparator = (DateNumberFieldComparable)comparator;
                isConditionMet = numberComparator.isGreater(changedField.newValue, ruleFieldValue);
            }
            when 'LESS THAN'{
                DateNumberFieldComparable numberComparator = (DateNumberFieldComparable)comparator;
                isConditionMet = numberComparator.isLess(changedField.newValue, ruleFieldValue);
            }
        }
        
        return isConditionMet;
    }
    
    public static FieldComparable defineComparingType(ChangedFieldWrapper changedField){        
        FieldComparable comparator;
        Schema.DisplayType fieldType = changedField.fieldType;
        
        switch on fieldType{
            when DATE{
                comparator = new DateFieldComparator();
            }
            when DATETIME{
                comparator = new DateTimeFieldComparator();
            }
            when DOUBLE, INTEGER, CURRENCY, PERCENT{
                comparator = new DecimalFieldComparator();
            }
            when else{
                comparator = new TextFieldComparator();
            }
        }
        
        return comparator;
    }
    
    public static List<Trigger_Rule__c> getTriggerRules(String objectApiName){
        return [SELECT Id, Name, Field_Name__c, Operator__c, Field_Value__c, Survey__c, Object_Api_Name__c
                FROM Trigger_Rule__c 
                WHERE Object_Api_Name__c =: objectApiName
                WITH SECURITY_ENFORCED];
    }
    
    public static List<Email_Receiver__c> getEmailReceivers(Set<Id> surveyIds){
        return [SELECT Id, Type__c, Value__c, Survey__c, IsSend__c 
                FROM Email_Receiver__c
                WHERE Survey__c
                IN: surveyIds 
                WITH SECURITY_ENFORCED];
    }
}