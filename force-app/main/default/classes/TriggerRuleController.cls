public with sharing class TriggerRuleController {
  @AuraEnabled(cacheable=false)
  public static List<Trigger_Rule__c> createTrigerRuleList() {
    return new List<Trigger_Rule__c>();
  }

  @AuraEnabled(cacheable=false)
  public static Trigger_Rule__c createTriggerRule() {
    return new Trigger_Rule__c();
  }

  @AuraEnabled(cacheable=false)
  public static Trigger_Rule__c createTriggerRuleWithParams(
    String objApiName,
    String fieldName,
    String fieldValue,
    String operator
  ) {
    Trigger_Rule__c rule = new Trigger_Rule__c();
    rule.Object_Api_Name__c = objApiName;
    rule.Field_Name__c = fieldName;
    rule.Field_Value__c = fieldValue;
    rule.Operator__c = operator;
    return rule;
  }
}
