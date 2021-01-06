public with sharing class ValidationController {
  @AuraEnabled(cacheable=false)
  public static List<Validation__c> createValidationList() {
    return new List<Validation__c>();
  }
}
