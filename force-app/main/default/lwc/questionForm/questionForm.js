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
  updateOptionsValue,
  deleteFromOptions,
  clearInput,
  setInputValidity,
  transformOperators,
  isNeedPicklist,
  resolveOperatorsByQuestionType
} from "./questionFormHelper.js";

import {
  operatorTypes,
  booleanPicklistOptions,
} from "c/formUtil";
import { generateRecordInputForCreate } from "lightning/uiRecordApi";

export default class QuestionForm extends LightningElement {
  label = label;

  SUCCESS_TITLE = label.success;
  SUCCESS_VARIANT = "success";

  ERROR_TITLE = label.errorTitle;
  ERROR_VARIANT = "error";

  REQUIRED_FIELD_API_NAME = "Required__c";
  REUSABLE_FIELD_API_NAME = "IsReusable__c";

  EMPTRY_STRING = "";

  @track question;
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
  @track isFirstQuestionPicklist;

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
        this.isFirstQuestionPicklist = isNeedPicklist(
          this.validationForForm.Related_Question__c, 
          this.validationForForm.Operator__c);
      }
    } else if (error) {
      this.sendErrorNotification();
    }
  }

  setDisplayedOperators() {
    const resolvedOperators = resolveOperatorsByQuestionType(
      this.operators, 
      this.validationForForm.Related_Question__c);

    this.displayedOperators = [...resolvedOperators];
  }

  setSelectedOperator(event) {
    this.selectedOperator = event.detail.value;
    this.isFirstQuestionPicklist = isNeedPicklist(
      this.validationForForm.Related_Question__c, 
      this.selectedOperator);
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

  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    this.selectedType = this.question.Type__c;
    this.selectedSettings = [];

    if (this.question[this.REQUIRED_FIELD_API_NAME]) this.selectedSettings.push(this.REQUIRED_FIELD_API_NAME);
    if (this.question[this.REUSABLE_FIELD_API_NAME])
      this.selectedSettings.push(this.REUSABLE_FIELD_API_NAME);

    this.setOptionsEnabling();
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

    this.question.Question_Options__r = updateOptionsValue(
      this.question.Question_Options__r, 
      this.editOptionValue, 
      input.value);

    this.cancelOptionEdit();
  }

  deleteOption(event) {
    this.question.Question_Options__r = deleteFromOptions(this.question.Question_Options__r, event.detail);

    if(this.editOptionValue.localeCompare(event.detail) === 0) {
      this.cancelOptionEdit();
    } else {
      this.isEditOption--;
    }
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
      const addEvent = new CustomEvent("add", {
        detail: { ...this.question }
      });
      this.dispatchEvent(addEvent);
      return;
    }
    
    const input = this.template.querySelector(".validationInput");
    input.reportValidity();

    if (!this.selectedOperator || !input.value) {
      return;
    }

    const validation = {
      ...this.validationForForm,
      Dependent_Question__c: this.question,
      Operator__c: this.selectedOperator,
      Value__c: input.value
    };
    validation.Dependent_Question__c.VisibilityReason = 
    "Visible if '" + validation.Related_Question__c.Label__c + "' " + validation.Operator__c.toLowerCase() + " " + validation.Value__c;

    const addEvent = new CustomEvent("adddependant", {
      detail: validation
    });
    this.dispatchEvent(addEvent);

  }

  cancelQuestionEdit() {
    const cancelEvent = new CustomEvent("canseledit");
    this.dispatchEvent(cancelEvent);
    this.clearQuestion();
  }

  updateQuestion() {
    if(!this.isQuestionCorrect()) return;
    this.getQuestionAttributes();

    if(!this.isDependentQuestion) {
      const editEvent = new CustomEvent("edit", {
        detail: { ...this.question }
      });
      this.dispatchEvent(editEvent);
      return;
    }

    const input = this.template.querySelector(".validationInput");
    input.reportValidity();

    if (!input.value) {
      return;
    }
    
    const validation = {
      ...this.validationForForm,
      Dependent_Question__c: this.question,
      Operator__c: this.selectedOperator,
      Value__c: input.value
    };
    validation.Dependent_Question__c.VisibilityReason = 
    "Visible if '" + validation.Related_Question__c.Label__c + "' " + validation.Operator__c.toLowerCase() + " " + validation.Value__c;

    const editEvent = new CustomEvent("edit", {
      detail: { ...validation }
    });
    this.dispatchEvent(editEvent);

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