/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track, wire } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {label} from "./labels";

import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class QuestionScreen extends LightningElement {

  ERROR_VARIANT = "error";
  NO_TEMPLATE_VALUE = "0";

  @track displayedQuestions = [];
  @track displayedTemplates = [];
  @track displayedTemplateQuestions = [];
  @track displayedStandardQuestions = [];

  @api selectedTemplateName;
  
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

  @wire(getMaxQuestionAmount) maxQuestionsAmount;

  @track hasQuestions = false;
  @track hasStandardQuestions = false;
  @track editQuestionPosition;

  @track templateOptionsValue;
  @track noTemplate;

  @track isError = false;

  label = label;

  connectedCallback() {
    this.hasQuestions = this.displayedQuestions.length > 0;
    this.hasStandardQuestions = this.displayedStandardQuestions.length > 0;

    this.initTemplates();
    this.initStandardQuestions();

    this.noTemplate = {
      label: label.no_template,
      value: this.NO_TEMPLATE_VALUE
    };

    this.templateOptionsValue = this.selectedTemplateName ? 
      this.selectedTemplateName : this.noTemplate.value;
  }

  get templateOptions() {
    let templateOptions;

    if (this.displayedTemplates) {
      templateOptions = this.displayedTemplates.map((template) => {
        return {
          label: template.Name,
          value: template.Id
        };
      });
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
      .catch((error) => {
        console.log(error);
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
      .catch((error) => {
        console.log(error);
        this.setError();
      });
  }

  initStandardQuestions() {
    if(!this.hasStandardQuestions) {
      getStandardQuestions()
      .then((result) => {
        this.displayedStandardQuestions = result;
        this.hasStandardQuestions = this.displayedStandardQuestions.length > 0;
      })
      .catch((error) => {
        console.log(error);
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
      this.displayedQuestions = this.displayedTemplateQuestions.filter(
        (question) => {
          return (
            question.Survey__c.localeCompare(this.templateOptionsValue) === 0
          );
        }
      );
      this.displayedQuestions = this.displayedQuestions.map(
        (question, index) => {
          question.Id = null;
          question.Position__c = index + 1;
          return JSON.parse(JSON.stringify(question));
        }
      );
    }

    this.hasQuestions = this.displayedQuestions.length > 0;

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

    this.hasQuestions = this.displayedQuestions.length > 0;
    this.initQuestion();
  }

  editQuestion(event) {
    let position = +event.detail;
    this.editQuestionPosition = position;

    const questionForEdit = this.displayedQuestions.filter((question) => {
      return +question.Position__c === +position;
    })[0];

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

    this.hasQuestions = this.displayedQuestions.length > 0;
  }

  updateQuestion(event) {
    const updatedQuestion = event.detail;

    this.displayedQuestions = this.displayedQuestions.map((question) => {
      if (+question.Position__c === +this.editQuestionPosition) {
        return {
          ...updatedQuestion,
          Position__c: this.editQuestionPosition
        };
      }
      return question;
    });

    this.editQuestionPosition = null;
  }

  downQuestion(event) {
    const position = +event.detail;

    if (position === this.displayedQuestions.length) return;

    let relocatableQuestion = {},
      lowerQuestion = {};
    let relocatableIndex, lowerIndex;

    this.displayedQuestions.forEach((question, index) => {
      if (+question.Position__c === position) {
        relocatableQuestion = question;
        relocatableIndex = index;
      } else if (+question.Position__c === position + 1) {
        lowerQuestion = question;
        lowerIndex = index;
      }
    });

    if (+this.editQuestionPosition === +lowerQuestion.Position__c) {
      this.editQuestionPosition = relocatableQuestion.Position__c;
    } else if (
      +this.editQuestionPosition === +relocatableQuestion.Position__c
    ) {
      this.editQuestionPosition = lowerQuestion.Position__c;
    }

    lowerQuestion.Position__c--;
    relocatableQuestion.Position__c++;

    this.displayedQuestions[relocatableIndex] = lowerQuestion;
    this.displayedQuestions[lowerIndex] = relocatableQuestion;
  }

  upQuestion(event) {
    const position = +event.detail;

    if (position === 1) return;

    let relocatableQuestion = {},
      upperQuestion = {};
    let relocatableIndex, upperIndex;

    this.displayedQuestions.forEach((question, index) => {
      if (+question.Position__c === position) {
        relocatableQuestion = question;
        relocatableIndex = index;
      } else if (+question.Position__c === position - 1) {
        upperQuestion = question;
        upperIndex = index;
      }
    });

    if (+this.editQuestionPosition === +upperQuestion.Position__c) {
      this.editQuestionPosition = relocatableQuestion.Position__c;
    } else if (
      +this.editQuestionPosition === +relocatableQuestion.Position__c
    ) {
      this.editQuestionPosition = upperQuestion.Position__c;
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

    this.displayedQuestions.push(question);

    this.hasQuestions = this.displayedQuestions.length > 0;
  }

  setError() {
    this.isError = true;
  }

  clickPreviousButton() {
    //this.questions = this.displayedQuestions;
    this.selectedTemplateName = this.templateOptionsValue;

    const backNavigationEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(backNavigationEvent);
  }

  clickNextButton() {
    if(this.displayedQuestions.length < 2) {
      this.showToastMessage(label.unable_to_continue, label.should_have_two_questions, this.ERROR_VARIANT);
      return;
    } 

    //this.questions = this.displayedQuestions;
    this.selectedTemplateName = this.templateOptionsValue;

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
