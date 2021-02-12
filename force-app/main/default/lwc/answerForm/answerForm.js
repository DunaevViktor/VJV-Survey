import { LightningElement, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { label } from "./labels.js";
import getRelatedObjectId from "@salesforce/apex/RelatedObjectController.getRelatedObjectIdByStandardObjectId";
import getQuestions from "@salesforce/apex/AnswerFormController.getQuestions";
import saveGroupAnswer from "@salesforce/apex/GroupAnswerController.saveGroupAnswer";
import saveAnswers from "@salesforce/apex/AnswerController.saveAnswers";
import { surveyFields, groupAnswerFields } from "c/fieldService";

import {
  FIELDS,
  sortQuestionsByPosition,
  checkDependentQuestion,
  initQuestionFields,
  createAnswers
} from "./answerFormHelper";

export default class AnswerForm extends NavigationMixin(LightningElement) {
  currentPageReference;
  urlStateParameters;
  surveyId;
  connectedSurveyId;
  linkedRecordId;

  label = label;

  NAVIGATION_TYPE = "standard__namedPage";
  REDIRECT_PAGE_NAME = "home";

  @track showSurvey = true;
  @track answerInputs = [];

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlStateParameters = currentPageReference.state;
      this.setParametersBasedOnUrl();
    }
  }

  @wire(getRecord, { recordId: "$surveyId", fields: FIELDS })
  survey;

  @wire(getQuestions, { surveyId: "$surveyId" })
  questions({ data, error }) {
    if (data) {
      this.answerInputs = initQuestionFields(this.answerInputs, data);
      this.answerInputs = sortQuestionsByPosition(this.answerInputs);
    }
    if (error) {
      this.showToast(label.errorMessage);
    }
  }

  get surveyTitle() {
    return this.survey.data.fields[surveyFields.NAME].value;
  }

  get surveyDescription() {
    return this.survey.data.fields[surveyFields.DESCRIPTION].value;
  }

  get surveyLogo() {
    return this.survey.data.fields[surveyFields.LOGO].value;
  }

  get backgroundColor() {
    return (
      "background-color: " +
      this.survey.data.fields[surveyFields.BACKGROUND].value +
      ";"
    );
  }

  get relatedSurveyId() {
    return this.survey.data.fields[surveyFields.RELATED].value;
  }

  getConnectedSurveyId() {
    if (this.relatedSurveyId) {
      this.surveyId = this.relatedSurveyId;
    } else {
      this.showSurvey = false;
      this.navigateToHomePage();
    }
  }

  setParametersBasedOnUrl() {
    this.surveyId = this.urlStateParameters.c__surveyId;
    this.linkedRecordId = this.urlStateParameters.c__linkedRecordId;
  }

  handleAnswerChange(event) {
    checkDependentQuestion(event, this.answerInputs);
  }

  saveAnswers(groupAnswerId) {
    let answers = createAnswers(this.answerInputs, groupAnswerId);

    saveAnswers({ answers: answers })
      .then(() => {
        this.showToast(label.successfulAnswerSave);
        this.getConnectedSurveyId();
      })
      .catch(() => {
        this.showToast(label.errorMessage);
      });
  }

  createGroupAnswer() {
    if (this.validateFields()) {
      const groupAnswer = { SObjectType: "Group_Answer__c" };
      const surveyId = this.survey.data.fields[surveyFields.ID].value;
      groupAnswer[groupAnswerFields.SURVEY] = surveyId;

      this.getRelatedObject(groupAnswer);
    }
  }

  getRelatedObject(groupAnswer) {
    if (this.linkedRecordId !== null && this.linkedRecordId !== undefined) {
      groupAnswer[groupAnswerFields.LINKED] = true;

      getRelatedObjectId({ standardObjectId: this.linkedRecordId })
        .then((result) => {
          groupAnswer[groupAnswerFields.RELATED] = result;
          this.saveGroupAnswer(groupAnswer);
        })
        .catch(() => {
          this.showToast(label.errorMessage);
        });
    } else {
      groupAnswer[groupAnswerFields.LINKED] = false;
      this.saveGroupAnswer(groupAnswer);
    }
  }

  saveGroupAnswer(groupAnswer) {
    saveGroupAnswer({ groupAnswer: groupAnswer })
      .then((result) => {
        this.saveAnswers(result);
      })
      .catch(() => {
        this.showToast(label.errorMessage);
      });
  }

  showToast(message) {
    const event = new ShowToastEvent({
      title: message
    });
    this.dispatchEvent(event);
  }

  validateFields() {
    const allValid = [
      ...this.template.querySelectorAll("c-single-question")
    ].reduce(function (validSoFar, inputCmp) {
      const isValid = inputCmp.validate();
      return validSoFar && isValid;
    }, true);

    return allValid;
  }

  handleCancel() {
    this.navigateToHomePage();
  }

  navigateToHomePage() {
    this[NavigationMixin.Navigate]({
      type: this.NAVIGATION_TYPE,
      attributes: {
        pageName: this.REDIRECT_PAGE_NAME
      }
    });
  }
}