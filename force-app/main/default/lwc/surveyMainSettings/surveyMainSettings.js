import { LightningElement, api, track } from "lwc";
import getSurveyData from "@salesforce/apex/SurveySettingsController.getSurveyData";

export default class SurveyMainSettings extends LightningElement {
  @api surveyId;

  @track surveyName;
  @track surveyLogoData;
  @track surveyColor;

  @track logoType = "image/png";
  @track error;

  connectedCallback() {
    this.loadSurveyData();
  }

  loadSurveyData() {
    getSurveyData({
      surveyId: this.surveyId
    }).then((result) => {
      if (result) {
        this.surveyName = result.Name;
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

  handleLogoChange(event) {
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      let fileBlobContent = reader.result;
      let base64 = "base64,";
      let base64Content = fileBlobContent.substring(
        fileBlobContent.indexOf(base64) + base64.length
      );
      this.surveyLogoData = encodeURIComponent(base64Content);
    };
    reader.readAsDataURL(file);
    const changeLogoEvent = new CustomEvent("logochange", {
      detail: { logoData: this.surveyLogoData }
    });
    this.dispatchEvent(changeLogoEvent);
  }
}
