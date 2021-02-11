@IsTest
public with sharing class GroupControllerTest {
    private static final String TEST_GROUP_NAME = 'SuperNUniqueEVerJVikOTestPNameA';
    private static final String TEST_DEVELOPER_NAME = 'Developer_Name';
    private static final Integer AMOUNT_OF_REGULAR_GROUPS = 10;
    
    private static final String INVALID_GROUP_AMOUNT = 'Actual amount of Regular/Queue groups doesn\'t equal to expected.';
    
    @IsTest
    static void testGetGroups() {
        List<Group> groups = new List<Group>();
        for (Integer i = 1; i <= AMOUNT_OF_REGULAR_GROUPS; i++) {
            Group testGroup = TestDataFactory.createGroup(TEST_GROUP_NAME + i, TEST_DEVELOPER_NAME + i);
            groups.Add(testGroup);
        }
        insert groups;
        
        Integer counter = 0;
        List<Group> regularOrQueueGroups = GroupController.getGroups();
        for(Group item: regularOrQueueGroups){
            String groupName = item.Name;
            if(groupName.contains(TEST_GROUP_NAME)){
                counter++;
            }
        }
        System.assertEquals(AMOUNT_OF_REGULAR_GROUPS, counter, INVALID_GROUP_AMOUNT);
    } 
}