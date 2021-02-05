public with sharing class GroupController {

    private static final String REGULAR_TYPE = 'Regular';
    private static final String QUEUE_TYPE = 'Queue';

    @AuraEnabled(cacheable=true)
    public static List<Group> getGroups() {
        return [SELECT Id, Name, Type FROM Group WHERE Type = :REGULAR_TYPE OR Type = :QUEUE_TYPE WITH SECURITY_ENFORCED];
    }
}