@IsTest
public with sharing class CampaignControllerTest {

    private static final String TEST_CAMPAIGN_NAME = 'Test Campaign Name';
    private static final String TEST_COMPANY_NAME = 'Test Company Name';
    private static final String TEST_LAST_NAME = 'Test';

    private static final String INVALID_CAMPAIGN_AMOUNT = 'Actual amount of campaigns doesn\'t equal to expected';
    private static final String INVALID_CAMPAIGN_NAME = 'Actual campaign name doesn\'t equal to expected';

    @TestSetup
    static void makeData(){
        Lead lead = new Lead();
        lead.Company = TEST_COMPANY_NAME;
        lead.LastName = TEST_LAST_NAME;
        insert lead;

        Campaign campaign = new Campaign(Name = TEST_CAMPAIGN_NAME);
        insert campaign;

        CampaignMember campaignMember = new CampaignMember();
        campaignMember.CampaignId = campaign.Id;
        campaignMember.LeadId = lead.Id;
        insert campaignMember;
    }

    @IsTest
    static void testGetCampaigns() {
        List<Campaign> campaigns = CampaignController.getCampaigns();
        
        System.assertEquals(1, campaigns.size(), INVALID_CAMPAIGN_AMOUNT);
        System.assertEquals(TEST_CAMPAIGN_NAME, campaigns[0].Name, INVALID_CAMPAIGN_NAME);
    }
}
