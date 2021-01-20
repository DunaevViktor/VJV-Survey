public with sharing class AnswerController {

    private static final String ERROR_INSERTING_ANSWER = 'Error occurred inserting answer record/records.';
    
    @AuraEnabled
    public static Id saveAnswer(Answer__c answer) {
        try {
            insert answer;  
            return answer.Id;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData('SaveAnswerException', e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }

    @AuraEnabled
    public static void saveAnswers(Answer__c[] answers) {
        try {
            insert answers;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData('SaveAnswersException', 'Error occured saving answers.');
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }
}
