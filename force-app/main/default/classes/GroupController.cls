public with sharing class GroupController {
  @AuraEnabled(cacheable=true)
  public static List<Group> getGroups() {
    Set<Id> groupIds = new Set<Id>();
    for (GroupMember groupMember : [SELECT GroupId FROM GroupMember WITH SECURITY_ENFORCED]) {
      groupIds.add(groupMember.GroupId);
    }

    return [SELECT Id, Name FROM Group WHERE Id IN :groupIds WITH SECURITY_ENFORCED];
  }
}