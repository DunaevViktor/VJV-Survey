import { LightningElement, api, track } from "lwc";
import createValidationList from "@salesforce/apex/ValidationController.createValidationList";

export default class ValidationBuilderScreenBody extends LightningElement {
  @api questions;
  @api validations;

  @track displayedValidations;
  @track validation;

  connectedCallback() {
    this.displayedValidations = JSON.parse(JSON.stringify(this.validations));
    this.initValidations();
  }

  initValidations() {
    if (!this.displayedValidations) {
      createValidationList()
        .then((result) => {
          this.displayedValidations = result;
          console.log("loaded validations");
          this.sendValidationsChange();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  get questionOptions() {
    return this.questions.map((question) => {
      return {
        label: question.Label__c,
        value: question.Id
      };
    });
  }

  sendValidationsChange() {
    const changeEvent = new CustomEvent("validationschange", {
      detail: { validations: [...this.displayedValidations] }
    });
    this.dispatchEvent(changeEvent);
  }

  //----------unchecked---------

  value = "inProgress";

  get options() {
    return [
      { label: "New", value: "new" },
      { label: "In Progress", value: "inProgress" },
      { label: "Finished", value: "finished" }
    ];
  }

  handleChange(event) {
    this.value = event.detail.value;
  }
}
