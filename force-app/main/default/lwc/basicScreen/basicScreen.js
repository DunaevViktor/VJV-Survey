import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { labels } from './labels';

export default class BasicScreen extends LightningElement {
  @api survey;

  @track surveyData = this.survey;

  label = labels;

  connectedCallback() {
    this.setDefaultSurveyData();
  }

  validateInput() {
    const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
      .reduce((validSoFar, inputField) => {
        inputField.reportValidity();
        return validSoFar && inputField.checkValidity();
      }, true);
    return isInputsCorrect;
  }

  setDefaultSurveyData() {
    if (this.survey) {
      this.surveyData = { ...this.survey };
    } else {
      this.surveyData = {
        Name: '',
        Background_Color__c: '',
        Logo__c: ''
      };
    }
  }

  handleNameChange(event) {
    this.surveyData.Name = event.target.value;
  }

  handleColorChange(event) {
    this.surveyData.Background_Color__c = event.target.value;
  }

  handleImageUpdate(event) {
    this.surveyData.Logo__c = event.detail.imageUrl;
  }

  clickNextButton() {
    const navigateNextEvent = new FlowNavigationNextEvent();
    if (this.validateInput()) {
      this.updateSurveyData();
      this.dispatchEvent(navigateNextEvent);
    }
  }

  updateSurveyData() {
    this.survey = { ...this.surveyData };
    const changeSurveyDataEvent = new FlowAttributeChangeEvent("surveydatachange", this.survey);
    this.dispatchEvent(changeSurveyDataEvent);
  }
}