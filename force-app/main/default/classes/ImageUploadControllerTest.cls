@IsTest
public with sharing class ImageUploadControllerTest {
    
    private static final String TEST_LOGO_NAME = 'TestLogo.png';
    private static final String TEST_LOGO_BODY = 'Test attachment body';
    
    private static final String NO_URL_GENERATED_MESSAGE = 'Method should return generated Logo URL in ImageDataWrapper object';
    private static final String WRONG_CONTENT_VERSION_NAME = 'Method should return ContentVersion record';
    private static final String WRONG_CONTENT_DISTRIBUTION_NAME = 'Method should return ContentDistribution record';
    private static final String WRONG_CONTENT_DOCUMENT_ID = 'Method should create ContentVersion record with specific Document Id if it was assigned';
    private static final String NO_DOCUMENT_MESSAGE = 'Method should return document Id in ImageDataWrapper object';
    private static final String DOCUMENT_NOT_CREATED_MESSAGE = 'Method should return ContentDocument record';
    private static final String NO_SUCH_CONTENTVERSION = 'ContentVersion was not created';
    private static final String FAILED_DELETION = 'Method has to delete ContentDocument';
    
    @IsTest
    static void testUploadImage() {
        ContentVersion testCV = new ContentVersion();
        testCV.Title = TEST_LOGO_NAME;
        testCV.PathOnClient = TEST_LOGO_NAME;
        testCV.VersionData = EncodingUtil.base64Decode(TEST_LOGO_BODY);
        insert testCV;
        testCV = [SELECT ContentDocumentId 
                  FROM ContentVersion
                  WHERE Id = :testCV.Id
                  WITH SECURITY_ENFORCED
                  LIMIT 1];
        String testImageDataJSON = ImageUploadController.uploadImage(TEST_LOGO_NAME, TEST_LOGO_BODY, testCV.ContentDocumentId);
        ImageDataWrapper testImageData = (ImageDataWrapper) JSON.deserialize(testImageDataJSON, ImageDataWrapper.class);
        System.assertEquals(testCV.ContentDocumentId, testImageData.imageDocumentId, NO_DOCUMENT_MESSAGE);
        System.assertNotEquals(null, testImageData.imageUrl, NO_URL_GENERATED_MESSAGE);
    }
    
    @IsTest
    static void testCreateContentVersion() {
        ContentVersion testCVnoDocument = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY, null);
        System.assertEquals(TEST_LOGO_NAME, testCVnoDocument.Title, WRONG_CONTENT_VERSION_NAME);
        ContentVersion testCVwithDocument = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY, testCVnoDocument.ContentDocumentId);
        System.assertEquals(TEST_LOGO_NAME, testCVwithDocument.Title, WRONG_CONTENT_VERSION_NAME);
        System.assertEquals(testCVnoDocument.ContentDocumentId, testCVwithDocument.ContentDocumentId, WRONG_CONTENT_DOCUMENT_ID);
    }
    
    @IsTest
    static void testCreateContentDistribution() {
        ContentVersion testCV = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY, null);
        ContentDistribution testCD = ImageUploadController.createContentDistribution(testCV);
        System.assertEquals(TEST_LOGO_NAME, testCD.Name, WRONG_CONTENT_DISTRIBUTION_NAME);
    }
    
    @IsTest
    static void testGetContentDocumentById() {
        ContentVersion testCV = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY, null);
        List<ContentDocument> testCDList = [SELECT Id
                                            FROM ContentDocument
                                            WHERE Id = :testCv.ContentDocumentId
                                            WITH SECURITY_ENFORCED
                                            LIMIT 1];
        System.assert(testCDList.size() > 0, DOCUMENT_NOT_CREATED_MESSAGE);
    }
    
    @IsTest
    static void testDeleteImageById() {
        ContentVersion testCV = ImageUploadController.createContentVersion(TEST_LOGO_NAME, TEST_LOGO_BODY, null);
        String testContentDocumentId = [SELECT Id 
                                        FROM ContentDocument
                                        WHERE Id = :testCV.ContentDocumentId][0].Id;
        System.assertEquals(testCV.ContentDocumentId, testContentDocumentId, NO_SUCH_CONTENTVERSION);
        
        ImageUploadController.deleteImageById(testContentDocumentId);
        List<ContentDocument> testContentDocument = [SELECT Id 
                                                     FROM ContentDocument
                                                     WHERE Id = :testContentDocumentId];
        System.assertEquals(0, testContentDocument.size(), FAILED_DELETION);
    }
}