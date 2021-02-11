import SURVEY_OBJECT from '@salesforce/schema/Survey__c';
import TRIGGER_RULE_OBJECT from '@salesforce/schema/Trigger_Rule__c';

import SURVEY_ID_FIELD from '@salesforce/schema/Survey__c.Id';
import SURVEY_NAME_FIELD from '@salesforce/schema/Survey__c.Name';
import SURVEY_BACKGROUND_FIELD from '@salesforce/schema/Survey__c.Background_Color__c';
import SURVEY_LOGO_FIELD from '@salesforce/schema/Survey__c.Logo__c';
import SURVEY_DESCRIPTION_FIELD from '@salesforce/schema/Survey__c.Description__c';
import SURVEY_RELATED_FIELD from '@salesforce/schema/Survey__c.Related_To__c';
import SURVEY_STANDARD_FIELD from '@salesforce/schema/Survey__c.IsStandard__c';
import SURVEY_URL_FIELD from '@salesforce/schema/Survey__c.Url__c';

import QUESTION_ID_FIELD from '@salesforce/schema/Question__c.Id';
import QUESTION_REUSABLE_FIELD from '@salesforce/schema/Question__c.IsReusable__c';
import QUESTION_VISIBLE_FIELD from '@salesforce/schema/Question__c.IsVisible__c';
import QUESTION_LABEL_FIELD from '@salesforce/schema/Question__c.Label__c';
import QUESTION_POSITION_FIELD from '@salesforce/schema/Question__c.Position__c';
import QUESTION_NAME_FIELD from '@salesforce/schema/Question__c.Name';
import QUESTION_REQUIRED_FIELD from '@salesforce/schema/Question__c.Required__c';
import QUESTION_SURVEY_FIELD from '@salesforce/schema/Question__c.Survey__c';
import QUESTION_TYPE_FIELD from '@salesforce/schema/Question__c.Type__c';
// import QUESTION_OPTIONS_FIELD from '@salesforce/schema/Question__c.Question_Options__r.value';
// import QUESTION_VALIDATIONS_FIELD from '@salesforce/schema/Question__c.Related_Question_Validations__r';

import OPTION_ID_FIELD from '@salesforce/schema/Question_Option__c.Id';
import OPTION_QUESTION_FIELD from '@salesforce/schema/Question_Option__c.Question__c';
import OPTION_NAME_FIELD from '@salesforce/schema/Question_Option__c.Name';
import OPTION_VALUE_FIELD from '@salesforce/schema/Question_Option__c.Value__c';

import VALIDATION_ID_FIELD from '@salesforce/schema/Validation__c.Id';
import VALIDATION_DEPENDANT_FIELD from '@salesforce/schema/Validation__c.Dependent_Question__c';
import VALIDATION_OPERATOR_FIELD from '@salesforce/schema/Validation__c.Operator__c';
import VALIDATION_RELATED_FIELD from '@salesforce/schema/Validation__c.Related_Question__c';
import VALIDATION_NAME_FIELD from '@salesforce/schema/Validation__c.Name';
import VALIDATION_VALUE_FIELD from '@salesforce/schema/Validation__c.Value__c';

import RULE_ID_FIELD from '@salesforce/schema/Trigger_Rule__c.Id';
import RULE_FIELD_NAME_FIELD from '@salesforce/schema/Trigger_Rule__c.Field_Name__c';
import RULE_VALUE_FIELD from '@salesforce/schema/Trigger_Rule__c.Field_Value__c';
import RULE_API_FIELD from '@salesforce/schema/Trigger_Rule__c.Object_Api_Name__c';
import RULE_OPERATOR_FIELD from '@salesforce/schema/Trigger_Rule__c.Operator__c';
import RULE_SURVEY_FIELD from '@salesforce/schema/Trigger_Rule__c.Survey__c';

import RECEIVER_ID_FIELD from '@salesforce/schema/Email_Receiver__c.Id';
import RECEIVER_NAME_FIELD from '@salesforce/schema/Email_Receiver__c.Name';
import RECEIVER_TYPE_FIELD from '@salesforce/schema/Email_Receiver__c.Type__c';
import RECEIVER_VALUE_FIELD from '@salesforce/schema/Email_Receiver__c.Value__c';
import RECEIVER_SURVEY_FIELD from '@salesforce/schema/Email_Receiver__c.Survey__c';

import ANSWER_ID_FIELD from '@salesforce/schema/Answer__c.Id';
import ANSWER_GROUP_FIELD from '@salesforce/schema/Answer__c.Group_Answer__c';
import ANSWER_QUESTION_FIELD from '@salesforce/schema/Answer__c.Question__c';
import ANSWER_VALUE_FIELD from '@salesforce/schema/Answer__c.Value__c';

