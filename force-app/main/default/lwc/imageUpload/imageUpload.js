import { LightningElement, api, track } from "lwc";
import getImageURL from "@salesforce/apex/ImageUploadController.getImageURL";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";
import { labels } from "./labels";

export default class ImageUpload extends LightningElement {
  
  @api defaultUrl;
  
  @track displayImage = false;
  @track imageUrl;
  @track imageLoading;
  @track error;

  imageFile;
  imageName;
  acceptedFormats = 'image/png, image/jpeg';
  removeIconUrl = DELETE_ICON;

  label = labels;

  connectedCallback() {
    this.imageUrl = this.defaultUrl;
    this.updateImageArea();
  }

  uploadImage(event) {
    this.imageFile = event.target.files[0];
    this.imageName = this.imageFile.name;
    this.imageLoading = true;
    this.generateImageData();
  }

  handleDropFile(event) {
    event.preventDefault();
    this.imageFile = event.dataTransfer.files[0];
    this.imageName = this.imageFile.name;
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
      getImageURL({
        imageName: this.imageName,
        imageBase64Data: imageBase64
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
        })
        .catch(error => {
          this.imageUrl = '';
          this.error = error;
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