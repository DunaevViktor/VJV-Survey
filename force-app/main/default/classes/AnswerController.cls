public with sharing class AnswerController {

    private static final String ERROR_INSERTING_ANSWER = 'Error occurred inserting answer record/records.';
    
    @AuraEnabled(cacheable=true)
    public static void saveAnswer(Answer__c answer) {
        try {
            insert answer;
        } catch(DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
            throw new CustomDatabaseException(ERROR_INSERTING_ANSWER, e);
        }
    }

    @AuraEnabled(cacheable=true)
    public static void saveAnswers(Answer__c[] answers) {
        try {
            insert answers;
        } catch(DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
            throw new CustomDatabaseException(ERROR_INSERTING_ANSWER, e);
        }
    }
}
