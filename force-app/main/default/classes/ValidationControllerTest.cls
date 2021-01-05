@IsTest
public with sharing class ValidationControllerTest {
  private static final String INVALID_VALIDATIONS_AMOUNT = 'Actual length of validations list doesn\'t equal to expected';

  @IsTest
  public static void createValidationListTest() {
    List<Validation__c> validations = ValidationController.createValidationList();
    System.assertEquals(validations.size(), 0, INVALID_VALIDATIONS_AMOUNT);

    List<Validation__c> validationsDatabase = [SELECT Id FROM Validation__c];
    System.assertEquals(validationsDatabase.size(),0,INVALID_VALIDATIONS_AMOUNT);
  }
}
