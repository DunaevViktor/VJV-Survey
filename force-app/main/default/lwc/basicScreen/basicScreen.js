import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { labels } from './labels';

export default class BasicScreen extends LightningElement {
  @track survey;
  
  label = labels;

  @api 
  set surveyData(data) {
    this.survey = JSON.parse(JSON.stringify(data));
  }

  get surveyData() {
    return this.survey;
  }

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
    if (!this.survey) {
      this.survey = {
        Name: '',
        Background_Color__c: '',
        Logo__c: ''
      };
    }
  }

  handleNameChange(event) {
    this.survey.Name = event.target.value;
  }

  handleColorChange(event) {
    this.survey.Background_Color__c = event.target.value;
  }

  handleImageUpdate(event) {
    this.survey.Logo__c = event.detail.imageUrl;
  }

  clickNextButton() {
    const navigateNextEvent = new FlowNavigationNextEvent();
    if (this.validateInput()) {
      this.updateSurveyData();
      this.dispatchEvent(navigateNextEvent);
    }
  }

  updateSurveyData() {
    const changeSurveyDataEvent = new FlowAttributeChangeEvent("surveydatachange", this.surveyData);
    this.dispatchEvent(changeSurveyDataEvent);
  }
}