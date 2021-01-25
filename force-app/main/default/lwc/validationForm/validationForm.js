import { LightningElement, api, track, wire } from "lwc";

import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import {
  questionTypes,
  operatorTypes,
  booleanPicklistOptions,
  findQuestionByPosition
} from "c/formUtil";

import {label} from "./labels.js";
import {
  transformOperators,
  resolveOperatorsByQuestionType, 
  isNeedPicklist
} from "./validationFormHelper.js";

export default class ValidationForm extends LightningElement {
  label = label;

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

  @track isFirstQuestionPicklist;

  @wire(getPicklistValues, {
    recordTypeId: "$validationObjectInfo.data.defaultRecordTypeId",
    fieldApiName: OPERATOR_FIELD
  })
  initTypes({ error, data }) {
    if (data) {
      this.operators = transformOperators(data.values);
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

  get inputType() {
    if(this.firstPosition){
      return this.firstQuestion.Type__c.toLowerCase() ===
      questionTypes.RATING.toLowerCase()
      ? "number"
      : "text";
    }
    
  }

  get questionsOptions() {
    if(!this.firstQuestion){
      return false;
    }

    if (
      this.selectedOperator &&
      this.selectedOperator
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase())
    ) {
      return booleanPicklistOptions;
    }

    return this.firstQuestion.Question_Options__r.map((option) => {
      return {
        label: option.Value__c,
        value: option.Value__c
      };
    });
  }

  setDisplayedOperators() {
    if(!this.firstQuestion){
      return;
    }
    const resolvedOperators = resolveOperatorsByQuestionType(
      this.operators, 
      this.firstQuestion);

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
      if (this.secondPosition === this.questions[0].Position__c) {
        this.firstPosition = this.questions[1].Position__c;
      } else {
        this.firstPosition = this.questions[0].Position__c;
      }
    }

    const input = this.template.querySelector(".firstCombobox");
    input.value = this.firstPosition;

    this.firstQuestion = findQuestionByPosition(this.questions, this.firstPosition);

    this.setDisplayedOperators();
    this.isFirstQuestionPicklist = isNeedPicklist(this.firstQuestion, this.selectedOperator);
  }

  selectSecondQuestion(event) {
    if (this.secondPosition === +event.detail.value) {
      const input = this.template.querySelector(".secondCombobox");
      input.value = this.secondPosition;
      return;
    }

    this.secondPosition = +event.detail.value;

    if (this.secondPosition === this.firstPosition) {
      if (this.firstPosition === this.questions[1].Position__c) {
        this.secondPosition = this.questions[0].Position__c;
      } else {
        this.secondPosition = this.questions[1].Position__c;
      }
    }

    const input = this.template.querySelector(".secondCombobox");
    input.value = this.secondPosition;

    this.secondQuestion = findQuestionByPosition(this.questions, this.secondPosition);
  }

  setSelectedOperator(event) {
    this.selectedOperator = event.detail.value;
    this.isFirstQuestionPicklist = isNeedPicklist(this.firstQuestion, this.selectedOperator);
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
  }

  sendErrorNotification() {
    const errorEvent = new CustomEvent("error", {});
    this.dispatchEvent(errorEvent);
  }

  get isFirstQuestionNotChoosen(){
    if(this.firstQuestion === undefined){
      return true;
    }else{
      return false;
    }
  }

  @api
  resetForm() {

    this.firstPosition = undefined;
    this.firstQuestion = undefined;
    this.secondPosition = undefined;
    this.secondQuestion = undefined;
    this.selectedOperator = undefined;
    this.displayedOperators = undefined;

    const input = this.template.querySelector(".input");
    input.value = "";

  }
}