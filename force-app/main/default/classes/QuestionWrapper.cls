public with sharing class QuestionWrapper {
    @AuraEnabled public Question__c question;
    @AuraEnabled public List<Question_Option__c> options;

    public QuestionWrapper(Question__c question, List<Question_Option__c> options) {
        this.question = question;
        this.options = options;
    }
}
