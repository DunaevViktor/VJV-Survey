public with sharing class CampaignController {
    @AuraEnabled(cacheable=true)
    public static List<Campaign> getCampaigns() {
        return [SELECT Id, Name FROM Campaign WITH SECURITY_ENFORCED];
    }
}