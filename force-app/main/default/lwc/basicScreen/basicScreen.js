import { LightningElement, api, track } from "lwc";
import uploadImage from "@salesforce/apex/ImageUploadController.uploadImage";
import deleteImageById from "@salesforce/apex/ImageUploadController.deleteImageById";
import getDefaultBackgroundColor from "@salesforce/apex/SurveySettingController.getDefaultBackgroundColor";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import { createSurveyDisplayedMap } from "./basicScreenHelper.js";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { labels } from './labels';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { surveyFields } from "c/fieldService";

export default class BasicScreen extends LightningElement {
  @track survey;
  @track loading = false;
  @track logoData;
  @track logoId;
  @track isError = false;

  @track isHasSurveys = false;
  @track displayedSurveys = [];
  @track isConnectToSurvey;
  
  surveyId = "";
  
  label = labels;
  imageName;
  imageBlobUrl;
  isNewLogo = false;
  
  errorVariant = 'error';

  @api 
  set surveyData(data) {
    this.survey = JSON.parse(JSON.stringify(data));
    this.isConnectToSurvey = this.survey[surveyFields.RELATED] !== undefined;
    if(this.isConnectToSurvey) this.surveyId = this.survey[surveyFields.RELATED] ;
  }

  get surveyData() {
    return this.survey;
  }

  @api 
  set logoDocumentId(data) {
    this.logoId = data;
  }

  get surveys() {
    return this.displayedSurveys;
  }

  @api set surveys(value) {
    this.displayedSurveys = JSON.parse(JSON.stringify(value));
  }

  get logoDocumentId() {
    return this.logoId;
  }

  get surveyName() {
    return this.survey[surveyFields.NAME];
  }

  get surveyBackground() {
    return this.survey[surveyFields.BACKGROUND];
  }

  get surveyLogo() {
    return this.survey[surveyFields.LOGO];
  }

  get surveyDescription() {
    return this.survey[surveyFields.DESCRIPTION];
  }

  get isStandardSurvey() {
    return this.survey[surveyFields.STANDARD];
  }

  get surveyOptions() {
    return createSurveyDisplayedMap(this.displayedSurveys);
  }

  connectedCallback() {
    this.setDefaultSurveyData();

    this.initSurveys();
    this.isHasSurveys = this.displayedSurveys.length > 0;
  }

  initSurveys() {
    if (this.displayedSurveys.length === 0) {
        getSurveys()
            .then((result) => {
                this.displayedSurveys = result.length > 0 ? result : [];
                this.isHasSurveys = this.displayedSurveys.length > 0;
            })
            .catch(() => {
                this.isError = true;
            });
    }
  }

  validateInput() {
    const input = this.template.querySelector(".survey-name");

    if(input.value.trim().length === 0) {
      input.value = '';
      input.setCustomValidity(this.label.complete_this_field);
      input.reportValidity();
      return false;
    }

    input.setCustomValidity('');
    input.reportValidity();
    return input.checkValidity();
  }

  setDefaultSurveyData() {
    if (!this.survey) {
      this.survey = {};
      this.setDefaultBackgroundColor();
    }

    if (!this.logoId) {
      this.logoId = null;
    }
  }

  setDefaultBackgroundColor() {
    getDefaultBackgroundColor()
      .then(result => {
        this.survey[surveyFields.BACKGROUND] = result;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleNameChange(event) {
    this.survey[surveyFields.NAME] = event.target.value;
  }

  handleColorChange(event) {
    this.survey[surveyFields.BACKGROUND] = event.target.value;
  }

  handleDescriptionChange(event) {
    this.survey[surveyFields.DESCRIPTION] = event.target.value;
  }

  handleIsStandardSurveyChange(event) {
    this.survey[surveyFields.STANDARD] = event.target.checked;
  }

  handleImageUpdate(event) {
    this.imageName = event.detail.imageName;
    this.imageBlobUrl = event.detail.imageUrl;
    if (this.imageName && this.imageBlobUrl) {
      this.isNewLogo = true;
    } else {
      this.isNewLogo = false;
      this.survey[surveyFields.LOGO] = '';
    }
  }

  handleConnectToAnotherSurveyChange(event) {
    this.isConnectToSurvey = event.target.checked;
    if (!this.isConnectToSurvey) {
        this.surveyId = "";
        this.survey[surveyFields.RELATED] = undefined;
    }
  }

  handleSurveyChange(event) {
    this.survey[surveyFields.RELATED] = event.detail.value;
    this.surveyId = event.detail.value;
  }
  
  saveLogo() {
    const base64 = "base64,";
    const imageBase64 = this.imageBlobUrl.substr(this.imageBlobUrl.indexOf(base64) + base64.length);
    return uploadImage({
      imageName: this.imageName,
      imageBase64Data: imageBase64,
      imageDocumentId: this.logoDocumentId
    });
  }

  clickNextButton() {
    if (this.validateInput()) {
      const navigateNextEvent = new FlowNavigationNextEvent();
      if (this.isNewLogo) {
        this.loading = true;

        this.saveLogo().
          then(result => {
            this.loading = false;
            this.logoData = JSON.parse(result);
            this.logoId = this.logoData.imageDocumentId;
            this.survey[surveyFields.LOGO] = this.logoData.imageUrl;
            this.updateSurveyData();
          }).
          then(() => {
            this.dispatchEvent(navigateNextEvent);
          }).
          catch(() => {
            this.loading = false;
            this.showToastEvent(this.label.unable_to_continue, this.errorVariant, this.label.failed_image_upload)
          });
      } else {
        this.updateSurveyData();
        this.dispatchEvent(navigateNextEvent);
      }
    }
  }

  showToastEvent(title, variant, message) {
    const event = new ShowToastEvent({
      title: title,
      variant: variant,
      message: message,
    });
    this.dispatchEvent(event);
  }

  deleteImage() {
    deleteImageById({ 
      imageDocumentId: this.logoDocumentId 
    }).
      catch(() => {
        this.showToastEvent(this.label.unable_to_continue, this.errorVariant, this.label.failed_image_delete);
      });
    this.logoId = '';
  }

  updateSurveyData() {
    const changeLogoIdEvent = new FlowAttributeChangeEvent("logoidchange", this.logoDocumentId);
    this.dispatchEvent(changeLogoIdEvent);

    if (this.logoId && !this.survey[surveyFields.LOGO]) {
      this.deleteImage();
    }
  }
}