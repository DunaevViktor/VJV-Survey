import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { label } from "./labels.js";
import {
  transformQuestionTypes,
  isOptionEnabling, 
  filterOptionsByValue,
  filterOptionsByValueAndIndex,
  findOptionIndexByValue,
  deleteFromOptions,
  clearInput,
  setInputValidity,
  transformOperators,
  isNeedPicklist,
  resolveOperatorsByQuestionType,
  buildVisibilityMessage
} from "./questionFormHelper.js";

import {
  operatorTypes,
  booleanPicklistOptions,
} from "c/formUtil";

export default class QuestionForm extends LightningElement {
  label = label;

  SUCCESS_TITLE = label.success;
  SUCCESS_VARIANT = "success";

  ERROR_TITLE = label.errorTitle;
  ERROR_VARIANT = "error";

  REQUIRED_FIELD_API_NAME = "Required__c";
  REUSABLE_FIELD_API_NAME = "IsReusable__c";

  EMPTRY_STRING = "";

  @track question = {};
  @track validation = {};

  @api isEditMode;
  @api isDependentQuestion;
  @api questionForForm;
  @api validationForForm;

  @wire(getObjectInfo, { objectApiName: QUESTION_OBJECT })
  surveyObjectInfo;

  @wire(getObjectInfo, { objectApiName: VALIDATION_OBJECT })
  validationObjectInfo;

  @track selectedType;
  @track selectedSettings = [];

  @track isOptionsEnabled;
  @track isEditOption = false;
  @track editOptionValue = "";
  @track editOptionIndex;

  displayedTypes;
  operators;
  @track displayedOperators;
  @track selectedOperator;
  @track isMainQuestionPicklist;

  connectedCallback() {
    if(this.isEditMode) {
      this.setQuestionForEdit(this.questionForForm);
      if(this.isDependentQuestion) this.selectedOperator = this.validationForForm.Operator__c;
    } else {
      this.isOptionsEnabled = false;
      this.question = {};
      this.question.Label__c = '';
      this.question.Question_Options__r = [];
    }
  }

  get questionSettingList() {
    return [
      { label: label.is_required, value: this.REQUIRED_FIELD_API_NAME },
      { label: label.is_reusable, value: this.REUSABLE_FIELD_API_NAME }
    ];
  }

  @wire(getPicklistValues, {
    recordTypeId: "$surveyObjectInfo.data.defaultRecordTypeId",
    fieldApiName: TYPE_FIELD
  })
  initTypes({ error, data: types }) {
    if (types) {
      this.displayedTypes = transformQuestionTypes(types);
      this.selectedType = this.displayedTypes[0].value;
      this.setOptionsEnabling();
    } else if (error) {
      this.sendErrorNotification();
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$validationObjectInfo.data.defaultRecordTypeId",
    fieldApiName: OPERATOR_FIELD
  })
  initOperators({ error, data }) {
    if (data) {
      this.operators = transformOperators(data.values);
      if(this.isDependentQuestion) {
        this.setDisplayedOperators();
        this.isMainQuestionPicklist = isNeedPicklist(
          this.validationForForm.Related_Question__c, 
          this.validationForForm.Operator__c);
      }
    } else if (error) {
      this.sendErrorNotification();
    }
  }

  get questionsOptions() {
    if (
      this.selectedOperator &&
      this.selectedOperator
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase())
    ) {
      return booleanPicklistOptions;
    }

