import { LightningElement, api, track, wire } from 'lwc';
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";
import {columns, getQuestionsTableStyle, transformStandardQuestions} from "./questionStandardSelectorHelper.js";
import {label} from "./labels.js";
import { questionFields } from "c/fieldService";

export default class QuestionStandardSelector extends LightningElement {

  MULTIPLIER = 2;
  SELECT_OPTION_VARIANT = 'select';
  ZERO = 0;
  ONE = 1;

  label = label;

  @wire(getPageQuestionAmount) amountItems;

  @api standardQuestions;
  @track displayedQuestions;

  @track questionsPage;
  @track isNeedPagination;
  @track currentPage = 0;

  columns = columns;

  connectedCallback() {
    this.displayedQuestions = transformStandardQuestions(this.standardQuestions);
    
    this.isNeedPagination = this.displayedQuestions.length > (this.amountItems.data * this.MULTIPLIER);
    if(this.isNeedPagination) {
      this.resolveQuestiosOnPage();
    } else {
      this.questionsPage = [...this.displayedQuestions];
    }
  }

  renderedCallback() {
    this.template.querySelector('.questionsTable').appendChild(getQuestionsTableStyle());
  }

  get isPreviousDisabled() {
    return this.currentPage === this.ZERO;
  }

  get isNextDisabled() {
    return this.currentPage >= Math.floor(this.displayedQuestions.length /  (this.amountItems.data * this.MULTIPLIER));
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if(actionName === this.SELECT_OPTION_VARIANT) {
      this.addStandardQuestion(row);
    } 
  }

  handleBack() {
    const backEvent = new CustomEvent("back");
    this.dispatchEvent(backEvent);
  }

  addStandardQuestion(row) {
    const Id = row[questionFields.ID];

    const selectedQuestion = this.standardQuestions.find((question) => {
      return question[questionFields.ID] === Id;
    });

    const selectEvent = new CustomEvent("select", {
      detail: selectedQuestion
    });
    this.dispatchEvent(selectEvent);
  }

  clickPreviousButton() {
    if(this.currentPage === this.ZERO) return;

    this.currentPage--;
    this.resolveQuestiosOnPage();
  }

  clickNextButton() {
    if(this.currentPage >= Math.floor(this.displayedQuestions.length /  (this.amountItems.data * this.MULTIPLIER))) return;

    this.currentPage++;
    this.resolveQuestiosOnPage();
  }

  resolveQuestiosOnPage() {
    this.questionsPage = this.displayedQuestions.slice(
      this.currentPage *  (this.amountItems.data * this.MULTIPLIER), 
      (this.currentPage + this.ONE)*  (this.amountItems.data * this.MULTIPLIER)
    );
  }
}