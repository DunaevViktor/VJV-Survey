import { LightningElement, api, track, wire } from "lwc";
import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import createValidationList from "@salesforce/apex/ValidationController.createValidationList";

export default class ValidationBuilderScreenBody extends LightningElement {
  @api questions;
  @api validations;

  @wire(getObjectInfo, { objectApiName: VALIDATION_OBJECT })
  validationObjectInfo;

  @track secondQuestion;
  @track firstQuestion;

  operators;
  @track displayedOperators;
  @track selectedOperator;

  @track displayedValidations;
  @track validation;

  @track isHaveQuestions;
  @track isSelectable = false;
  @track error = false;

  connectedCallback() {
    if (this.questions) {
      this.isHaveQuestions = this.questions.length > 2;
    } else {
      this.isHaveQuestions = false;
    }

    if (this.isHaveQuestions) {
      this.firstQuestion = this.questions[0].Position__c;
      this.secondQuestion = this.questions[1].Position__c;
    }

    this.displayedValidations = JSON.parse(JSON.stringify(this.validations));
    this.initValidations();
  }

  @wire(getPicklistValues, {
    recordTypeId: "$validationObjectInfo.data.defaultRecordTypeId",
    fieldApiName: OPERATOR_FIELD
  })
  initTypes({ error, data }) {
    if (data) {
      this.operators = data.values.map((item) => {
        return {
          label: item.label,
          value: item.value
        };
      });
      this.displayedOperators = [...this.operators];
      this.selectedOperator = this.displayedOperators[0].value;
    } else if (error) {
      console.log(error);
      this.error = true;
    }
  }

  initValidations() {
    if (!this.displayedValidations) {
      createValidationList()
        .then((result) => {
          this.displayedValidations = result;
          this.sendValidationsChange();
        })
        .catch((error) => {
          console.log(error);
          this.error = true;
        });
    }
  }

  get questionOptions() {
    return this.questions.map((question) => {
      return {
        label: question.Label__c,
        value: question.Position__c
      };
    });
  }

  setDisplayedOperators() {
    let resolvedOperators = [...this.operators];
    console.log(this.firstQuestion.Required__c);
    if (this.firstQuestion.Required__c) {
      resolvedOperators = resolvedOperators.filter((operator) => {
        return !operator.label.toLowerCase().includes("null");
      });
    }
    this.displayedOperators = [...resolvedOperators];
    this.selectedOperator = this.displayedOperators[0].value;
  }

  sendValidationsChange() {
    const changeEvent = new CustomEvent("validationschange", {
      detail: { validations: [...this.displayedValidations] }
    });
    this.dispatchEvent(changeEvent);
  }

  selectFirstQuestion(event) {
    this.firstQuestion = this.questions.filter((question) => {
      return question.Position__c === +event.detail.value;
    })[0];
    this.setDisplayedOperators();
  }

  selectSecondQuestion(event) {
    this.secondQuestion = this.questions.filter((question) => {
      return question.Position__c === +event.detail.value;
    })[0];
  }

  addValidation() {
    const input = this.template.querySelector(".input");

    if (!this.firstQuestion || !this.secondQuestion || !input.validity.valid) {
      return;
    }

    const validation = {
      Related_Question__c: this.firstQuestion,
      Dependent_Question__c: this.secondQuestion,
      Operator__c: this.selectedOperator,
      Value__c: input.value
    };

    this.displayedValidations.push(validation);
    this.resetForm();
  }

  deleteValidation(event) {
    this.displayedValidations.splice(event.detail, 1);
  }

  resetForm() {
    this.firstQuestion = this.questions[0].Position__c;
    this.secondQuestion = this.questions[1].Position__c;

    const input = this.template.querySelector(".input");
    input.value = "";

    this.setDisplayedOperators();
  }
}
