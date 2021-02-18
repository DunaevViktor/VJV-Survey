public inherited sharing class GroupAnswerController {

    private static final String SAVE_GROUP_ANSWER_EXCEPTION = 'SaveGroupAnswerException';
    
    @AuraEnabled
    public static Id saveGroupAnswer(Group_Answer__c groupAnswer) {
        try {
            insert groupAnswer;  
            return groupAnswer.Id;
        } catch(DmlException e) {
            CustomExceptionData excData = new CustomExceptionData(SAVE_GROUP_ANSWER_EXCEPTION, e.getMessage());
            throw new AuraHandledException(JSON.serialize(excData));
        }
    }
}