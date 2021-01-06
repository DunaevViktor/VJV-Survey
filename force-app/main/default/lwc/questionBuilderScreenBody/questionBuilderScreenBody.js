import { LightningElement, api, track } from "lwc";
import getTemplateSurveys from "@salesforce/apex/SurveyController.getTemplateSurveys";
import createQuestionList from "@salesforce/apex/QuestionController.createQuestionList";
import createQuestion from "@salesforce/apex/QuestionController.createQuestion";
import getStandardQuestions from "@salesforce/apex/QuestionController.getStandardQuestions";
import getTemplatesQuestions from "@salesforce/apex/QuestionController.getTemplatesQuestions";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import selected_survey_template from "@salesforce/label/c.selected_survey_template";
import no_questions from "@salesforce/label/c.no_questions";
import previous from "@salesforce/label/c.previous";
import next from "@salesforce/label/c.next";
import no_template from "@salesforce/label/c.no_template";
import unable_to_continue from "@salesforce/label/c.unable_to_continue";
import should_have_two_questions from "@salesforce/label/c.should_have_two_questions";

export default class QuestionBuilderScreenBody extends LightningElement {

  ERROR_VARIANT = "error";
  NO_TEMPLATE_VALUE = "0";

  @api templates;
  @api standardQuestions;
  @api templateQuestions;
  @api questions;

  @track displayedTemplates;
  @track displayedQuestions;
  @track displayedStandardQuestions;
  @track displayedTemplateQuestions;

  @track question;
  @track hasQuestions = false;
  @track editQuestionPosition;

  @track templateOptionsValue;
  noTemplate;

  label = {
    selected_survey_template,
    no_questions,
    previous,
    next
  };

  connectedCallback() {
    this.displayedQuestions = JSON.parse(JSON.stringify(this.questions));
    this.displayedTemplates = JSON.parse(JSON.stringify(this.templates));
    this.displayedTemplateQuestions = JSON.parse(
      JSON.stringify(this.templateQuestions)
    );
    this.displayedStandardQuestions = JSON.parse(
      JSON.stringify(this.standardQuestions)
    );

    this.initQuestions();
    this.initQuestion();
    this.initTemplates();
    this.initStandardQuestions();

    this.noTemplate = {
      label: no_template,
      value: this.NO_TEMPLATE_VALUE
    };

    this.templateOptionsValue = this.noTemplate.value;
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
    if (!this.displayedTemplates) {
      getTemplateSurveys()
        .then((result) => {
          this.displayedTemplates = result;
          this.sendTemplatesEvent();
          this.initTemplateQuestions();
        })
        .catch((error) => {
          console.log(error);
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
        this.sendTemplateQuestionsEvent();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  initStandardQuestions() {
    if (!this.displayedStandardQuestions) {
      getStandardQuestions()
        .then((result) => {
          this.displayedStandardQuestions = result;
          this.sendStandardQuestionsEvent();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  initQuestions() {
    if (!this.displayedQuestions) {
      createQuestionList()
        .then((result) => {
          this.displayedQuestions = result;
          this.hasQuestions = this.displayedQuestions.length > 0;
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.hasQuestions = this.displayedQuestions.length > 0;
    }
  }

  initQuestion() {
    createQuestion()
      .then((result) => {
        this.question = result;

        this.template
          .querySelectorAll("c-question-form")[0]
          .setQuestion(this.question);
      })
      .catch((error) => {
        console.log(error);
      });
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
    this.sendQuestionsChangeEvent();

    if (this.editQuestionPosition) {
      this.initQuestion();
      this.editQuestionPosition = null;
    }
  }

  addQuestion(event) {
    const question = event.detail;
    question.Position__c = this.displayedQuestions.length + 1;

    this.displayedQuestions.push(question);

    this.hasQuestions = this.displayedQuestions.length > 0;
    this.sendQuestionsChangeEvent();
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
    this.sendQuestionsChangeEvent();
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
    this.sendQuestionsChangeEvent();
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

    this.sendQuestionsChangeEvent();
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

    this.sendQuestionsChangeEvent();
  }

  selectQuestion(event) {
    const question = JSON.parse(JSON.stringify(event.detail));
    question.Position__c = this.displayedQuestions.length + 1;
    question.Id = null;

    this.displayedQuestions.push(question);

    this.hasQuestions = this.displayedQuestions.length > 0;
    this.sendQuestionsChangeEvent();
  }

  sendQuestionsChangeEvent() {
    const changeEvent = new CustomEvent("questionschange", {
      detail: { questions: [...this.displayedQuestions] }
    });
    this.dispatchEvent(changeEvent);
  }

  sendTemplatesEvent() {
    const changeEvent = new CustomEvent("templateschange", {
      detail: { templates: [...this.displayedTemplates] }
    });
    this.dispatchEvent(changeEvent);
  }

  sendTemplateQuestionsEvent() {
    const changeEvent = new CustomEvent("tquestionschange", {
      detail: { templateQuestions: [...this.displayedTemplateQuestions] }
    });
    this.dispatchEvent(changeEvent);
  }

  sendStandardQuestionsEvent() {
    const changeEvent = new CustomEvent("stquestionschange", {
      detail: { standardQuestions: [...this.displayedStandardQuestions] }
    });
    this.dispatchEvent(changeEvent);
  }

  clickPreviousButton() {
    const previousEvent = new CustomEvent("previous", {});
    this.dispatchEvent(previousEvent);
  }

  clickNextButton() {
    if(this.displayedQuestions.length < 2) {
      const event = new ShowToastEvent({
        title: unable_to_continue,
        message: should_have_two_questions,
        variant: this.ERROR_VARIANT,
      });
      this.dispatchEvent(event);

      return;
    } 

    const nextEvent = new CustomEvent("next", {});
    this.dispatchEvent(nextEvent);
  }
}
