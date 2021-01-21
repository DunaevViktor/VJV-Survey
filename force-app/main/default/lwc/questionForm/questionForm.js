import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
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
  setInputValidity
} from "./questionFormHelper.js";

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

  @wire(getObjectInfo, { objectApiName: QUESTION_OBJECT })
  surveyObjectInfo;

  @track selectedType;
  @track selectedSettings = [];

  @track isOptionsEnabled;
  @track isEditOption = false;
  @track isEditMode = false;
  @track editOptionValue = "";
  @track editOptionIndex;

  displayedTypes;

  connectedCallback() {
    this.isOptionsEnabled = false;
    this.question = {};
    this.question.Question_Options__r = [];
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
      console.log(error);
      this.sendErrorNotification();
    }
  }

  @api
  clearQuestion() {
    this.question = {};
    this.question.Question_Options__r = [];
    this.resetForm();
  }

  @api
  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    const input = this.template.querySelector(".input");
    clearInput(input);
    input.value = this.question.Label__c;

    this.selectedType = this.question.Type__c;
    this.selectedSettings = [];

    if (this.question[this.REQUIRED_FIELD_API_NAME]) this.selectedSettings.push(this.REQUIRED_FIELD_API_NAME);
    if (this.question[this.REUSABLE_FIELD_API_NAME])
      this.selectedSettings.push(this.REUSABLE_FIELD_API_NAME);

    this.setOptionsEnabling();

    this.isEditMode = true;
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

    const addEvent = new CustomEvent("add", {
      detail: { ...this.question }
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

    const editEvent = new CustomEvent("edit", {
      detail: { ...this.question }
    });
    this.dispatchEvent(editEvent);

    this.clearQuestion();
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

  resetForm() {
    const input = this.template.querySelector(".input");
    clearInput(input);
    this.selectedType = this.displayedTypes
      ? this.displayedTypes[0].value
      : "Text";
    this.selectedSettings = [];
    this.isEditMode = false;
    this.setOptionsEnabling();
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