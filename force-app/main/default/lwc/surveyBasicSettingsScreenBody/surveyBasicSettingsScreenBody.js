import { LightningElement, api, track } from "lwc";

export default class SurveyMainSettings extends LightningElement {
  @api existingSurvey;

  @track survey;

  connectedCallback() {
    this.updateSurveyData();
  }

  updateSurveyData() {
    if (this.existingSurvey) {
      this.survey = { ...this.existingSurvey };
    } else {
      this.survey = {
        Name: '',
        Background_Color__c: '',
        Logo__c: ''
      };
    }
  }

  handleNameChange(event) {
    this.survey.Name = event.target.value;
    this.dispatchSurveyData();
  }

  handleColorChange(event) {
    this.survey.Background_Color__c = event.target.value;
    this.dispatchSurveyData();
  }

  handleImageUpdate(event) {
    this.survey.Logo__c = event.detail.imageUrl;
    this.dispatchSurveyData();
  }

  dispatchSurveyData() {
    const changeDataEvent = new CustomEvent("surveydatachange", {
      detail: { survey: this.survey }
    });
    this.dispatchEvent(changeDataEvent);
  }
}
