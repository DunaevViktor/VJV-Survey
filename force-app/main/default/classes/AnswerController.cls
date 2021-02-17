public with sharing class AnswerController {

    private static final String SAVE_ANSWERS_EXCEPTION = 'SaveAnswersException';
    
    @AuraEnabled
    public static void saveAnswersPartially(List<Answer__c> answers) {
        Database.SaveResult[] saveResultList = Database.insert(answers, false);
        System.debug(saveResultList);
    }

    @AuraEnabled
    public static void saveAnswers(List<Answer__c> answers) {
        try {
            insert answers;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData(SAVE_ANSWERS_EXCEPTION, e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }
}