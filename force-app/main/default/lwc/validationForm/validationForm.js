import { LightningElement, api, track, wire } from "lwc";

import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import {
  questionTypes,
  operatorTypes,
  typesDescription
} from "./validationFormHelper";

import question from "@salesforce/label/c.question";
import dependent_question from "@salesforce/label/c.dependent_question";
import operator from "@salesforce/label/c.operator";
import enter_compared_value from "@salesforce/label/c.enter_compared_value";
import value from "@salesforce/label/c.value";
import add from "@salesforce/label/c.add";
import select_operator from "@salesforce/label/c.select_operator";
import select_value from "@salesforce/label/c.select_value";
import number from "@salesforce/label/c.number";
import text from "@salesforce/label/c.text";
import trueLabel from "@salesforce/label/c.true";
import falseLabel from "@salesforce/label/c.false";

export default class ValidationForm extends LightningElement {
  @api questions;

  operators;
  @track displayedOperators;
  @track selectedOperator;

  @wire(getObjectInfo, { objectApiName: VALIDATION_OBJECT })
  validationObjectInfo;

  @track firstPosition;
  @track secondPosition;
  @track firstQuestion;
  @track secondQuestion;

  label = {
    question,
    dependent_question,
    operator,
    enter_compared_value,
    value,
    add,
    select_operator,
    select_value
  };

  connectedCallback() {
    this.firstPosition = this.questions[0].Position__c;
    this.secondPosition = this.questions[1].Position__c;

    this.firstQuestion = this.questions.filter((item) => {
      return item.Position__c === this.firstPosition;
    })[0];

    this.secondQuestion = this.questions.filter((item) => {
      return item.Position__c === this.secondPosition;
    })[0];
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
      this.sendErrorNotification();
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
      this.firstQuestion.Type__c.toLowerCase() ===
        questionTypes.PICKLIST.toLowerCase() ||
      this.firstQuestion.Type__c.toLowerCase() ===
        questionTypes.RADIOBUTTON.toLowerCase() ||
      this.firstQuestion.Type__c.toLowerCase() ===
        questionTypes.CHECKBOX.toLowerCase() ||
      (this.selectedOperator &&
        this.selectedOperator
          .toLowerCase()
          .includes(operatorTypes.NULL.toLowerCase()))
    );
  }

  get inputType() {
    return this.firstQuestion.Type__c.toLowerCase() ===
      questionTypes.RATING.toLowerCase()
      ? number
      : text;
  }

  get questionsOptions() {
    if (
      this.selectedOperator &&
      this.selectedOperator
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase())
    ) {
      return [
        {
          label: trueLabel,
          value: trueLabel.toUpperCase()
        },
        {
          label: falseLabel,
          value: falseLabel.toUpperCase()
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
        return !item.label
          .toLowerCase()
          .includes(operatorTypes.NULL.toLowerCase());
      });
    }

    for (let i = 0; i < typesDescription.length; i++) {
      const questionType = typesDescription[i];

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

    const addEvent = new CustomEvent("add", {
      detail: validation
    });
    this.dispatchEvent(addEvent);

    this.resetForm();
  }

  sendErrorNotification() {
    const errorEvent = new CustomEvent("error", {});
    this.dispatchEvent(errorEvent);
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
}
