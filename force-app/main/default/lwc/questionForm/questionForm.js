import { LightningElement, wire, track, api } from "lwc";
import QUESTION_OBJECT from "@salesforce/schema/Question__c";
import TYPE_FIELD from "@salesforce/schema/Question__c.Type__c";
import VALIDATION_OBJECT from "@salesforce/schema/Validation__c";
import OPERATOR_FIELD from "@salesforce/schema/Validation__c.Operator__c";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { validationFields, questionFields, optionFields } from "c/fieldService";

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
  questionTypes,
  operatorTypes,
  booleanPicklistOptions,
} from "c/formUtil";

export default class QuestionForm extends LightningElement {
  EMPTY_STRING = '';
  ZERO = 0;

  TEXT_TYPE = 'Text';
  MIN_OPTIONS_AMOUNT = 2;
  MAX_RATING_VALUE = 10;

  label = label;

  ERROR_TITLE = label.errorTitle;
  ERROR_VARIANT = "error";

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
  @track editOptionValue = this.EMPTY_STRING;
  @track editOptionIndex;

  displayedTypes;
  operators;
  @track displayedOperators;
  @track selectedOperator;
  @track isMainQuestionPicklist;
  @track isDisabled = true;

  isOptionInsideForm = true;

  connectedCallback() {
    if(this.isEditMode) {
      this.setQuestionForEdit(this.questionForForm);
      if(this.isDependentQuestion) this.selectedOperator = this.validationForForm[validationFields.OPERATOR];
      this.isDisabled = false;
    } else {
      this.isOptionsEnabled = false;
      this.question = {};
      this.question[questionFields.LABEL] = this.EMPTY_STRING;
      this.question.Question_Options__r = [];
    }
  }

  get questionSettingList() {
    return [
      { label: label.is_required, value: questionFields.REQUIRED },
      { label: label.is_reusable, value: questionFields.REUSABLE }
    ];
  }

  @wire(getPicklistValues, {
    recordTypeId: "$surveyObjectInfo.data.defaultRecordTypeId",
    fieldApiName: TYPE_FIELD
  })
  initTypes({ error, data: types }) {
    if (types) {
      this.displayedTypes = transformQuestionTypes(types);
      if(!this.isEditMode) this.selectedType = this.displayedTypes[0].value;
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
          this.validationForForm[validationFields.RELATED], 
          this.validationForForm[validationFields.OPERATOR]);
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

    return this.validationForForm[validationFields.RELATED].Question_Options__r.map((option) => {
      return {
        label: option[optionFields.VALUE],
        value: option[optionFields.VALUE]
      };
    });
  }

  get questionLabel() {
    return this.question[questionFields.LABEL]
  }

  get validationQuestionLabel() {
    if(!this.isDependentQuestion) {
      return this.EMPTY_STRING;
    }
    return this.validationForForm[validationFields.RELATED][questionFields.LABEL];
  }

  get validatiorOperator() {
    if(!this.isDependentQuestion) {
      return this.EMPTY_STRING;
    }
    return this.validationForForm[validationFields.OPERATOR];
  }

  get validationValue() {
    if(!this.isDependentQuestion) {
      return this.EMPTY_STRING;
    }
    return this.validationForForm[validationFields.VALUE];
  }

  @api
  resetForm() {
    const input = this.template.querySelector(".input");
    clearInput(input);
    this.selectedType = this.displayedTypes ? this.displayedTypes[0].value : this.TEXT_TYPE;
    this.selectedSettings = [];
    this.question = {};
    this.question.Question_Options__r = [];
    this.setOptionsEnabling();
  }

  setQuestionForEdit(editQuestion) {
    this.question = JSON.parse(JSON.stringify(editQuestion));

    this.selectedType = this.question[questionFields.TYPE];
    this.selectedSettings = [];

    if (this.question[questionFields.REQUIRED]) this.selectedSettings.push(questionFields.REQUIRED);
    if (this.question[questionFields.REUSABLE]) this.selectedSettings.push(questionFields.REUSABLE);

    this.setOptionsEnabling();
  }

  setDisplayedOperators() {
    this.displayedOperators = [...resolveOperatorsByQuestionType(
      this.operators, this.validationForForm[validationFields.RELATED])];
  }

  handleLabel(event) {
    this.question[questionFields.LABEL]= event.detail.value;
  }

  handleTypeChange(event) {
    this.selectedType = event.detail.value;
    this.question[questionFields.TYPE] = event.detail.value;
    this.question.Question_Options__r = [];
    this.setOptionsEnabling();
  }

