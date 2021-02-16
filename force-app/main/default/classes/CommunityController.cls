public inherited sharing class CommunityController {
  @AuraEnabled
  public static String getCommunityUrl(String communityName){
    Site communitySite = [SELECT Id 
                          FROM Site 
                          WHERE Name = :communityName
                          WITH SECURITY_ENFORCED
                          LIMIT 1];
    SiteDetail communitySiteDetail = [SELECT SecureURL 
                                      FROM SiteDetail 
                                      WHERE DurableId = :communitySite.Id
                                      WITH SECURITY_ENFORCED
                                      LIMIT 1];
    return communitySiteDetail.SecureURL;
  }
}
