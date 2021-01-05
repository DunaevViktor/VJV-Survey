import { LightningElement, api, track, wire } from "lwc";
import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import createValidationList from "@salesforce/apex/ValidationController.createValidationList";

import question from "@salesforce/label/c.question";
import dependent_question from "@salesforce/label/c.dependent_question";
import operator from "@salesforce/label/c.operator";
import previous from "@salesforce/label/c.previous";
import enter_compared_value from "@salesforce/label/c.enter_compared_value";
import add from "@salesforce/label/c.add";
import no_questions_to_validation from "@salesforce/label/c.no_questions_to_validation";
import errorMessage from "@salesforce/label/c.errorMessage";
import select_operator from "@salesforce/label/c.select_operator";
import select_value from "@salesforce/label/c.select_value";
import previous_button_message from "@salesforce/label/c.previous_button_message";
import value from "@salesforce/label/c.value";
import next from "@salesforce/label/c.next";

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

  label = {
    question,
    dependent_question,
    operator,
    enter_compared_value,
    value,
    add,
    no_questions_to_validation,
    errorMessage,
    select_operator,
    select_value,
    previous_button_message,
    previous,
    next
  };

  questionsTypes = [
    {
      label: "Picklist",
      deprecatedOperators: ["CONTAINS", "THAN"]
    },
    {
      label: "RadioButton",
      deprecatedOperators: ["CONTAINS", "THAN"]
    },
    {
      label: "Text",
      deprecatedOperators: ["EQUALS", "THAN"]
    },
    {
      label: "Checkbox",
      deprecatedOperators: ["EQUALS", "THAN"]
    },
    {
      label: "Rating",
      deprecatedOperators: ["CONTAINS"]
    }
  ];

  connectedCallback() {
    if (this.questions) {
      this.isHaveQuestions = this.questions.length > 2;
    } else {
      this.isHaveQuestions = false;
    }

    if (this.isHaveQuestions) {
      this.firstPosition = this.questions[0].Position__c;
      this.secondPosition = this.questions[1].Position__c;

      this.firstQuestion = this.questions.filter((item) => {
        return item.Position__c === this.firstPosition;
      })[0];

      this.secondQuestion = this.questions.filter((item) => {
        return item.Position__c === this.secondPosition;
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
    return this.questions.map((item) => {
      return {
        label: item.Label__c,
        value: item.Position__c
      };
    });
  }

  get isFirstQuestionPicklist() {
    return (
      this.firstQuestion.Type__c === "Picklist" ||
      this.firstQuestion.Type__c === "RadioButton" ||
      this.firstQuestion.Type__c === "Checkbox" ||
      this.selectedOperator === "IS NULL"
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
      resolvedOperators = resolvedOperators.filter((item) => {
        return !item.label.toLowerCase().includes("null");
      });
    }

    for (let i = 0; i < this.questionsTypes.length; i++) {
      const questionType = this.questionsTypes[i];

      if (this.firstQuestion.Type__c !== questionType.label) {
        continue;
      }

      resolvedOperators = resolvedOperators.filter((item) => {
        return questionType.deprecatedOperators.reduce(
          (accumulator, deprecatedOperator) => {
            return (
              accumulator &&
              !item.label
                .toLowerCase()
                .includes(deprecatedOperator.toLowerCase())
            );
          },
          true
        );
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

    this.firstQuestion = this.questions.filter((item) => {
      return item.Position__c === this.firstPosition;
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

    this.secondQuestion = this.questions.filter((item) => {
      return item.Position__c === this.secondPosition;
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

    this.firstQuestion = this.questions.filter((item) => {
      return item.Position__c === this.firstPosition;
    })[0];

    this.secondQuestion = this.questions.filter((item) => {
      return item.Position__c === this.secondPosition;
    })[0];

    const input = this.template.querySelector(".input");
    input.value = "";

    this.setDisplayedOperators();
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
