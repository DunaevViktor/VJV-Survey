@IsTest
public with sharing class GroupControllerTest {
  private static final String TEST_GROUP_NAME = 'Test Group Name';
  private static final Integer AMOUNT_OF_GROUPS = 20;
  private static final Integer AMOUNT_OF_GROUPS_WITH_USERS = 10;

  private static final String TEST_USER_NAME = 'Test User Name';
  private static final Integer AMOUNT_OF_USERS = 10;

  private static final String INVALID_GROUP_AMOUNT = 'Actual amount of groups with users doesn\'t equal to expected';

  @IsTest
  static void testGetGroups() {
    List<Group> groups = new List<Group>();
    for (Integer i = 1; i <= AMOUNT_OF_GROUPS; i++) {
      Group testGroup = new Group(Name = TEST_GROUP_NAME + i);
      groups.Add(testGroup);
    }
    insert groups;

    Profile profile = TestDataFactory.getStandardProfile();
    User testUser = TestDataFactory.createStandardUser(profile);
    insert testUser;

    List<GroupMember> groupMembers = new List<GroupMember>();
    for (Integer i = 1; i <= AMOUNT_OF_GROUPS_WITH_USERS; i++) {
      GroupMember testGroupMember = new GroupMember(GroupId = groups[i].Id);
      testGroupMember.UserOrGroupId = testUser.Id;
      groupMembers.Add(testGroupMember);
    }
    insert groupMembers;

    List<Group> groupsWithUsers = GroupController.getGroups();
    System.assertEquals(
      AMOUNT_OF_GROUPS_WITH_USERS,
      groupsWithUsers.size(),
      INVALID_GROUP_AMOUNT
    );
  }
}