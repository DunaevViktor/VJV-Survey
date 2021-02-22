public with sharing class CommunityController {

  private static final String NETWORK_OBJECT_NAME = 'Network';

  @AuraEnabled
  public static String getCommunityUrl(String communityName){
    try {
        SObject site = Database.query('SELECT Id, Name' +
                                      + 'FROM Network' +
                                      + 'WHERE Name = ' + communityName +
                                      + 'WITH SECURITY_ENFORCED' +
                                      + 'LIMIT 1');
    
      ConnectApi.Community community = ConnectApi.Communities.getCommunity(site.Id);
      String pageUrl = community.siteUrl;
      pageUrl += community.siteAsContainerEnabled ? '/s/' : '';
      return pageUrl;
    } catch(QueryException e) {
        System.debug(e);
    }
    return null;
  }
}
