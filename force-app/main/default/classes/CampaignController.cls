public with sharing class CampaignController {
    @AuraEnabled(cacheable=true)
    public static List<Campaign> getCampaigns() {
        Set<Id> campaignIds = new Set<Id>();
        for (CampaignMember campaignMember : [SELECT CampaignId FROM CampaignMember WITH SECURITY_ENFORCED]) {
            campaignIds.add(campaignMember.CampaignId);
        }
        return [SELECT Id, Name FROM Campaign WHERE Id IN :campaignIds WITH SECURITY_ENFORCED];
    }
}