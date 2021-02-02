import { LightningElement, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { label } from "./labels.js";
import getQuestions from "@salesforce/apex/AnswerFormController.getQuestions";
import getConnectedSurvey from "@salesforce/apex/AnswerFormController.getConnectedSurveyId";
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
  error;

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
      this.error = error;
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

  getConnectedSurveyId() {
    getConnectedSurvey({ surveyId: this.surveyId })
      .then((result) => {
        if (result) {
          this.surveyId = result;
          this.showSurvey = true;
        } else {
          this.showSurvey = false;
        }
      })
      .catch((error) => {
        this.connectedSurveyId = undefined;
        this.error = error;
      });
  }

  setParametersBasedOnUrl() {
    this.surveyId = this.urlStateParameters.c__surveyId;
    this.linkedRecordId = this.urlStateParameters.c__linkedRecordId;
  }

  handleAnswerChange(event) {
    checkDependentQuestion(event, this.answerInputs);
  }

  saveAnswers(groupAnswerId) {
    let answers = createAnswers(
      this.answerInputs,
      groupAnswerId,
      this.linkedRecordId
    );

    saveAnswers({ answers: answers })
      .then(() => {
        this.showToast();
        this.getConnectedSurveyId();
      })
      .catch((error) => {
        this.error = error;
      });
  }

  saveGroupAnswer() {
    if (this.validateFields()) {
      let groupAnswer = { SObjectType: "Group_Answer__c" };
      const surveyId = this.survey.data.fields.Id.value;
      groupAnswer.Survey__c = surveyId;

      if (this.linkedRecordId !== null) {
        groupAnswer.IsLinked__c = true;
        groupAnswer.Related_To__c = this.linkedRecordId;
      }

      saveGroupAnswer({ groupAnswer: groupAnswer })
        .then((result) => {
          this.saveAnswers(result);
        })
        .catch((error) => {
          this.error = error;
        });
    }
  }

  showToast() {
    const event = new ShowToastEvent({
      title: label.successfulAnswerSave
    });
    this.dispatchEvent(event);
  }

  validateFields() {
    const allValid = [
      ...this.template.querySelectorAll("c-single-question")
    ].reduce(function (validSoFar, inputCmp) {
      return validSoFar && inputCmp.validate();
    }, true);

    return allValid;
  }

  handleCancel() {
    this.showSurvey = false;
  }
}