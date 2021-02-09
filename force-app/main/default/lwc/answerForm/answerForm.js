import { LightningElement, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { label } from "./labels.js";
import getRelatedObjectId from "@salesforce/apex/RelatedObjectController.getRelatedObjectIdByStandardObjectId";
import getQuestions from "@salesforce/apex/AnswerFormController.getQuestions";
import saveGroupAnswer from "@salesforce/apex/GroupAnswerController.saveGroupAnswer";
import saveAnswers from "@salesforce/apex/AnswerController.saveAnswers";

import {
  FIELDS,
  sortQuestionsByPosition,
  checkDependentQuestion,
  initQuestionFields,
  createAnswers
} from "./answerFormHelper";

export default class AnswerForm extends LightningElement {
  currentPageReference;
  urlStateParameters;
  surveyId;
  connectedSurveyId;
  linkedRecordId;

  label = label;

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

  get title() {
    return this.survey.data.fields.Name.value;
  }

  get description() {
    return this.survey.data.fields.Description__c.value;
  }

  get logo() {
    return this.survey.data.fields.Logo__c.value;
  }

  get backgroundColor() {
    return (
      "background-color: " +
      this.survey.data.fields.Background_Color__c.value +
      ";"
    );
  }

  get relatedSurveyId() {
    return this.survey.data.fields.Related_To__c.value;
  }

  getConnectedSurveyId() {
    if (this.relatedSurveyId) {
      this.surveyId = this.relatedSurveyId;
    } else {
      this.showSurvey = false;
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
      const surveyId = this.survey.data.fields.Id.value;
      groupAnswer.Survey__c = surveyId;

      this.getRelatedObject(groupAnswer);
    }
  }

  getRelatedObject(groupAnswer) {
    if (this.linkedRecordId !== null && this.linkedRecordId !== undefined) {
      groupAnswer.IsLinked__c = true;

      getRelatedObjectId({ standardObjectId: this.linkedRecordId })
        .then((result) => {
          groupAnswer.Related_To__c = result;
          this.saveGroupAnswer(groupAnswer);
        })
        .catch(() => {
          this.showToast(label.errorMessage);
        });
    } else {
        groupAnswer.IsLinked__c = false;
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
    this.showSurvey = false;
  }
}