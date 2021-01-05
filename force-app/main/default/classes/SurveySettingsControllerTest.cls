@IsTest
public with sharing class SurveySettingsControllerTest {
  private static final String TEST_NAME = 'Test Name';
  private static final String TEST_LOGO_URL = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
  private static final String TEST_COLOR = '#aabbcc';

  private static final String INVALID_SURVEY_NAME = 'Retrieved survey name doesn\'t match to expected.';
  private static final String INVALID_SURVEY_LOGO = 'Retrieved survey logo URL doesn\'t match to expected.';
  private static final String INVALID_SURVEY_COLOR = 'Retrieved survey background color doesn\'t match to expected.';
  private static final String NULL_EXPECTED = 'Method returned existing record (null expected).';

  @IsTest
  public static void getExistingSurveyDataTest() {
    Survey__c survey = new Survey__c(
      Name = TEST_NAME,
      Logo__c = TEST_LOGO_URL,
      Background_Color__c = TEST_COLOR
    );
    insert survey;

    String surveyId = survey.Id;

    Survey__c retrievedSurvey = SurveySettingsController.getSurveyData(
      surveyId
    );
    System.assertEquals(retrievedSurvey.Name, survey.Name, INVALID_SURVEY_NAME);
    System.assertEquals(
      retrievedSurvey.Logo__c,
      survey.Logo__c,
      INVALID_SURVEY_LOGO
    );
    System.assertEquals(
      retrievedSurvey.Background_Color__c,
      survey.Background_Color__c,
      INVALID_SURVEY_COLOR
    );

    delete survey;
    Survey__c unexistingSurvey = SurveySettingsController.getSurveyData(
      surveyId
    );
    System.assertEquals(unexistingSurvey, null, NULL_EXPECTED);

    Survey__c expectedNull = SurveySettingsController.getSurveyData(null);
    System.assertEquals(expectedNull, null, NULL_EXPECTED);
  }
}