  handleSettingChange(event) {
    this.question[questionFields.REQUIRED] = false;
    this.question[questionFields.REUSABLE] = false;

    for (const value of event.detail.value) {
      this.question[value] = true;
    }
  }

  handleSelectOperator(event) {
    this.selectedOperator = event.detail.value;
    this.isMainQuestionPicklist = isNeedPicklist(
      this.validationForForm[validationFields.RELATED], 
      this.selectedOperator);
    this.isDisabled = false;
  }

  setOptionsEnabling() {
    this.isOptionsEnabled = isOptionEnabling(this.selectedType);
  }

  addOption() {
    const input = this.template.querySelector(".option-input");
    if(!this.isOptionCorrect(input)) return;

    this.question.Question_Options__r.push({
      [optionFields.VALUE]: input.value
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
    this.editOptionValue = this.EMPTY_STRING;
    this.editOptionIndex = null;
    this.isEditOption = false;
  }

  saveOptionChanges() {
    const input = this.template.querySelector(".option-input");
    if(!this.isOptionCorrect(input)) return;

    this.question.Question_Options__r[this.editOptionIndex][optionFields.VALUE] = input.value;
    this.cancelOptionEdit();
  }

  deleteOption(event) {
    if(this.editOptionValue.localeCompare(event.detail) === this.ZERO) {
      this.cancelOptionEdit();
    } else {
      const index = findOptionIndexByValue(this.question.Question_Options__r, event.detail);
      if(index < this.editOptionIndex) this.editOptionIndex--;
    }
    
    this.question.Question_Options__r = deleteFromOptions(this.question.Question_Options__r, event.detail);
  }

  isOptionCorrect(input) {
    if (input.value.trim().length === this.ZERO) {
      input.value = this.EMPTY_STRING;
      setInputValidity(input, label.complete_this_field);
      return false;
    }

    const filteredOptions = this.isEditOption ? 
    filterOptionsByValueAndIndex(this.question.Question_Options__r, input.value, this.editOptionIndex) :
    filterOptionsByValue(this.question.Question_Options__r, input.value);

    if (filteredOptions.length > this.ZERO) {
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

    const validation = {
      ...this.validationForForm,
      [validationFields.DEPENDENT]: JSON.parse(JSON.stringify(this.question)),
      [validationFields.OPERATOR]: this.selectedOperator,
      [validationFields.VALUE]: input.value
    };
    validation[validationFields.DEPENDENT].VisibilityReason = buildVisibilityMessage(validation);

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
      (this.isOptionsEnabled && this.question.Question_Options__r.length === this.ZERO)
    ) {
      this.question.Question_Options__r = null;
    }
    this.question[questionFields.TYPE] = this.selectedType;
  }

  isQuestionCorrect() {
    let isValid = true;
    const input = this.template.querySelector(".input");

    if (input.value.trim().length === this.ZERO) {
      input.value = this.EMPTY_STRING;
      setInputValidity(input, label.complete_this_field);
      isValid = false;
    } else {
      setInputValidity(input, this.EMPTY_STRING);
    }
    
    if (this.isOptionsEnabled &&this.question.Question_Options__r.length < this.MIN_OPTIONS_AMOUNT) {
      this.showToastMessage(
        this.ERROR_TITLE,
        label.error_few_options,
        this.ERROR_VARIANT
      );
      isValid = false;
    }

    if(this.isDependentQuestion) {
      const operatorCombobox = this.template.querySelector(".validation-operator");
      if(!this.selectedOperator) {
        setInputValidity(operatorCombobox, label.select_operator);
        isValid = false;
      } else {
        setInputValidity(operatorCombobox, this.EMPTY_STRING);
      }

      const validationInput = this.template.querySelector(".validationInput");
      if (!this.isMainQuestionPicklist && validationInput.value.trim().length === this.ZERO) {
        validationInput.value = this.EMPTY_STRING;
        setInputValidity(validationInput, label.complete_this_field);
        isValid = false;
      } else if (this.isMainQuestionPicklist && this.selectedOperator && !validationInput.value) {
        setInputValidity(validationInput, label.complete_this_field);
        isValid = false;
      }else if(this.validationForForm[validationFields.RELATED][questionFields.TYPE] 
        === questionTypes.RATING && +validationInput.value > this.MAX_RATING_VALUE) {
        setInputValidity(validationInput, label.rating_can_not_be_greater_ten);
        isValid = false;
      } else {
        setInputValidity(validationInput, this.EMPTY_STRING);
      }
    }

    return isValid;
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