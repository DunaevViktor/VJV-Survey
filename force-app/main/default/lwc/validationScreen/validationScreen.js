import { LightningElement, api, track } from "lwc";

import { label } from "./labels.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { isValidNewValidation } from "./validationScreenHelper";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ValidationScreen extends LightningElement {


  ERROR_VARIANT = "error";

  @track displayedValidations = [];

  get validations() {
    return this.displayedValidations;
  }

  @api
  set validations(value) {
    this.displayedValidations = JSON.parse(JSON.stringify(value));
  }

  @api questions;

  @track isHaveQuestions;
  @track isHaveValidations;
  @track isError = false;

  label = label;

  connectedCallback() {
    if (this.questions) {
      this.isHaveQuestions = this.questions.length >= 2;
    } else {
      this.isHaveQuestions = false;
    }
    
    this.isHaveValidations = this.validations && this.validations.length > 0;
  }

  addValidation(event) {
    const validation = event.detail;

    if(!isValidNewValidation(this.displayedValidations, validation)) {
      this.showToastMessage(label.error_title, label.questions_connected, this.ERROR_VARIANT);
      return;
    }

    this.template
          .querySelectorAll("c-validation-form")[0]
          .resetForm();

    this.displayedValidations.push(validation);
    this.isHaveValidations = this.displayedValidations.length > 0;
  }

  deleteValidation(event) {
    this.displayedValidations.splice(event.detail, 1);
    this.isHaveValidations = this.displayedValidations.length > 0;
  }

  setError() {
    this.isError = true;
  }

  clickPreviousButton() {
    this.displayedValidations = [];

    const backNavigationEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(backNavigationEvent);
  }

  clickNextButton() {
    const nextNavigationEvent = new FlowNavigationNextEvent();
    this.dispatchEvent(nextNavigationEvent);
  }

  showToastMessage(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(event);
  }
}