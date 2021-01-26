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
  findQuestionsForDownSwap,
  findQuestionsForUpSwap,
  resetOptionsIds
} from "./questionScreenHelper.js";

import {
  findQuestionByPosition
} from "c/formUtil";

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

  @wire(getMaxQuestionAmount) maxQuestionsAmount;
  @wire(getMinQuestionAmount) minQuestionsAmount;

  @track isEditMode;
  @track questionForEdit;
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
    const question = event.detail;
    question.Position__c = this.displayedQuestions.length + 1;

    if(this.displayedQuestions.length === this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }
    this.displayedQuestions.push(question);

    this.updateQuestions();
  }

  selectQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    question.Position__c = this.displayedQuestions.length + 1;
    question.IsReusable__c = false;
    question.Id = null;

    if(question.Question_Options__r) {
      question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
    }

    this.displayedQuestions.push(question);

    this.updateQuestions();
  }

  updateQuestions() {
    if(this.isQuestionBlockOpened) {
      this.template.querySelectorAll("c-questions-block")[0].updateQuestions(this.displayedQuestions);
    } else {
      this.openQuestionBlock();
    }
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

  editQuestion(event) {
    console.log(JSON.parse(JSON.stringify(event.detail)));
    this.questionForEdit = event.detail;
    this.editQuestionPosition = this.questionForEdit.Position__c
    this.isEditMode = true;
    this.openForm();
  }

  addOptional() {

  }

  updateQuestion(event) {
    const updatedQuestion = event.detail;

    this.displayedQuestions = updateQuestionByPosition(
      this.questions, 
      this.editQuestionPosition, 
      updatedQuestion);

    this.isEditMode = false;
    this.editQuestionPosition = null;
    this.openQuestionBlock();
  }
}