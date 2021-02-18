public with sharing class QuestionWrapper {
    @AuraEnabled public Question__c question;
    @AuraEnabled public List<Question_Option__c> options;
    @AuraEnabled public List<Validation__c> validations;

    public QuestionWrapper(Question__c question, List<Question_Option__c> options) {
        this.question = question;
        this.options = options;
    }

    public QuestionWrapper(Question__c question, List<Question_Option__c> options, List<Validation__c> validations){
        this.question = question;
        this.options = options;
        this.validations = validations;
    }
}