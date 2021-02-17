public with sharing class SearchHelper {
    @AuraEnabled(cacheable=true)
    public static List<List<SObject>> searchMembers(String searchTerm) {
        List<List<SObject>> members = new List<List<SObject>>();
        if (String.isNotBlank(searchTerm)) {
            List<List<SObject>> searchResults = [
                FIND :searchTerm
                IN NAME FIELDS 
                RETURNING User (Id, Name), Contact (Id, Name), Lead (Id, Name)
                LIMIT 2000
            ];
            members = searchResults;
        }
        return members;
    }
}