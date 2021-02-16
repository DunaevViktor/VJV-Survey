public without sharing class SurveyUserController {
  @AuraEnabled(cacheable=true)
  public static Id getRelatedObjectIdByStandardObjectId(Id standardObjectId) {
    return RelatedObjectController.getRelatedObjectIdByStandardObjectId(standardObjectId);
  }

  @AuraEnabled(cacheable=true)
  public static List<QuestionWrapper> getQuestions(Id surveyId){
    return AnswerFormController.getQuestions(surveyId);
  }

  @AuraEnabled
  public static Id saveGroupAnswer(Group_Answer__c groupAnswer) {
    return GroupAnswerController.saveGroupAnswer(groupAnswer);
  }
  
  @AuraEnabled
  public static void saveAnswers(List<Answer__c> answers) {
    AnswerController.saveAnswers(answers);
  }

  @AuraEnabled(cacheable=false)
  public static Survey__c getSurveyById(Id surveyId) {
    return SurveyController.getSurveyById(surveyId);
  }
}
