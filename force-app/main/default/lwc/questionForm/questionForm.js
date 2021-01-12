import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {questionTypes} from "c/formUtil";
import { label } from "./labels.js";

export default class QuestionForm extends LightningElement {
  label = label;

  SUCCESS_TITLE = label.success;
  SUCCESS_VARIANT = "success";

  ERROR_TITLE = label.errorTitle;
  ERROR_VARIANT = "error";

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

  connectedCallback() {
    this.isOptionsEnabled = false;
    this.question = {};
    this.question.Question_Options__r = [];
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
      { label: label.is_required, value: this.requiredFieldName },
      { label: label.is_reusable, value: this.reusableFieldName }
    ];
  }

  @api
  clearQuestion() {
    this.question = {};
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
    
    if (filteredOptions.length > 0) {
      this.showToastMessage(
        this.ERROR_TITLE,
        label.option_already_exists,
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
        label.option_already_exists,
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
        label.error_few_options,
        this.ERROR_VARIANT
      );
      return;
    }

    this.getQuestionAttributes();

    const addEvent = new CustomEvent("add", {
      detail: { ...this.question }
    });
    this.dispatchEvent(addEvent);
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
        label.option_already_exists,
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
