import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import { ShowToastEvent } from "lightning/platformShowToastEvent";

import {questionTypes} from "c/formUtil";

import edit_question_form_title from "@salesforce/label/c.edit_question_form_title";
import create_question_form_title from "@salesforce/label/c.create_question_form_title";
import specify_question from "@salesforce/label/c.specify_question";
import type from "@salesforce/label/c.type";
import question_settings from "@salesforce/label/c.question_settings";
import enter_option_value from "@salesforce/label/c.enter_option_value";
import save_changes from "@salesforce/label/c.save_changes";
import cancel_edit from "@salesforce/label/c.cancel_edit";
import add_option from "@salesforce/label/c.add_option";
import add_question from "@salesforce/label/c.add_question";
import is_required from "@salesforce/label/c.is_required";
import is_reusable from "@salesforce/label/c.is_reusable";
import option_already_exists from "@salesforce/label/c.option_already_exists";
import error_few_options from "@salesforce/label/c.error_few_options";
import errorTitle from "@salesforce/label/c.error";
import success from "@salesforce/label/c.success";

export default class QuestionForm extends LightningElement {
  SUCCESS_TITLE = success;
  SUCCESS_VARIANT = "success";

  ERROR_TITLE = errorTitle;
  ERROR_VARIANT = "error";

  @api editedQuestion;
  @track question;

  @wire(getObjectInfo, { objectApiName: QUESTION_OBJECT })
  surveyObjectInfo;

  @track selectedType;
  @track selectedSettings = [];

  @track isOptionsEnabled;
  @track isEditOption = false;
  @track isEditMode = false;
  @track editOptionValue = "";

  displayedTypes;

  requiredFieldName = "Required__c";
  reusableFieldName = "IsReusable__c";

  label = {
    edit_question_form_title,
    create_question_form_title,
    specify_question,
    type,
    question_settings,
    enter_option_value,
    save_changes,
    cancel_edit,
    add_option,
    add_question
  }

  connectedCallback() {
    this.isOptionsEnabled = false;
    if (!this.editedQuestion) {
      this.question = {};
      this.question.Question_Options__r = [];
    } else {
      this.question = { ...this.editedQuestion };
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$surveyObjectInfo.data.defaultRecordTypeId",
    fieldApiName: TYPE_FIELD
  })
  initTypes({ error, data: types }) {
    if (types) {
      this.displayedTypes = types.values.map((item) => {
        return {
          label: item.label,
          value: item.value
        };
      });

      this.selectedType = this.displayedTypes[0].value;
      this.setOptionsEnabling();
    } else if (error) {
      console.log(error);
      this.sendErrorNotification();
    }
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
    this.question[this.requiredFieldName] = false;
    this.question[this.reusableFieldName] = false;

    for (const value of event.detail.value) {
      this.question[value] = !this.question[value];
    }
  }

  setOptionsEnabling() {
    this.isOptionsEnabled =
      this.selectedType.toLowerCase().localeCompare(questionTypes.CHECKBOX.toLowerCase()) === 0 ||
      this.selectedType.toLowerCase().localeCompare(questionTypes.RADIOBUTTON.toLowerCase()) === 0 ||
      this.selectedType.toLowerCase().localeCompare(questionTypes.PICKLIST.toLowerCase()) === 0;

    if(this.isOptionsEnabled && !this.question.Question_Options__r) {
      this.question.Question_Options__r = [];
    }
  }

  get questionSettingList() {
    return [
      { label: is_required, value: this.requiredFieldName },
      { label: is_reusable, value: this.reusableFieldName }
    ];
  }

  @api
  setQuestion(clearQuestion) {
    this.question = clearQuestion;
    this.question.Question_Options__r = [];
    this.isEditMode = false;
    this.resetForm();
  }

  @api
  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    const input = this.template.querySelector(".input");
    input.value = this.question.Label__c;

    this.selectedType = this.question.Type__c;
    this.selectedSettings = [];

