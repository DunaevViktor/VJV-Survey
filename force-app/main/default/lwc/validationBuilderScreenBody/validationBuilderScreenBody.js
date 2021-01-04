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

  @track firstPosition;
  @track secondPosition;
  @track firstQuestion;
  @track secondQuestion;

  operators;
  @track displayedOperators;
  @track selectedOperator;

  @track displayedValidations;
  @track validation;

  @track isHaveQuestions;
  @track isSelectable = false;
  @track isError = false;

  connectedCallback() {
    if (this.questions) {
      this.isHaveQuestions = this.questions.length > 2;
    } else {
      this.isHaveQuestions = false;
    }

    if (this.isHaveQuestions) {
      this.firstPosition = this.questions[0].Position__c;
      this.secondPosition = this.questions[1].Position__c;

      this.firstQuestion = this.questions.filter((question) => {
        return question.Position__c === this.firstPosition;
      })[0];

      this.secondQuestion = this.questions.filter((question) => {
        return question.Position__c === this.secondPosition;
      })[0];
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
      this.isError = true;
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
          this.isError = true;
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

  get isFirstQuestionPicklist() {
    return (
      this.firstQuestion.Type__c === "Picklist" ||
      this.firstQuestion.Type__c === "RadioButton" ||
      this.firstQuestion.Type__c === "Checkbox"
    );
  }

  get inputType() {
    return this.firstQuestion.Type__c === "Rating" ? "number" : "text";
  }

  get questionsOptions() {
    if (this.selectedOperator === "IS NULL") {
      return [
        {
          label: "TRUE",
          value: "TRUE"
        },
        {
          label: "FALSE",
          value: "FALSE"
        }
      ];
    }

    return this.firstQuestion.Question_Options__r.map((option) => {
      return {
        label: option.Value__c,
        value: option.Value__c
      };
    });
  }

  setDisplayedOperators() {
    let resolvedOperators = [...this.operators];

    if (this.firstQuestion.Required__c) {
      resolvedOperators = resolvedOperators.filter((operator) => {
        return !operator.label.toLowerCase().includes("null");
      });
    }

    if (
      this.firstQuestion.Type__c === "Picklist" ||
      this.firstQuestion.Type__c === "RadioButton"
    ) {
      resolvedOperators = resolvedOperators.filter((operator) => {
        return (
          !operator.label.toLowerCase().includes("CONTAINS".toLowerCase()) &&
          !operator.label.toLowerCase().includes("THAN".toLowerCase())
        );
      });
    }

    if (
      this.firstQuestion.Type__c === "Text" ||
      this.firstQuestion.Type__c === "Checkbox"
    ) {
      resolvedOperators = resolvedOperators.filter((operator) => {
        return (
          !operator.label.toLowerCase().includes("EQUALS".toLowerCase()) &&
          !operator.label.toLowerCase().includes("THAN".toLowerCase())
        );
      });
    }

    if (this.firstQuestion.Type__c === "Rating") {
      resolvedOperators = resolvedOperators.filter((operator) => {
        return !operator.label.toLowerCase().includes("CONTAINS".toLowerCase());
      });
    }

    this.displayedOperators = [...resolvedOperators];
    this.selectedOperator = this.displayedOperators[0].value;
  }

  selectFirstQuestion(event) {
    if (this.firstPosition === +event.detail.value) {
      const input = this.template.querySelector(".firstCombobox");
      input.value = this.firstPosition;
      return;
    }

    this.firstPosition = +event.detail.value;

    if (this.firstPosition === this.secondPosition) {
      if (this.secondPosition === this.questions[1].Position__c) {
        this.firstPosition = this.questions[0].Position__c;
      } else {
        this.firstPosition = this.questions[1].Position__c;
      }
    }

    const input = this.template.querySelector(".firstCombobox");
    input.value = this.firstPosition;

    this.firstQuestion = this.questions.filter((question) => {
      return question.Position__c === this.firstPosition;
    })[0];

    this.setDisplayedOperators();
  }

  selectSecondQuestion(event) {
    if (this.secondPosition === +event.detail.value) {
      const input = this.template.querySelector(".secondCombobox");
      input.value = this.secondPosition;
      return;
    }

    this.secondPosition = +event.detail.value;

    console.log(this.secondPosition);
    console.log(this.firstPosition);

    if (this.secondPosition === this.firstPosition) {
      if (this.firstPosition === this.questions[1].Position__c) {
        this.secondPosition = this.questions[0].Position__c;
      } else {
        this.secondPosition = this.questions[1].Position__c;
      }
    }

    const input = this.template.querySelector(".secondCombobox");
    input.value = this.secondPosition;

    this.secondQuestion = this.questions.filter((question) => {
      return question.Position__c === this.secondPosition;
    })[0];
  }

  setSelectedOperator(event) {
    this.selectedOperator = event.detail.value;
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
    this.sendValidationsChange();
    this.resetForm();
  }

  deleteValidation(event) {
    this.displayedValidations.splice(event.detail, 1);
    this.sendValidationsChange();
  }

  sendValidationsChange() {
    const changeEvent = new CustomEvent("validationschange", {
      detail: { validations: [...this.displayedValidations] }
    });
    this.dispatchEvent(changeEvent);
  }

  resetForm() {
    this.firstPosition = this.questions[0].Position__c;
    this.secondPosition = this.questions[1].Position__c;

    this.firstQuestion = this.questions.filter((question) => {
      return question.Position__c === this.firstPosition;
    })[0];

    this.secondQuestion = this.questions.filter((question) => {
      return question.Position__c === this.secondPosition;
    })[0];

    const input = this.template.querySelector(".input");
    input.value = "";

    this.setDisplayedOperators();
  }
}
