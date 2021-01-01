public with sharing class TriggerRuleController {
  @AuraEnabled(cacheable=false)
  public static List<Trigger_Rule__c> createTrigerRuleList() {
    return new List<Trigger_Rule__c>();
  }

  @AuraEnabled(cacheable=false)
  public static Trigger_Rule__c createTriggerRule() {
    return new Trigger_Rule__c();
  }
}
