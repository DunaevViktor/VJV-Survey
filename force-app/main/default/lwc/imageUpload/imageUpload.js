import { LightningElement, api, track } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";
import getLogoURL from "@salesforce/apex/SurveySettingsController.getLogoURL";

import remove_image from "@salesforce/label/c.remove_image";
import drag_n_drop_logo from "@salesforce/label/c.drag_n_drop_logo";
import logo_image from "@salesforce/label/c.logo_image";

export default class ImageUpload extends LightningElement {
  @api url;
  @track imageFile;
  @track displayImage = false;
  @track imageUrl;
  @track errorMessage;
  @track imageLoading;

  logoName;
  acceptedFormats = "image/png, image/jpeg";
  removeIconUrl = DELETE_ICON;

  label = {
    remove_image,
    drag_n_drop_logo,
    logo_image
  };

  connectedCallback() {
    this.imageUrl = this.url;
    this.updateImageArea();
  }

  uploadImage(event) {
    this.imageFile = event.target.files[0];
    this.logoName = this.imageFile.name;
    this.imageLoading = true;
    this.generateImageData();
  }

  handleDropFile(event) {
    event.preventDefault();
    this.imageFile = event.dataTransfer.files[0];
    this.logoName = this.imageFile.name;
    this.imageLoading = true;
    this.generateImageData();
  }

  allowDropFile(event) {
    event.preventDefault();
  }

  clearFile() {
    this.imageFile = undefined;
    this.imageUrl = '';
    this.dispatchImageUrl();
    this.updateImageArea();
  }

  generateImageData() {
    const reader = new FileReader();

    reader.onload = () => {
      const blob = reader.result;
      const base64 = "base64,";
      const imageBase64 = blob.substr(blob.indexOf(base64) + base64.length);
      getLogoURL({
        logoName: this.logoName,
        logoBlobData: imageBase64
      })
        .then((result) => {
          this.imageUrl = result;
          this.dispatchImageUrl();
        })
        .then(() => {
          this.imageLoading = false;
        })
        .then(() => {
          this.updateImageArea();
        });
    };
    reader.readAsDataURL(this.imageFile);
  }

  updateImageArea() {
    this.displayImage = !!this.imageUrl;
    this.imageLoading = false;
  }

  dispatchImageUrl() {
    const imageUrlUpdateEvent = new CustomEvent("updateimageurl", {
      detail: { imageUrl: this.imageUrl }
    });
    this.dispatchEvent(imageUrlUpdateEvent);
  }
}