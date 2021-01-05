import { LightningElement, api, track } from "lwc";
import getSurveyData from "@salesforce/apex/SurveySettingsController.getSurveyData";
import { createRecord } from "lightning/uiRecordApi";

export default class SurveyMainSettings extends LightningElement {
  @api surveyId;

  @track surveyName;
  @track logoSrc;
  @track surveyColor = "#5679c0";

  connectedCallback() {
    this.loadSurveyData();
  }

  loadSurveyData() {
    getSurveyData({
      surveyId: this.surveyId
    }).then((result) => {
      if (result) {
        this.surveyName = result.Name;
        this.logoSrc = result.Logo__c;
        this.template
          .querySelector("c-image-upload")
          .updateImageUrl(this.logoSrc);
        this.surveyColor = result.Background_Color__c;
      }
    });
  }

  handleNameChange(event) {
    this.surveyName = event.target.value;
    const changeNameEvent = new CustomEvent("namechange", {
      detail: { name: this.surveyName }
    });
    this.dispatchEvent(changeNameEvent);
  }

  handleColorChange(event) {
    this.surveyColor = event.target.value;
    const changeColorEvent = new CustomEvent("colorchange", {
      detail: { color: this.surveyColor }
    });
    this.dispatchEvent(changeColorEvent);
  }

  handleImageUpdate(event) {
    this.logoSrc = event.detail.imageUrl;
  }
}
