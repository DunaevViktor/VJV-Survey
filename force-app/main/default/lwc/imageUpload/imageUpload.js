import { LightningElement, api, track } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";
import getLogoURL from "@salesforce/apex/SurveySettingsController.getLogoURL";

export default class ImageUpload extends LightningElement {
  @track imageFile;
  @track displayImage = false;
  @track imageUrl;
  @track errorMessage;

  logoName;
  acceptedFormats = "image/png, image/jpeg";
  removeIconUrl = DELETE_ICON;

  @api
  updateImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
    this.updateImageArea();
  }

  uploadImage(event) {
    this.imageFile = event.target.files[0];
    this.logoName = this.imageFile.name;
    this.generateImageData();
  }

  handleDropFile(event) {
    event.preventDefault();
    this.imageFile = event.dataTransfer.files[0];
    this.logoName = this.imageFile.name;
    this.generateImageData();
  }

  allowDropFile(event) {
    event.preventDefault();
  }

  clearFile() {
    this.imageFile = undefined;
    this.imageUrl = undefined;
    this.updateImageArea();
  }

  generateImageData() {
    let reader = new FileReader();

    reader.onload = () => {
      let blob = reader.result;
      let base64 = "base64,";
      let imageBase64 = blob.substr(blob.indexOf(base64) + base64.length);
      getLogoURL({
        logoName: this.logoName,
        logoBlobData: imageBase64
      })
        .then((result) => {
          this.imageUrl = result;
          this.dispatchImageUrl();
        })
        .then(() => {
          this.updateImageArea();
        });
    };
    reader.readAsDataURL(this.imageFile);
  }

  updateImageArea() {
    if (this.imageUrl) {
      this.displayImage = true;
    } else {
      this.displayImage = false;
    }
  }

  dispatchImageUrl() {
    const imageUrlUpdateEvent = new CustomEvent("updateimageurl", {
      detail: { imageUrl: this.imageUrl }
    });
    this.dispatchEvent(imageUrlUpdateEvent);
  }
}
