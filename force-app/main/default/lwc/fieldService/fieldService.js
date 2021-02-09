import SURVEY_NAME_FIELD from '@salesforce/schema/Survey__c.Name';
import SURVEY_BACKGROUND_FIELD from '@salesforce/schema/Survey__c.Background_Color__c';
import SURVEY_LOGO_FIELD from '@salesforce/schema/Survey__c.Logo__c';
import SURVEY_DESCRIPTION_FIELD from '@salesforce/schema/Survey__c.Description__c';

const surveyFields = {
    NAME: SURVEY_NAME_FIELD.fieldApiName,
    BACKGROUND: SURVEY_BACKGROUND_FIELD.fieldApiName,
    LOGO: SURVEY_LOGO_FIELD.fieldApiName,
    DESCRIPTION: SURVEY_DESCRIPTION_FIELD.fieldApiName
}

export {
    surveyFields
}