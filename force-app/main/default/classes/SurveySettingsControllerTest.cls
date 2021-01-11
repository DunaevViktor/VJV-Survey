@IsTest
public with sharing class SurveySettingsControllerTest {

  private static final String TEST_LOGO_NAME = 'TestLogo.png';
  private static final String TEST_LOGO_BODY = 'Test attachment body';

  private static final String NO_URL_GENERATED_MESSAGE = 'Method should return generated Logo URL';
  private static final String WRONG_CONTENT_VERSION_NAME = 'Method should return ContentVersion record';
  private static final String WRONG_CONTENT_DISTRIBUTION_NAME = 'Method should return ContentDistribution record';

  @IsTest
  public static void getLogoURLTest() {
    String testUrl = SurveySettingsController.getLogoURL(TEST_LOGO_NAME, TEST_LOGO_BODY);
    System.assertNotEquals(testUrl, null, NO_URL_GENERATED_MESSAGE);
  }

  @IsTest
  public static void createContentVersionTest() {
    ContentVersion testCV = SurveySettingsController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY);
    System.assertEquals(TEST_LOGO_NAME, testCV.Title, WRONG_CONTENT_VERSION_NAME);
  }

  @IsTest
  public static void createContentDistributionTest() {
    ContentVersion testCV = SurveySettingsController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY);
    ContentDistribution testCD = SurveySettingsController.createContentDistribution(testCV);
    System.assertEquals(TEST_LOGO_NAME, testCD.Name, WRONG_CONTENT_DISTRIBUTION_NAME);
  }
}
