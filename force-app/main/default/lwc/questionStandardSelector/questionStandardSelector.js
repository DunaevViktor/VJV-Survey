import { LightningElement, api, track, wire } from 'lwc';
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";
import {columns, getQuestionsTableStyle, transformStandardQuestions} from "./questionStandardSelectorHelper.js";
import {label} from "./labels.js";

export default class QuestionStandardSelector extends LightningElement {

  MULTIPLIER = 2;
  SELECT_OPTION_VARIANT = 'select';

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
    return this.currentPage === 0;
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
    const { Id } = row;

    const selectedQuestion = this.standardQuestions.find((question) => {
      return question.Id === Id;
    });

    const selectEvent = new CustomEvent("select", {
      detail: selectedQuestion
    });
    this.dispatchEvent(selectEvent);
  }

  clickPreviousButton() {
    if(this.currentPage === 0) return;

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
      (this.currentPage + 1 )*  (this.amountItems.data * this.MULTIPLIER)
    );
  }
}