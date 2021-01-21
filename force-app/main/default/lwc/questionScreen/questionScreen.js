import { LightningElement, api, track, wire } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import {label} from "./labels";
import {
  transformDisplayesTypes,
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

  @track hasQuestions = false;
  @track hasStandardQuestions = false;
  @track editQuestionPosition;
  @track noTemplate;
  @track isError = false;

  label = label;

  connectedCallback() {
    this.hasQuestions = this.questions.length > 0;
    this.hasStandardQuestions = this.standardQuestions.length > 0;

    this.initTemplates();
    this.initStandardQuestions();

    this.noTemplate = {
      label: label.no_template,
      value: this.NO_TEMPLATE_VALUE
    };
  }

  get templateOptions() {
    let templateOptions;

    if (this.displayedTemplates) {
      templateOptions = transformDisplayesTypes(this.displayedTemplates);
    } else {
      templateOptions = [];
    }

    templateOptions.push(this.noTemplate);
    return templateOptions;
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

  initQuestion() {
    this.template
          .querySelectorAll("c-question-form")[0]
          .clearQuestion();
  }

  handleTemplateChange(event) {
    if (this.templateOptionsValue.localeCompare(event.detail.value) === 0) {
      return;
    }

    this.templateOptionsValue = event.detail.value;

    if (this.templateOptionsValue.localeCompare(this.NO_TEMPLATE_VALUE) === 0) {
      this.displayedQuestions = [];
    } else {
      this.displayedQuestions = getQuestionsBySurveyId(
        this.templateQuestions, 
        this.templateOptionsValue);
    }

    this.hasQuestions = this.questions.length > 0;

    if (this.editQuestionPosition) {
      this.initQuestion();
      this.editQuestionPosition = null;
    }
  }

  addQuestion(event) {
    const question = event.detail;
    question.Position__c = this.displayedQuestions.length + 1;

    if(this.displayedQuestions.length === this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }
    this.displayedQuestions.push(question);

    this.hasQuestions = this.questions.length > 0;
    this.initQuestion();
  }

  editQuestion(event) {
    let position = +event.detail;
    this.editQuestionPosition = position;

    const questionForEdit = findQuestionByPosition(this.displayedQuestions, +position);

    this.template
      .querySelectorAll("c-question-form")[0]
      .setQuestionForEdit(questionForEdit);
  }

  cancelEditQuestion() {
    this.editQuestionPosition = null;
    this.initQuestion();
  }

  deleteQuestion(event) {
    let position = +event.detail;

    if (position === this.editQuestionPosition) {
      this.initQuestion();
    }

    position--;

    this.displayedQuestions.splice(position, 1);

    for (let i = position; i < this.displayedQuestions.length; i++) {
      this.displayedQuestions[i].Position__c = i + 1;
    }

    this.hasQuestions = this.questions.length > 0;
  }

  updateQuestion(event) {
    const updatedQuestion = event.detail;

    this.displayedQuestions = updateQuestionByPosition(
      this.questions, 
      this.editQuestionPosition, 
      updatedQuestion);

    this.editQuestionPosition = null;
  }

  downQuestion(event) {
    const position = +event.detail;

    if (position === this.displayedQuestions.length) return;

    let {relocatableQuestion, relocatableIndex, lowerQuestion, lowerIndex} = 
      findQuestionsForDownSwap(this.displayedQuestions, position);

    if (this.editQuestionPosition === lowerIndex + 1) {
      this.editQuestionPosition = relocatableIndex + 1;
    } else if (this.editQuestionPosition === relocatableIndex + 1) {
      this.editQuestionPosition = lowerIndex + 1;
    }

    lowerQuestion.Position__c--;
    relocatableQuestion.Position__c++;

    this.displayedQuestions[relocatableIndex] = lowerQuestion;
    this.displayedQuestions[lowerIndex] = relocatableQuestion;
  }

  upQuestion(event) {
    const position = +event.detail;

    if (position === 1) return;

    let {relocatableQuestion, relocatableIndex, upperQuestion, upperIndex} =
      findQuestionsForUpSwap(this.displayedQuestions, position);
      
    if (this.editQuestionPosition === upperIndex + 1) {
      this.editQuestionPosition = relocatableIndex + 1;
    } else if (this.editQuestionPosition === relocatableIndex + 1) {
      this.editQuestionPosition = upperIndex + 1;
    }

    upperQuestion.Position__c++;
    relocatableQuestion.Position__c--;

    this.displayedQuestions[relocatableIndex] = upperQuestion;
    this.displayedQuestions[upperIndex] = relocatableQuestion;
  }

  selectQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    question.Position__c = this.displayedQuestions.length + 1;
    question.Id = null;

    if(!!question.Question_Options__r) {
      question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
      console.log('norm')
    }

    this.displayedQuestions.push(question);

    this.hasQuestions = this.displayedQuestions.length > 0;
  }

  setError() {
    this.isError = true;
  }

  clickPreviousButton() {
    const backNavigationEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(backNavigationEvent);
  }

  clickNextButton() {
    if(this.displayedQuestions.length < 2) {
      this.showToastMessage(label.unable_to_continue, label.should_have_two_questions, this.ERROR_VARIANT);
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
}