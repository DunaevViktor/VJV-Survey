import { LightningElement, api, track, wire } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";
import getMinQuestionAmount from "@salesforce/apex/SurveySettingController.getMinQuestionAmount";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { surveyFields, validationFields, questionFields } from "c/fieldService";

import {label} from "./labels";
import {
  trasnformResult,
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  updateValidationByPosition,
  solveQuestionPosition,
  prepareSelectedQuestion,
  resolveQuestionsByDeleted,
  resolveValidationsByDeleted,
  prepareValidationForPush,
  swapQuestions,
  swapValidations,
  findSwapIndex,
  sortQuestionsFunction,
  resolveEditableQuestions
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
      return template[surveyFields.ID];
    });

    getTemplatesQuestions({ surveyIds: templateIds })
      .then((result) => {
        this.displayedTemplateQuestions = trasnformResult(result);
      })
      .catch(() => {
        this.setError();
      });
  }

  initStandardQuestions() {
    if(!this.hasStandardQuestions) {
      getStandardQuestions()
      .then((result) => {
        this.displayedStandardQuestions = trasnformResult(result);
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
    this.displayedQuestions = getQuestionsBySurveyId(
      this.templateQuestions, this.templateOptionsValue, this.NO_TEMPLATE_VALUE);

    this.updateQuestions();
  }

  openClearForm() {
    this.clearFormAttributes();
    
    if(this.isFormOpened) {
      this.template.querySelectorAll("c-question-form")[0].resetForm();
      return;
    }

    this.openForm();
  }

  addQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    this.pushQuestion(question);
  }

  addDependantQuestion(event) {
    const validation = prepareValidationForPush(this.validations, event.detail);

    if(this.displayedQuestions.length === +this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }

    this.displayedQuestions = updateQuestionByPosition(
      this.questions, validation[validationFields.RELATED][questionFields.POSITION], 
      JSON.parse(JSON.stringify(validation[validationFields.RELATED])));
    
    this.displayedQuestions.push(JSON.parse(JSON.stringify(validation[validationFields.DEPENDANT])));
    this.displayedValidations.push(validation);

    this.clearFormAttributes();
    this.updateQuestions();
  }

  selectQuestion(event) {
    const question = prepareSelectedQuestion(event.detail);
    this.pushQuestion(question);
  }

  pushQuestion(question) {
    question[questionFields.POSITION] = solveQuestionPosition(this.displayedQuestions);
    question.Editable = true;

    if(this.displayedQuestions.length === +this.maxQuestionsAmount.data) {
      this.showToastMessage(label.unable_to_continue, label.limit_question_sexceeded, this.ERROR_VARIANT);
      return;
    }

    this.displayedQuestions.push(question);
    this.updateQuestions();
  }

  updateQuestions() {
    this.displayedQuestions.sort(sortQuestionsFunction);

    if(this.isQuestionBlockOpened) {
      this.template.querySelectorAll("c-questions-block")[0].updateQuestions(this.displayedQuestions);
    } else {
      this.openQuestionBlock();
    }
  }
  
  editQuestion(event) {
    this.questionForForm = event.detail;
    this.editQuestionPosition = this.questionForForm[questionFields.POSITION]
    this.isEditMode = true;

    if(this.questionForForm.VisibilityReason) {
      this.isDependentQuestion = true;
      this.validationForForm = this.displayedValidations.filter((validation) => {
        return validation[validationFields.DEPENDANT][questionFields.POSITION] 
        === this.questionForForm[questionFields.POSITION];
      })[0];
    }

    this.openForm();
  }

  addOptional(event) {
    this.validationForForm = {
      [validationFields.RELATED]: JSON.parse(JSON.stringify(event.detail))
    };
    this.isDependentQuestion = true;
    this.openForm();
  }

  updateQuestion(event) {
    const value = event.detail;

    if(!this.isDependentQuestion) {
      this.displayedQuestions = updateQuestionByPosition(this.questions, this.editQuestionPosition, value);
    } else {
      this.displayedQuestions = updateQuestionByPosition(
        this.questions, this.editQuestionPosition, JSON.parse(JSON.stringify(value[validationFields.DEPENDANT])));

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
    this.displayedQuestions = resolveEditableQuestions(this.questions, this.validations);

    this.updateQuestions();
  }

  downQuestion(event) {
    const position = event.detail;

    const downQuestionIndex = findSwapIndex(this.questions, position, -1);
    if(!downQuestionIndex) {
      return;
    }

    const downPosition = this.questions[downQuestionIndex][questionFields.POSITION];

    this.displayedQuestions = swapQuestions(this.questions, position, downPosition);
    this.displayedValidations = swapValidations(this.validations, position, downPosition);

    this.updateQuestions();
  }

  upQuestion(event) {
    const position = event.detail;

    if(+position.slice(-1) === 1) {
      return;
    }

    const upperQuestionIndex = findSwapIndex(this.questions, position, 1);
    const upperPosition = this.questions[upperQuestionIndex][questionFields.POSITION];

    this.displayedQuestions = swapQuestions(this.questions, upperPosition, position);
    this.displayedValidations = swapValidations(this.validations, upperPosition, position);

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
      title, message, variant
    });
    this.dispatchEvent(event);
  }

  setError() {
    this.isError = true;
  }

  cancelEditQuestion() {
    this.clearFormAttributes();
    this.openQuestionBlock();
  }
}