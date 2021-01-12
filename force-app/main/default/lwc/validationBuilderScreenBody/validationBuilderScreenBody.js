import { LightningElement, api, track } from "lwc";

import { label } from "./labels.js";

export default class ValidationBuilderScreenBody extends LightningElement {
  @api questions;
  @api validations;

  @track displayedValidations;

  @track isHaveQuestions;
  @track isHaveValidations;
  @track isError = false;

  label = label;

  connectedCallback() {
    if (this.questions) {
      this.isHaveQuestions = this.questions.length > 2;
    } else {
      this.isHaveQuestions = false;
    }

    this.isHaveValidations = this.validations;

    this.displayedValidations = JSON.parse(JSON.stringify(this.validations));
    this.initValidations();
  }

  initValidations() {
    if (!this.displayedValidations) {
      this.displayedValidations = [];
      this.sendValidationsChange();
    }
  }

  addValidation(event) {
    const validation = event.detail;
    this.displayedValidations.push(validation);
    this.isHaveValidations = this.displayedValidations.length > 0;
    this.sendValidationsChange();
  }

  deleteValidation(event) {
    this.displayedValidations.splice(event.detail, 1);
    this.isHaveValidations = this.displayedValidations.length > 0;
    this.sendValidationsChange();
  }

  setError() {
    this.isError = true;
  }

  sendValidationsChange() {
    const changeEvent = new CustomEvent("validationschange", {
      detail: { validations: [...this.displayedValidations] }
    });
    this.dispatchEvent(changeEvent);
  }

  clickPreviousButton() {
    const previousEvent = new CustomEvent("previous", {});
    this.dispatchEvent(previousEvent);
  }

  clickNextButton() {
    const nextEvent = new CustomEvent("next", {});
    this.dispatchEvent(nextEvent);
  }
}
