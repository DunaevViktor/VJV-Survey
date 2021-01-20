public with sharing class AnswerController {
    
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
            CustomExceptionData excData = new CustomExceptionData('SaveAnswersException', e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }
}
