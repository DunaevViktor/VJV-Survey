@isTest
public with sharing class TestUtilityTest {

    private static final String INVALID_FAKE_ID_LENGTH = 'Invalid generated fake id length.';

    @isTest
    static void getFakeIdTest() {
        String res = TestUtility.getFakeId('Case');
        System.assertEquals(15, res.length(), INVALID_FAKE_ID_LENGTH);
    }
}
