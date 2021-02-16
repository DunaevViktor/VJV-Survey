public inherited sharing class GroupAnswerController {
    
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
}