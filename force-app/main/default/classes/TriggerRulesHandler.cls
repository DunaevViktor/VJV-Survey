public with sharing class TriggerRulesHandler {

    private static final String RECEIVER_RECORD_TYPE = 'Record';
    private static final String CASE_OBJECT_NAME = 'Case';
    
    public static void checkRuleCriterias(String sObjectName, List<ChangedFieldWrapper> changedFields){
        List<Trigger_Rule__c> triggerRules = getTriggerRules(sObjectName);
        List<Email_Receiver__c> receiverList = new List<Email_Receiver__c>();
  
        for(ChangedFieldWrapper recordFields: changedFields){
            for(Trigger_Rule__c rule: triggerRules){
                String ruleFieldName = rule.Field_Name__c.tolowercase();
                
                if(recordFields.fieldname == ruleFieldName){
                    if(compareFieldValues(recordFields, rule.Operator__c, rule.Field_Value__c)){
                        Email_Receiver__c receiver = createReceiver(SObjectName, recordFields, rule.Survey__c);
                        receiverList.add(receiver);
                    }  
                }
            }
        }

        if(receiverList.size() > 0 && Email_Receiver__c.SObjectType.getDescribe().isCreateable()){
            insert receiverList;
            SendEmailLogic.sendEmails(receiverList);
        }
    }
    
    public static Email_Receiver__c createReceiver(String sObjectName, ChangedFieldWrapper recordFields, String surveyId){
        Id receiverId = SObjectName == CASE_OBJECT_NAME ? recordFields.ownerId : recordFields.recordId;
        Survey__c survey = getSurveyUrlFields(surveyId);
        String surveyUrl = SObjectName == CASE_OBJECT_NAME ? survey.URL__c : survey.Guest_URL__c;
        Email_Receiver__c receiver = new Email_Receiver__c(Type__c = RECEIVER_RECORD_TYPE,
                                                            Survey__c = surveyId,
                                                            Value__c = receiverId,
                                                            Survey_URL__c = surveyUrl);
        return receiver;
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
            when 'ANY CHANGE'{
                isConditionMet = true;
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
                WITH SECURITY_ENFORCED
                LIMIT 50000];
    }

    private static Survey__c getSurveyUrlFields(Id surveyId) {
      return [SELECt URL__c, Guest_URL__c
              FROM Survey__c
              WHERE Id = :surveyId
              WITH SECURITY_ENFORCED
              LIMIT 1];
    }
}