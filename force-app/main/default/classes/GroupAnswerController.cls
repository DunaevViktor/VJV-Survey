public with sharing class GroupAnswerController {
    
    @AuraEnabled
    public static Id saveGroupAnswer(Group_Answer__c groupAnswer) {
        try {
            insert groupAnswer;  
            return groupAnswer.Id;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData('SaveGroupAnswerException', e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }

    @AuraEnabled
    public static void saveGroupAnswers(Group_Answer__c[] groupAnswers) {
        try {
            insert groupAnswers;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData('SaveGroupAnswersException', e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }
}
