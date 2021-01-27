import { LightningElement, wire, api, track } from 'lwc';
import getMaxQuestionAmount from "@salesforce/apex/SurveySettingController.getMaxQuestionAmount";
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";

import {label} from "./labels.js";
import {
  isEmpty,
  filterQuestionsByPage,
  filterQuestionsBySearhTerm,
  setInputValidation
} from './questionsBlockHelper.js';
import { findQuestionByPosition } from "c/formUtil";

export default class QuestionsBlock extends LightningElement {
  label = label;

  @wire(getMaxQuestionAmount) maxQuestionsAmount;
  @wire(getPageQuestionAmount) pageQuestionsAmount;

  @api questions;

  @track displayedQuestions = [];
  displayedQuestionsCopy = [];
  @track filteredDisplayedQuestions = [];

  @track hasQuestions = false;
  @track isNeedPagination = false;
  @track isSearchMode = false;

  @track currentPage = 1;
  @track amountPages;
  @track isFirstDisabled = true;
  @track isPreviousDisabled = true;
  @track isNextDisabled = true;
  @track isLastDisabled = true;
  
  connectedCallback() {
    this.displayedQuestions = this.questions;
    this.resolveDisplayedQuestions();
  }

  @api
  updateQuestions(questions) {
    this.displayedQuestions = questions;
    this.resolveDisplayedQuestions();
  }

  get labelOfAvailableItems() {
    switch(this.availableQuestionsAmount) {
      case 1: return this.label.you_can_create + " " 
        + this.availableQuestionsAmount + " " + this.label.question;
      case 0: return this.label.can_no_longer_create_questions;
      default: return this.label.you_can_create + " " 
        + this.availableQuestionsAmount + " " + this.label.questions;
    }
  }

  get labelOfSearchedItems() {
    return label.number_of_found_items + ': ' + this.displayedQuestions.length;
  }

  get availableQuestionsAmount() {
    return +this.maxQuestionsAmount.data - +this.displayedQuestions.length;
  }

  get isNeedSearchBar() {
    return (this.isSearchMode || this.isNeedPagination);
  }
  
  changePage(event) {
    this.currentPage = event.detail;
    this.resolveDisplayedQuestions();
  }

  resolveDisplayedQuestions() {
    this.filteredDisplayedQuestions = filterQuestionsByPage(
      this.displayedQuestions, this.currentPage, 
      +this.pageQuestionsAmount.data);

    this.resolveQuestionsSubinfo();
  }

  resolveQuestionsSubinfo() {
    this.hasQuestions = (this.displayedQuestions.length > 0) || (this.isSearchMode);
    this.amountPages =  Math.ceil(this.displayedQuestions.length / +this.pageQuestionsAmount.data);
    this.isNeedPagination = this.displayedQuestions.length > +this.pageQuestionsAmount.data;

    this.repaintPaginationButtons();
  }

  editQuestion(event) {
    const position = event.detail;
    const question = findQuestionByPosition(this.displayedQuestions, position);

    const editEvent = new CustomEvent("edit", {
      detail: { ...question }
    });
    this.dispatchEvent(editEvent);
  }

  addOptional(event) {
    const position = event.detail;
    const question = findQuestionByPosition(this.displayedQuestions, position);

    const addOptionalEvent = new CustomEvent("addoptional", {
      detail: question
    });
    this.dispatchEvent(addOptionalEvent);
  }

  deleteQuestion(event) {
    const deleteEvent = new CustomEvent("delete", {
      detail: event.detail
    });
    this.dispatchEvent(deleteEvent);
  }

  clickFirstPage() {
    this.currentPage = 1;
    this.resolveDisplayedQuestions();
  }

  clickNextPage() {
    if(this.currentPage >= this.amountPages) return;
    this.currentPage++;
    this.resolveDisplayedQuestions();
  }

  clickPreviousPage() {
    if(this.currentPage === 1) return;
    this.currentPage--;
    this.resolveDisplayedQuestions();
  }

  clickLastPage() {
    this.currentPage = this.amountPages;
    this.resolveDisplayedQuestions();
  }

  repaintPaginationButtons() {
    if(this.displayedCurrentPage === 1) {
      this.isFirstDisabled = true;
      this.isPreviousDisabled = true;
    } else {
      this.isFirstDisabled = false;
      this.isPreviousDisabled = false;
    }

    if(this.displayedCurrentPage >= this.displayedAmountPages) {
      this.isNextDisabled = true;
      this.isLastDisabled = true;
    } else {
      this.isNextDisabled = false;
      this.isLastDisabled = false;
    }
  }

  handleQuestionsSearch() {
    const input = this.template.querySelector('lightning-input[data-my-id="keyword"]');
    const keyword = input.value;

    if(isEmpty(keyword)) {
      setInputValidation(input, label.search_keyword_cant_be_empty);
      return;
    }

    setInputValidation(input, "");
    this.currentPage = 1;

    if(!this.isSearchMode) {
      this.displayedQuestionsCopy = [...this.displayedQuestions];
    }

    this.isSearchMode = true;    
    const questionSearchResult = filterQuestionsBySearhTerm(this.displayedQuestionsCopy, keyword);
    this.displayedQuestions = [];
    this.displayedQuestions = [...questionSearchResult];
    this.resolveDisplayedQuestions();
  }

  handleClearQuestionSearch() {
    const input = this.template.querySelector('lightning-input[data-my-id="keyword"]');
    setInputValidation(input, "");
    input.value = "";

    if(this.isSearchMode) {
      this.isSearchMode = false;
      this.currentPage = 1;
      this.displayedQuestions = [...this.displayedQuestionsCopy];
      this.resolveDisplayedQuestions();
    }
  }
}