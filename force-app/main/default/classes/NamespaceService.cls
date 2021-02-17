public with sharing class NamespaceService {
    
    private static final String TOKEN_SOBJECT_NAME = 'Survey__c';
    public static String namespacePrefix {get; set;}

    static {
        Integer indexOfToken = -1;
        String namespsacePref = '';
        for ( Schema.SObjectType typ : Schema.getGlobalDescribe().values() ) {
            String sobjName = String.valueOf(typ);
            if (sobjName != null) {
                indexOfToken = sobjName.indexOf(TOKEN_SOBJECT_NAME);
            }
            if (indexOfToken != -1) {
                namespsacePref = sobjName.substring(0, indexOfToken);
                break;
            }
        }
        namespacePrefix = namespsacePref;
    }
}