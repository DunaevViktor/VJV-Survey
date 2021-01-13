import { LightningElement, api, track } from "lwc";

import no_questions_to_validation from "@salesforce/label/c.no_questions_to_validation";
import errorMessage from "@salesforce/label/c.errorMessage";
import no_validations from "@salesforce/label/c.no_validations";
import previous_button_message from "@salesforce/label/c.previous_button_message";
import previous from "@salesforce/label/c.previous";
import next from "@salesforce/label/c.next";

export default class ValidationBuilderScreenBody extends LightningElement {
  @api questions;
  @api validations;

  @track displayedValidations;

  @track isHaveQuestions;
  @track isHaveValidations;
  @track isError = false;

  label = {
    no_questions_to_validation,
    errorMessage,
    no_validations,
    previous_button_message,
    previous,
    next
  };

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