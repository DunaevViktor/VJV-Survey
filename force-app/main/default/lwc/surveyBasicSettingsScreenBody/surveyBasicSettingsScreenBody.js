import { LightningElement, api, track } from "lwc";

import survey_name from "@salesforce/label/c.survey_name";
import survey_bg_color from "@salesforce/label/c.survey_bg_color";
import previous from "@salesforce/label/c.previous";
import next from "@salesforce/label/c.next";

export default class SurveyMainSettings extends LightningElement {
  @api existingSurvey;

  @track survey;

  label = {
    survey_name,
    survey_bg_color,
    previous,
    next
  };

  connectedCallback() {
    this.updateSurveyData();
  }

  validateInput() {
    const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
      .reduce((validSoFar, inputField) => {
        inputField.reportValidity();
        return validSoFar && inputField.checkValidity();
      }, true);
    return isInputsCorrect;
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

  clickNextButton() {
    const nextEvent = new CustomEvent("next", {});
    if (this.validateInput()) {
      this.dispatchEvent(nextEvent);
    }
  }

  dispatchSurveyData() {
    const changeDataEvent = new CustomEvent("surveydatachange", {
      detail: { survey: this.survey }
    });
    this.dispatchEvent(changeDataEvent);
  }
}