import GROUP_ANSWER_ID_FIELD from '@salesforce/schema/Group_Answer__c.Id';
import GROUP_ANSWER_LINKED_FIELD from '@salesforce/schema/Group_Answer__c.IsLinked__c';
import GROUP_ANSWER_RELATED_FIELD from '@salesforce/schema/Group_Answer__c.Related_To__c';
import GROUP_ANSWER_SURVEY_FIELD from '@salesforce/schema/Group_Answer__c.Survey__c';

const surveyObject = SURVEY_OBJECT.objectApiName;
const triggerRuleObject = TRIGGER_RULE_OBJECT.objectApiName;

const surveyFields = {
    ID: SURVEY_ID_FIELD.fieldApiName,
    NAME: SURVEY_NAME_FIELD.fieldApiName,
    BACKGROUND: SURVEY_BACKGROUND_FIELD.fieldApiName,
    LOGO: SURVEY_LOGO_FIELD.fieldApiName,
    DESCRIPTION: SURVEY_DESCRIPTION_FIELD.fieldApiName,
    RELATED: SURVEY_RELATED_FIELD.fieldApiName,
    STANDARD: SURVEY_STANDARD_FIELD.fieldApiName,
    URL: SURVEY_URL_FIELD.fieldApiName,
}

const questionFields = {
    ID: QUESTION_ID_FIELD.fieldApiName,
    REUSABLE: QUESTION_REUSABLE_FIELD.fieldApiName,
    VISIBLE: QUESTION_VISIBLE_FIELD.fieldApiName,
    LABEL: QUESTION_LABEL_FIELD.fieldApiName,
    POSITION: QUESTION_POSITION_FIELD.fieldApiName,
    NAME: QUESTION_NAME_FIELD.fieldApiName,
    REQUIRED: QUESTION_REQUIRED_FIELD.fieldApiName,
    SURVEY: QUESTION_SURVEY_FIELD.fieldApiName,
    TYPE: QUESTION_TYPE_FIELD.fieldApiName,
    OPTIONS: 'Question_Options__r',
    VALIDATIONS: 'Related_Question_Validations__r',
}

const optionFields = {
    ID: OPTION_ID_FIELD.fieldApiName,
    QUESTION: OPTION_QUESTION_FIELD.fieldApiName,
    NAME: OPTION_NAME_FIELD.fieldApiName,
    VALUE: OPTION_VALUE_FIELD.fieldApiName,
}

const validationFields = {
    ID: VALIDATION_ID_FIELD.fieldApiName,
    DEPENDANT: VALIDATION_DEPENDANT_FIELD.fieldApiName,
    OPERATOR: VALIDATION_OPERATOR_FIELD.fieldApiName,
    RELATED: VALIDATION_RELATED_FIELD.fieldApiName,
    NAME: VALIDATION_NAME_FIELD.fieldApiName,
    VALUE: VALIDATION_VALUE_FIELD.fieldApiName,
}

const ruleFields = {
    ID: RULE_ID_FIELD.fieldApiName,
    FIELD: RULE_FIELD_NAME_FIELD .fieldApiName,
    VALUE: RULE_VALUE_FIELD.fieldApiName,
    API: RULE_API_FIELD.fieldApiName,
    OPERATOR: RULE_OPERATOR_FIELD.fieldApiName,
    SURVEY: RULE_SURVEY_FIELD.fieldApiName,
}

const receiverFields = {
    ID: RECEIVER_ID_FIELD.fieldApiName,
    NAME: RECEIVER_NAME_FIELD.fieldApiName,
    TYPE: RECEIVER_TYPE_FIELD.fieldApiName,
    VALUE: RECEIVER_VALUE_FIELD.fieldApiName,
    SURVEY: RECEIVER_SURVEY_FIELD.fieldApiName,
}

const answerFields = {
    ID: ANSWER_ID_FIELD.fieldApiName,
    GROUP: ANSWER_GROUP_FIELD.fieldApiName,
    QUESION: ANSWER_QUESTION_FIELD.fieldApiName,
    VALUE: ANSWER_VALUE_FIELD.fieldApiName,
}

const groupAnswerFields = {
    ID: GROUP_ANSWER_ID_FIELD.fieldApiName,
    LINKED: GROUP_ANSWER_LINKED_FIELD.fieldApiName,
    RELATED: GROUP_ANSWER_RELATED_FIELD.fieldApiName,
    SURVEY: GROUP_ANSWER_SURVEY_FIELD.fieldApiName,
}

export {
    surveyObject,
    triggerRuleObject,
    surveyFields,
    questionFields,
    optionFields,
    validationFields,
    ruleFields,
    receiverFields,
    answerFields,
    groupAnswerFields,
}