@IsTest
public with sharing class CampaignControllerTest {

    private static final String INVALID_CAMPAIGN_AMOUNT = 'Actual amount of campaigns doesn\'t equal to expected';
    private static final String INVALID_CAMPAIGN_NAME = 'Actual campaign name doesn\'t equal to expected';

    @TestSetup
    static void makeData(){
        Lead lead = TestDataFactory.createLead();
        insert lead;

        Campaign campaign = TestDataFactory.createCampaign();
        insert campaign;

        CampaignMember campaignMember = TestDataFactory.createCampaignMember(campaign.Id, lead.Id);
        insert campaignMember;
    }

    @IsTest
    static void testGetCampaigns() {
        List<Campaign> campaigns = CampaignController.getCampaigns();
        
        System.assertEquals(1, campaigns.size(), INVALID_CAMPAIGN_AMOUNT);
        System.assertEquals(TestDataFactory.TEST_VALUE, campaigns[0].Name, INVALID_CAMPAIGN_NAME);
    }
}