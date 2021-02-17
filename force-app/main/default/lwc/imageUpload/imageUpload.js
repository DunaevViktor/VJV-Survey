import { LightningElement, api, track } from "lwc";
import { labels } from "./labels";

export default class ImageUpload extends LightningElement {
  EMPTY_STRING = '';

  @api defaultUrl;
  @api loading;
  
  @track displayImage = false;
  @track imageUrl;
  @track error;

  imageFile;
  imageName;
  acceptedFormats = 'image/png, image/jpeg';

  label = labels;

  connectedCallback() {
    this.imageUrl = this.defaultUrl;
    this.updateImageArea();
  }

  uploadImage(event) {
    this.imageFile = event.target.files[0];
    this.imageName = this.imageFile.name;
    this.generateImageData();
  }

  handleDropFile(event) {
    event.preventDefault();
    this.imageFile = event.dataTransfer.files[0];
    this.imageName = this.imageFile.name;
    this.generateImageData();
  }

  allowDropFile(event) {
    event.preventDefault();
  }

  clearFile() {
    this.imageFile = undefined;
    this.imageName = this.EMPTY_STRING;
    this.imageUrl = this.EMPTY_STRING;
    this.dispatchImageUrl();
    this.updateImageArea();
  }

  generateImageData() {
    const reader = new FileReader();

    reader.onload = () => {
      const blobUrl = reader.result;
      this.imageUrl = blobUrl;
      this.dispatchImageUrl();
      this.updateImageArea();
    };
    reader.readAsDataURL(this.imageFile);
  }

  updateImageArea() {
    this.displayImage = !!this.imageUrl;
  }

  dispatchImageUrl() {
    const imageUrlUpdateEvent = new CustomEvent("updateimageurl", {
      detail: { 
        imageName: this.imageName,
        imageUrl: this.imageUrl 
      }
    });
    this.dispatchEvent(imageUrlUpdateEvent);
  }
}