    return this.validationForForm.Related_Question__c.Question_Options__r.map((option) => {
      return {
        label: option.Value__c,
        value: option.Value__c
      };
    });
  }

  @api
  resetForm() {
    const input = this.template.querySelector(".input");
    clearInput(input);
    this.selectedType = this.displayedTypes
      ? this.displayedTypes[0].value
      : "Text";
    this.selectedSettings = [];
    this.question = {};
    this.question.Question_Options__r = [];
    this.setOptionsEnabling();
  }

  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    this.selectedType = this.question.Type__c;
    this.selectedSettings = [];

    if (this.question[this.REQUIRED_FIELD_API_NAME]) this.selectedSettings.push(this.REQUIRED_FIELD_API_NAME);
    if (this.question[this.REUSABLE_FIELD_API_NAME])
      this.selectedSettings.push(this.REUSABLE_FIELD_API_NAME);

    this.setOptionsEnabling();
  }

  setDisplayedOperators() {
    this.displayedOperators = [...resolveOperatorsByQuestionType(
      this.operators, 
      this.validationForForm.Related_Question__c)];
  }

  handleLabel(event) {
    this.question.Label__c = event.detail.value;
  }

  handleTypeChange(event) {
    this.selectedType = event.detail.value;
    this.question.Type__c = event.detail.value;
    this.setOptionsEnabling();
  }

  handleSettingChange(event) {
    this.question[this.REQUIRED_FIELD_API_NAME] = false;
    this.question[this.REUSABLE_FIELD_API_NAME] = false;

    for (const value of event.detail.value) {
      this.question[value] = true;
    }
  }

  handleSelectOperator(event) {
    this.selectedOperator = event.detail.value;
    this.isMainQuestionPicklist = isNeedPicklist(
      this.validationForForm.Related_Question__c, 
      this.selectedOperator);
  }

  setOptionsEnabling() {
    this.isOptionsEnabled = isOptionEnabling(this.selectedType);

    if(this.isOptionsEnabled && !this.question.Question_Options__r) {
      this.question.Question_Options__r = [];
    }
  }

  addOption() {
    const input = this.template.querySelector(".option-input");
    if(!this.isOptionCorrect(input)) return;

    this.question.Question_Options__r.push({
      Value__c: input.value
    });

    clearInput(input);
  }

  editOption(event) {
    const input = this.template.querySelector(".option-input");
    clearInput(input);
    input.value = event.detail;
    this.editOptionValue = event.detail;
    this.editOptionIndex = findOptionIndexByValue(this.question.Question_Options__r, event.detail);
    this.isEditOption = true;
  }

  cancelOptionEdit() {
    const input = this.template.querySelector(".option-input");
    clearInput(input);
    input.value = "";
    this.editOptionValue = "";
    this.editOptionIndex = null;
    this.isEditOption = false;
  }

  saveOptionChanges() {
    const input = this.template.querySelector(".option-input");
    if(!this.isOptionCorrect(input)) return;

    this.question.Question_Options__r[this.editOptionIndex].Value__c = input.value;
    this.cancelOptionEdit();
  }

  deleteOption(event) {
    if(this.editOptionValue.localeCompare(event.detail) === 0) {
      this.cancelOptionEdit();
    } else {
      const index = findOptionIndexByValue(this.question.Question_Options__r, event.detail);
      if(index < this.editOptionIndex) this.editOptionIndex--;
    }
    
    this.question.Question_Options__r = deleteFromOptions(this.question.Question_Options__r, event.detail);
  }

  isOptionCorrect(input) {
    if (input.value === this.EMPTRY_STRING) {
      setInputValidity(input, label.complete_this_field);
      return false;
    }

    const filteredOptions = this.isEditOption ? 
    filterOptionsByValueAndIndex(this.question.Question_Options__r, input.value, this.editOptionIndex) :
    filterOptionsByValue(this.question.Question_Options__r, input.value);

    if (filteredOptions.length > 0) {
      setInputValidity(input, label.option_already_exists);
      return false;
    }

    return true;
  }

  addQuestion() {
    if(!this.isQuestionCorrect()) return;
    this.getQuestionAttributes();

    if(!this.isDependentQuestion) {
      this.sendMainQuestion("add");
    } else {
      this.sendDependatQuestion("adddependant");
    }
  }

  sendMainQuestion(message) {
    const questionEvent = new CustomEvent(message, {
      detail: { ...this.question }
    });
    this.dispatchEvent(questionEvent);
  }

  sendDependatQuestion(message) {
    const input = this.template.querySelector(".validationInput");
    input.reportValidity();

    if (!this.selectedOperator || !input.value) {
      return;
    }

    const validation = {
      ...this.validationForForm,
      Dependent_Question__c: JSON.parse(JSON.stringify(this.question)),
      Operator__c: this.selectedOperator,
      Value__c: input.value
    };
    validation.Dependent_Question__c.VisibilityReason = buildVisibilityMessage(validation);

    const addEvent = new CustomEvent(message, {
      detail: { ...validation }
    });
    this.dispatchEvent(addEvent);
  }

  handleBack() {
    const cancelEvent = new CustomEvent("back");
    this.dispatchEvent(cancelEvent);
  }

  updateQuestion() {
    if(!this.isQuestionCorrect()) return;
    this.getQuestionAttributes();

    if(!this.isDependentQuestion) {
      this.sendMainQuestion("edit");
    } else {
      this.sendDependatQuestion("edit");
    }
  }

  getQuestionAttributes() {
    if (
      !this.isOptionsEnabled ||
      (this.isOptionsEnabled && this.question.Question_Options__r.length === 0)
    ) {
      this.question.Question_Options__r = null;
    }
    this.question.Type__c = this.selectedType;
  }

  isQuestionCorrect() {
    const input = this.template.querySelector(".input");

    if (input.value === this.EMPTRY_STRING) {
      setInputValidity(input, label.complete_this_field);
      return false;
    } else if (
      this.isOptionsEnabled &&
      this.question.Question_Options__r.length < 2
    ) {
      this.showToastMessage(
        this.ERROR_TITLE,
        label.error_few_options,
        this.ERROR_VARIANT
      );
      return false;
    }

    return true;
  }
  
  sendErrorNotification() {
    const errorEvent = new CustomEvent("error", {});
    this.dispatchEvent(errorEvent);
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