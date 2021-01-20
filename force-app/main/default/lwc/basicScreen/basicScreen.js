import { LightningElement, api, track } from "lwc";
import uploadImage from "@salesforce/apex/ImageUploadController.uploadImage";
import deleteImageById from "@salesforce/apex/ImageUploadController.deleteImageById";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { labels } from './labels';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BasicScreen extends LightningElement {
  @track survey;
  @track loading = false;
  @track logoData;
  @track logoId;
  
  label = labels;
  imageName;
  imageBlobUrl;
  
  isNewLogo = false;
  
  errorVariant = 'error';

  @api 
  set surveyData(data) {
    this.survey = JSON.parse(JSON.stringify(data));
  }

  get surveyData() {
    return this.survey;
  }

  @api 
  set logoDocumentId(data) {
    this.logoId = data;
  }

  get logoDocumentId() {
    return this.logoId;
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

    if (!this.logoId) {
      this.logoId = null;
    }
  }

  handleNameChange(event) {
    this.survey.Name = event.target.value;
  }

  handleColorChange(event) {
    this.survey.Background_Color__c = event.target.value;
  }

  handleImageUpdate(event) {
    this.imageName = event.detail.imageName;
    this.imageBlobUrl = event.detail.imageUrl;
    if (this.imageName && this.imageBlobUrl) {
      this.isNewLogo = true;
    } else {
      this.isNewLogo = false;
      this.survey.Logo__c = '';
    }
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
            this.survey.Logo__c = this.logoData.imageUrl;
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
    const changeSurveyDataEvent = new FlowAttributeChangeEvent("surveydatachange", this.surveyData);
    const changeLogoIdEvent = new FlowAttributeChangeEvent("logoidchange", this.logoDocumentId);
    this.dispatchEvent(changeSurveyDataEvent);
    this.dispatchEvent(changeLogoIdEvent);
    if (this.logoId && !this.survey.Logo__c) {
      this.deleteImage();
    }
  }
}