    if (this.question[this.requiredFieldName]) this.selectedSettings.push(this.requiredFieldName);
    if (this.question[this.reusableFieldName])
      this.selectedSettings.push(this.reusableFieldName);

    this.setOptionsEnabling();

    this.isEditMode = true;
  }

  addOption() {
    const input = this.template.querySelector(".option-input");
    if (!input.validity.valid) return;

    console.log(1);

    const filteredOptions = this.question.Question_Options__r.filter(
      (option) => {
        return option.Value__c.localeCompare(input.value) === 0;
      }
    );

    console.log(2);

    if (filteredOptions.length > 0) {
      this.showToastMessage(
        this.ERROR_TITLE,
        option_already_exists,
        this.ERROR_VARIANT
      );
      return;
    }

    const option = {
      Value__c: input.value
    };

    this.question.Question_Options__r.push(option);
    input.value = "";
  }

  editOption(event) {
    const input = this.template.querySelector(".option-input");
    input.value = event.detail;
    this.editOptionValue = event.detail;
    this.isEditOption = true;
  }

  cancelOptionEdit() {
    const input = this.template.querySelector(".option-input");
    input.value = "";
    this.editOptionValue = "";
    this.isEditOption = false;
  }

  saveOptionChanges() {
    const input = this.template.querySelector(".option-input");
    if (!input.validity.valid) return;

    const filteredOptions = this.question.Question_Options__r.filter(
      (option) => {
        return (
          option.Value__c.localeCompare(input.value) === 0 &&
          this.editOptionValue.localeCompare(input.value) !== 0
        );
      }
    );

    if (filteredOptions.length > 0) {
      this.showToastMessage(
        this.ERROR_TITLE,
        option_already_exists,
        this.ERROR_VARIANT
      );
      return;
    }

    this.question.Question_Options__r = this.question.Question_Options__r.map(
      (option) => {
        if (option.Value__c.localeCompare(this.editOptionValue) === 0) {
          option.Value__c = input.value;
        }
        return option;
      }
    );

    input.value = "";
    this.editOptionValue = "";
    this.isEditOption = false;
  }

  deleteOption(event) {
    this.question.Question_Options__r = this.question.Question_Options__r.filter(
      (option) => {
        return option.Value__c.localeCompare(event.detail) !== 0;
      }
    );
  }

  addQuestion() {
    const input = this.template.querySelector(".input");
    if (!input.validity.valid) {
      return;
    } else if (
      this.isOptionsEnabled &&
      this.question.Question_Options__r.length < 2
    ) {
      this.showToastMessage(
        this.ERROR_TITLE,
        error_few_options,
        this.ERROR_VARIANT
      );
      return;
    }

    this.getQuestionAttributes();

    const addEvent = new CustomEvent("add", {
      detail: { ...this.question }
    });
    this.dispatchEvent(addEvent);

    this.resetForm();
  }

  cancelQuestionEdit() {
    const cancelEvent = new CustomEvent("canseledit");
    this.dispatchEvent(cancelEvent);

    this.isEditMode = false;
    this.resetForm();
  }

  editQuestion() {
    const input = this.template.querySelector(".input");
    if (!input.validity.valid) {
      return;
    } else if (
      this.isOptionsEnabled &&
      this.question.Question_Options__r.length < 2
    ) {
      this.showToastMessage(
        this.ERROR_TITLE,
        option_already_exists,
        this.ERROR_VARIANT
      );
      return;
    }

    this.getQuestionAttributes();

    const editEvent = new CustomEvent("edit", {
      detail: { ...this.question }
    });
    this.dispatchEvent(editEvent);

    this.resetForm();
    this.isEditMode = false;
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

  sendErrorNotification() {
    const errorEvent = new CustomEvent("error", {});
    this.dispatchEvent(errorEvent);
  }

  resetForm() {
    const input = this.template.querySelector(".input");
    input.value = "";
    this.selectedType = this.displayedTypes
      ? this.displayedTypes[0].value
      : "Text";
    this.selectedSettings = [];
    this.setOptionsEnabling();
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
