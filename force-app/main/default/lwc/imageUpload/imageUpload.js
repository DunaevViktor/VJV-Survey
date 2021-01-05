import { LightningElement, api, track } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

export default class ImageUpload extends LightningElement {
  @track imageFile;
  @track displayImage = false;
  @track imageBlobUrl;
  @track imageUrl;

  acceptedFormats = "image/png, image/jpeg";
  removeIconUrl = DELETE_ICON;

  @api
  updateImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
    this.updateImageArea();
  }

  uploadImage(event) {
    this.imageFile = event.target.files[0];
    this.generateImageBlobUrl();
  }

  handleDropFile(event) {
    event.preventDefault();
    this.imageFile = event.dataTransfer.files[0];
    this.generateImageBlobUrl();
  }

  allowDropFile(event) {
    event.preventDefault();
  }

  clearFile() {
    this.imageFile = undefined;
    this.imageUrl = undefined;
    this.imageBlobUrl = undefined;
    this.updateImageArea();
  }

  generateImageBlobUrl() {
    let reader = new FileReader();

    reader.onload = () => {
      let blob = reader.result;
      this.imageBlobUrl = blob;
      this.updateImageArea();
    };
    reader.readAsDataURL(this.imageFile);
  }

  updateImageArea() {
    if (this.imageUrl) {
      this.displayImage = true;
    } else if (this.imageBlobUrl) {
      this.imageUrl = this.imageBlobUrl;
      this.displayImage = true;
      this.dispatchImageUrl();
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
