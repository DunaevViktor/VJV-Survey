import { LightningElement, api, track, wire } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";
import getMinQuestionAmount from "@salesforce/apex/SurveySettingController.getMinQuestionAmount";
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";
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
  @wire(getPageQuestionAmount) pageQuestionsAmount;

  @track filteredQuestions;
  @track hasQuestions = false;
  @track isNeedPagination = false;
  @track editQuestionPosition;
  @track isError = false;

  label = label;

  @track isFormOpen = false;
  @track isStandardSelectorOpen = false;

  @track currentPage = 1;
  @track amountPages;

  connectedCallback() {
    this.resolveQuestionsSubinfo();
    this.resolveDisplayedQuestions();

    this.initTemplates();
    this.initStandardQuestions();
  }

  get labelOfAvailableItems() {
    switch(this.availableQuestionsAmount) {
      case 1: return this.label.you_can_create + " " + this.availableQuestionsAmount + " " + this.label.question;
      case 0: return this.label.can_no_longer_create_questions;
      default: return this.label.you_can_create + " " + this.availableQuestionsAmount + " " + this.label.questions;
    }
  }

  get availableQuestionsAmount() {
    return +this.maxQuestionsAmount.data - +this.displayedQuestions.length;
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

  openForm() {
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  openStandardSelector() {
    this.isStandardSelectorOpen = true;
  }

  closeStandardSelector() {
    this.isStandardSelectorOpen = false;
  }

  clearFormQuestion() {
    this.template
          .querySelectorAll("c-question-form")[0]
          .clearQuestion();
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

    this.resolveQuestionsSubinfo();
    this.resolveDisplayedQuestions();
    this.currentPage = 1;
  }

  addQuestion(event) {
    const question = event.detail;
    question.Position__c = this.displayedQuestions.length + 1;

    if(this.displayedQuestions.length === this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }
    this.displayedQuestions.push(question);

    this.resolveQuestionsSubinfo();
    this.resolveDisplayedQuestions();
    this.closeForm();
  }

  selectQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    question.Position__c = this.displayedQuestions.length + 1;
    question.IsReusable__c = false;
    question.Id = null;

    if(!!question.Question_Options__r) {
      question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
    }

    this.displayedQuestions.push(question);

    this.resolveQuestionsSubinfo();
    this.resolveDisplayedQuestions();
    this.closeStandardSelector();
  }

  resolveQuestionsSubinfo() {
    this.hasQuestions = this.questions.length > 0;
    this.amountPages =  Math.ceil(this.questions.length / +this.pageQuestionsAmount.data);
    this.isNeedPagination = this.questions.length > +this.pageQuestionsAmount.data;

    if(this.amountPages > 2) {
      const paginationBlock = this.template.querySelectorAll("c-question-pagination")[0];
      if(paginationBlock) paginationBlock.setAmountPages(this.amountPages);
    }
  }

  changePage(event) {
    this.currentPage = event.detail;
    this.resolveDisplayedQuestions();
  }

  resolveDisplayedQuestions() {
    this.filteredQuestions = this.displayedQuestions.filter((item, index) => {
      return index >= (this.currentPage-1) * +this.pageQuestionsAmount.data && index < (this.currentPage) * +this.pageQuestionsAmount.data;
    });
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
}