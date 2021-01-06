@isTest
public with sharing class TriggerRuleControllerTest {
  private static final String INVALID_LIST_SIZE = 'Invalid created trigger rules list size.';
  private static final String INVALID_TRIGGER_RULE = 'Invalid created trigger rules list size.';

  @isTest
  static void createTriggerRuleListTest() {
    List<Trigger_Rule__c> triggerRules = TriggerRuleController.createTriggerRuleList();
    System.assertEquals(0, triggerRules.size(), INVALID_LIST_SIZE);
  }

  @isTest
  static void createTriggerRuleTest() {
    Trigger_Rule__c triggerRule = TriggerRuleController.createTriggerRule();
    System.assertNotEquals(null, triggerRule, INVALID_TRIGGER_RULE);
  }
}
