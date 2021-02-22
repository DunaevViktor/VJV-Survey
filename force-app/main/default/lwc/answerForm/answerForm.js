import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { label } from "./labels.js";
import getSurvey from "@salesforce/apex/SurveyUserController.getSurveyById";
import getRelatedObjectId from "@salesforce/apex/SurveyUserController.getRelatedObjectIdByStandardObjectId";
import getQuestions from "@salesforce/apex/SurveyUserController.getQuestions";
import saveGroupAnswer from "@salesforce/apex/SurveyUserController.saveGroupAnswer";
import saveAnswers from "@salesforce/apex/SurveyUserController.saveAnswers";
import { surveyFields, groupAnswerFields } from "c/fieldService";

import {
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

  NAVIGATION_TYPE = 'standard__namedPage';
  REDIRECT_PAGE_NAME = 'home';
  ERROR_STATE = 'error';
  SUCCESS_STATE = 'success';

  @track showSurvey = true;
  @track answerInputs = [];
  @track survey = {};

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlStateParameters = currentPageReference.state;
      this.setParametersBasedOnUrl();
    }
  }

  connectedCallback() {
    this.getSurveyData();
    this.getSurveyQuestions();
  }

  getSurveyData() {
    getSurvey({surveyId: this.surveyId})
      .then(data => {
        this.survey = data;
      })
      .catch(() => {
        this.showToast(label.errorMessage, this.ERROR_STATE);
      });
  }

  getSurveyQuestions() {
    getQuestions({surveyId: this.surveyId})
      .then(data => {
        this.answerInputs = initQuestionFields(this.answerInputs, data);
        this.answerInputs = sortQuestionsByPosition(this.answerInputs);
      })
      .catch(() => {
        this.showToast(label.errorMessage, this.ERROR_STATE);
      });
  }

  get surveyTitle() {
    return this.survey[surveyFields.NAME];
  }

  get surveyDescription() {
    return this.survey[surveyFields.DESCRIPTION];
  }

  get surveyLogo() {
    return this.survey[surveyFields.LOGO];
  }

  get backgroundColor() {
    return `background-color: ${this.survey[surveyFields.BACKGROUND]};`;
  }

  get relatedSurveyId() {
    return this.survey[surveyFields.RELATED];
  }

  getConnectedSurveyId() {
    if (this.relatedSurveyId) {
      this.surveyId = this.relatedSurveyId;
      return true;
    }
    this.showSurvey = false;
    this.closeTab();
    return false;
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
        if(this.getConnectedSurveyId()){
            this.showToast(label.successfulAnswerSave + label.takeAnotherSurvey, this.SUCCESS_STATE);
        }else{
            this.showToast(label.successfulAnswerSave, this.SUCCESS_STATE);
        }
      })
      .catch(() => {
        this.showToast(label.errorMessage, this.ERROR_STATE);
      });
  }

  createGroupAnswer() {
    if (this.validateFields()) {
      const groupAnswer = {};
      const surveyId = this.survey[surveyFields.ID];
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
          this.showToast(label.errorMessage, this.ERROR_STATE);
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
        this.showToast(label.errorMessage, this.ERROR_STATE);
      });
  }

  showToast(message, state) {
    const event = new ShowToastEvent({
      title: message,
      variant: state
    });
    this.dispatchEvent(event);
  }

  validateFields() {
    const allValid = [
      ...this.template.querySelectorAll('c-single-question')
    ].reduce(function (validSoFar, inputCmp) {
      const isValid = inputCmp.validate();
      return validSoFar && isValid;
    }, true);

    return allValid;
  }

  handleCancel() {
    this.closeTab();
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

  closeTab(){ 
    const close = true;
    const closeTabEvent = new CustomEvent('closetab', {
          detail: { close },
      });

    this.dispatchEvent(closeTabEvent); 
  }
}