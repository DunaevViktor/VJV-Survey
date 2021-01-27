import { LightningElement, api, track, wire } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";
import getMinQuestionAmount from "@salesforce/apex/SurveySettingController.getMinQuestionAmount";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import {label} from "./labels";
import {
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  resetOptionsIds,
  updateValidationByPosition,
  solveQuestionPosition,
  solveDependentQuestionPosition,
  resolveQuestionsByDeleted,
  resolveValidationsByDeleted,
  prepareValidationForPush
} from "./questionScreenHelper.js";

import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class QuestionScreen extends LightningElement {
  QUESTION_BLOCK = 'Question block';
  FORM_BLOCK = 'Form block';
  STANDARD_SELECTOR_BLOCK = 'Standard selector block';

  ERROR_VARIANT = "error";
  NO_TEMPLATE_VALUE = "0";

  @track displayedQuestions = [];
  @track displayedTemplates = [];
  @track displayedTemplateQuestions = [];
  @track displayedStandardQuestions = [];
  @track displayedValidations = [];
  @track templateOptionsValue = this.NO_TEMPLATE_VALUE;
  
  get questions() {
    return this.displayedQuestions;
  };

  get templates() {
    return this.displayedTemplates;
  }

  get templateQuestions() {
    return this.displayedTemplateQuestions;
  }

  get standardQuestions() {
    return this.displayedStandardQuestions;
  }

  get selectedTemplateName() {
    return this.templateOptionsValue;
  }

  get validations() {
    return this.displayedValidations;
  }

  @api 
  set questions(value) {
    this.displayedQuestions = JSON.parse(JSON.stringify(value));
  };

  @api
  set templates(value) {
    this.displayedTemplates = JSON.parse(JSON.stringify(value));
  }
  
  @api
  set templateQuestions(value) {
    this.displayedTemplateQuestions = JSON.parse(JSON.stringify(value));
  };
  
  @api
  set standardQuestions(value) {
    this.displayedStandardQuestions = JSON.parse(JSON.stringify(value));
  }

  @api 
  set selectedTemplateName(value) {
    this.templateOptionsValue = value;
  }

  @api
  set validations(value) {
    this.displayedValidations = JSON.parse(JSON.stringify(value));
  }

  @wire(getMaxQuestionAmount) maxQuestionsAmount;
  @wire(getMinQuestionAmount) minQuestionsAmount;

  @track isEditMode = false;
  @track isDependentQuestion = false;
  @track questionForForm;
  @track validationForForm;
  @track editQuestionPosition;
  @track isError = false;

  label = label;

  @track currentMode = this.QUESTION_BLOCK;

  connectedCallback() {
    this.hasStandardQuestions = this.standardQuestions.length > 0;
    
    this.initTemplates();
    this.initStandardQuestions();
  }

  initTemplates() {
    if(this.displayedTemplates.length === 0) {
      getTemplateSurveys()
      .then((result) => {
        this.displayedTemplates = result;
        this.initTemplateQuestions();
      })
      .catch(() => {
        this.setError();
      });
    }
  }

  initTemplateQuestions() {
    const templateIds = this.displayedTemplates.map((template) => {
      return template.Id;
    });

    getTemplatesQuestions({ surveyIds: templateIds })
      .then((result) => {
        this.displayedTemplateQuestions = result;
      })
      .catch(() => {
        this.setError();
      });
  }

  initStandardQuestions() {
    if(!this.hasStandardQuestions) {
      getStandardQuestions()
      .then((result) => {
        this.displayedStandardQuestions = result;
        this.hasStandardQuestions = this.standardQuestions.length > 0;
      })
      .catch(() => {
        this.setError();
      });
    }
  }

  openQuestionBlock() {
    this.currentMode = this.QUESTION_BLOCK;
  }

  openForm() {
    this.currentMode = this.FORM_BLOCK;
  }

  openStandardSelector() {
    this.currentMode = this.STANDARD_SELECTOR_BLOCK;
  }

  get isQuestionBlockOpened() {
    return this.currentMode === this.QUESTION_BLOCK;
  }

  get isFormOpened() {
    return this.currentMode === this.FORM_BLOCK;
  }

  get isStandardSelectorOpen() {
    return this.currentMode === this.STANDARD_SELECTOR_BLOCK;
  }

  handleTemplateChange(event) {
    if (this.templateOptionsValue.localeCompare(event.detail) === 0) {
      return;
    }

    this.templateOptionsValue = event.detail;

    if (this.templateOptionsValue.localeCompare(this.NO_TEMPLATE_VALUE) === 0) {
      this.displayedQuestions = [];
    } else {
      this.displayedQuestions = getQuestionsBySurveyId(
        this.templateQuestions, 
        this.templateOptionsValue);
    }

    this.updateQuestions();
  }

  addQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    this.pushQuestion(question);
  }

  addDependantQuestion(event) {
    const validation = prepareValidationForPush(this.validations, event.detail);

    if(this.displayedQuestions.length === this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }

    this.displayedQuestions = updateQuestionByPosition(
      this.questions, validation.Related_Question__c.Position__c, validation.Related_Question__c);
    
    this.displayedQuestions.push(validation.Dependent_Question__c);
    this.displayedValidations.push(validation);

    this.clearFormAttributes();
    this.updateQuestions();
  }

  selectQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    question.IsReusable__c = false;
    question.Id = null;

    if(question.Question_Options__r) {
      question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
    }

    this.pushQuestion(question);
  }

  pushQuestion(question) {
    question.Position__c = solveQuestionPosition(this.displayedQuestions);
    question.Editable = true;

    if(this.displayedQuestions.length === this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }

    this.displayedQuestions.push(question);
    this.updateQuestions();
  }

  updateQuestions() {
    this.displayedQuestions.sort((firstItem, secondItem) => {
      return firstItem.Position__c.localeCompare(secondItem.Position__c);
    })

    if(this.isQuestionBlockOpened) {
      this.template.querySelectorAll("c-questions-block")[0].updateQuestions(this.displayedQuestions);
    } else {
      this.openQuestionBlock();
    }
  }
  editQuestion(event) {
    this.questionForForm = event.detail;
    this.editQuestionPosition = this.questionForForm.Position__c
    this.isEditMode = true;

    if(this.questionForForm.VisibilityReason) {
      this.isDependentQuestion = true;
      this.validationForForm = this.displayedValidations.filter((validation) => {
        return validation.Dependent_Question__c.Position__c === this.questionForForm.Position__c;
      })[0];
    }

    this.openForm();
  }

  addOptional(event) {
    this.validationForForm = {
      Related_Question__c: JSON.parse(JSON.stringify(event.detail))
    };
    this.isDependentQuestion = true;
    this.openForm();
  }

  updateQuestion(event) {
    let value = event.detail;

    if(!this.isDependentQuestion) {
      this.displayedQuestions = updateQuestionByPosition(
        this.questions, this.editQuestionPosition, value);
    } else {
      this.displayedQuestions = updateQuestionByPosition(
        this.questions, this.editQuestionPosition, value.Dependent_Question__c);

      this.displayedValidations = updateValidationByPosition(this.validations, value);
    }
    
    this.clearFormAttributes();
    this.openQuestionBlock();
  }

  clearFormAttributes() {
    this.isEditMode = false;
    this.isDependentQuestion = false;
    this.questionForForm = {};
    this.validationForForm = {};
    this.editQuestionPosition = null;
  }

  deleteQuestions(event) {
    const position = event.detail;

    this.displayedQuestions = resolveQuestionsByDeleted(this.questions, position);
    this.displayedValidations = resolveValidationsByDeleted(this.validations, position);

    this.updateQuestions();
  }

  clickPreviousButton() {
    const backNavigationEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(backNavigationEvent);
  }

  clickNextButton() {
    if(this.displayedQuestions.length < +this.minQuestionsAmount.data) {
      const errorMessage = label.you_must_have_at_least + " " + this.minQuestionsAmount.data + " " +label.questions;
      this.showToastMessage(label.unable_to_continue, errorMessage, this.ERROR_VARIANT);
      return;
    } 

    const nextNavigationEvent = new FlowNavigationNextEvent();
    this.dispatchEvent(nextNavigationEvent);
  }

  showToastMessage(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(event);
  }

  setError() {
    this.isError = true;
  }

  cancelEditQuestion() {
    this.isEditMode = false;
    this.currentMode = this.QUESTION_BLOCK;
  }
}