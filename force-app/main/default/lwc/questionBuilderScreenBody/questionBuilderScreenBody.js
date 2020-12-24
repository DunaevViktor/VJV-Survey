import { LightningElement, api, track } from "lwc";
import createQuestionList from "@salesforce/apex/QuestionController.createQuestionList";
import createQuestion from "@salesforce/apex/QuestionController.createQuestion";

export default class QuestionBuilderScreenBody extends LightningElement {
  @api templates;
  @api standardQuestions;
  @api questions;

  @track question;
  @track displayedQuestions;

  noTemplate;
  templateOptionsValue;

  @track hasQuestions = false;

  connectedCallback() {
    this.initQuestions();
    this.initQuestion();

    this.noTemplate = {
      label: "No Template",
      value: "0"
    };

    this.templateOptionsValue = this.noTemplate.value;
  }

  get templateOptions() {
    let templateOptions = this.templates.map((template) => {
      return {
        label: template.Name,
        value: template.Id
      };
    });
    templateOptions.push(this.noTemplate);
    return templateOptions;
  }

  initQuestions() {
    if (!this.questions) {
      this.questions = [];

      createQuestionList()
        .then((result) => {
          this.questions = result;

          this.updateDisplayedQuestions();
          this.hasQuestions = this.questions.length > 0;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  initQuestion() {
    createQuestion()
      .then((result) => {
        this.question = result;
        this.question.Label__c = "alder";

        this.template
          .querySelectorAll("c-question-form")[0]
          .setQuestion(this.question);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  addQuestion(event) {
    const question = event.detail;
    question.Position__c = this.questions.length + 1;
    this.questions.push(question);

    this.hasQuestions = this.questions.length > 0;
    this.updateDisplayedQuestions();
    this.initQuestion();
  }

  deleteQuestion(event) {
    let position = +event.detail;
    position--;

    this.questions.splice(position, 1);

    for (let i = position; i < this.questions.length; i++) {
      this.questions[i].Position__c = i + 1;
    }

    this.updateDisplayedQuestions();
    this.hasQuestions = this.questions.length > 0;
  }

  updateDisplayedQuestions() {
    this.displayedQuestions = [...this.questions];
  }
}
