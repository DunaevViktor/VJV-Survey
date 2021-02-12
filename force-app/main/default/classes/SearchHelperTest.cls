@IsTest
public with sharing class SearchHelperTest {
    
    private static final String INVALID_MEMBERS_AMOUNT = 'Actual amount of members doesn\'t equal to expected.';
    private static final String INVALID_USERS_AMOUNT = 'Actual amount of users doesn\'t equal to expected.';
    private static final String INVALID_CONTACTS_AMOUNT = 'Actual amount of contacts doesn\'t equal to expected.';
    private static final String INVALID_LEADS_AMOUNT = 'Actual amount of leads doesn\'t equal to expected.';
    
    @TestSetup
    static void makeData(){
        Lead lead = TestDataFactory.createLead();
        insert lead;
    }
    
    @IsTest
    static void testSearchMembers() {
        Lead lead = [SELECT Id FROM Lead WHERE LastName Like :TestDataFactory.TEST_VALUE];
        Id [] fixedSearchResults= new Id[1];
        fixedSearchResults[0] = lead.Id;
        Test.setFixedSearchResults(fixedSearchResults);
        
        Test.startTest();
        List<List<SObject>> members = SearchHelper.searchMembers(TestDataFactory.TEST_VALUE);
        Test.stopTest();
        System.assertEquals(3, members.size(), INVALID_MEMBERS_AMOUNT);
        
        System.assertEquals(0, members[0].size(), INVALID_USERS_AMOUNT);
        System.assertEquals(0, members[1].size(), INVALID_CONTACTS_AMOUNT);
        
        List<Lead> leads = (List<Lead>) members[2];
        System.assertEquals(1, leads.size(), INVALID_LEADS_AMOUNT);
    }
}