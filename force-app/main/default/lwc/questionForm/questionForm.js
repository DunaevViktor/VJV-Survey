import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class QuestionForm extends LightningElement {
  SUCCESS_TITLE = "Success";
  SUCCESS_VARIANT = "success";

  ERROR_TITLE = "Error";
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
    this.question[event.detail.value] = !this.question[event.detail.value];
  }

  setOptionsEnabling() {
    this.isOptionsEnabled =
      this.selectedType.toLowerCase().localeCompare("checkbox") === 0 ||
      this.selectedType.toLowerCase().localeCompare("radiobutton") === 0 ||
      this.selectedType.toLowerCase().localeCompare("picklist") === 0;
  }

  get questionSettingList() {
    return [
      { label: "Is required", value: "Required__c" },
      { label: "Is reusable", value: "IsReusable__c" }
    ];
  }

  @api
  setQuestion(clearQuestion) {
    this.question = clearQuestion;
    this.question.Question_Options__r = [];
  }

  @api
  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    const input = this.template.querySelector(".input");
    input.value = this.question.Label__c;

    this.selectedType = this.question.Type__c;
    this.selectedSettings = [];

    if (this.question.Required__c) this.selectedSettings.push("Required__c");
    if (this.question.IsReusable__c)
      this.selectedSettings.push("IsReusable__c");

    this.setOptionsEnabling();

    this.isEditMode = true;
  }

  addOption() {
    const input = this.template.querySelector(".option-input");
    if (!input.validity.valid) return;

    const filteredOptions = this.question.Question_Options__r.filter(
      (option) => {
        return option.Value__c.localeCompare(input.value) === 0;
      }
    );

    if (filteredOptions.length > 0) {
      this.showToastMessage(
        this.ERROR_TITLE,
        "Option with such value already exists!",
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
        "Option with such value already exists!",
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
        "The number of options must be at least two",
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
        "The number of options must be at least two",
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

  resetForm() {
    const input = this.template.querySelector(".input");
    input.value = "";
    this.selectedType = this.displayedTypes[0].value;
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
