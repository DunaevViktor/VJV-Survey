@IsTest
public with sharing class ImageUploadControllerTest {
    
    private static final String TEST_LOGO_NAME = 'TestLogo.png';
    private static final String TEST_LOGO_BODY = 'Test attachment body';
    
    private static final String NO_URL_GENERATED_MESSAGE = 'Method should return generated Logo URL';
    private static final String WRONG_CONTENT_VERSION_NAME = 'Method should return ContentVersion record';
    private static final String WRONG_CONTENT_DISTRIBUTION_NAME = 'Method should return ContentDistribution record';
    
    @IsTest
    static void testGetImageURL() {
        String testUrl = ImageUploadController.getImageURL(TEST_LOGO_NAME, TEST_LOGO_BODY);
        System.assertNotEquals(testUrl, null, NO_URL_GENERATED_MESSAGE);
    }
    
    @IsTest
    static void testCreateContentVersion() {
        ContentVersion testCV = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY);
        System.assertEquals(TEST_LOGO_NAME, testCV.Title, WRONG_CONTENT_VERSION_NAME);
    }
    
    @IsTest
    static void testCreateContentDistribution() {
        ContentVersion testCV = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY);
        ContentDistribution testCD = ImageUploadController.createContentDistribution(testCV);
        System.assertEquals(TEST_LOGO_NAME, testCD.Name, WRONG_CONTENT_DISTRIBUTION_NAME);
    }
}