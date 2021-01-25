import { LightningElement, api, track } from 'lwc';
import {label} from "./labels.js";

export default class QuestionPagination extends LightningElement {
  label = label;

  @api currentPage;
  @api amountPages;

  @track displayedCurrentPage;
  @track displayedAmountPages;

  @track isFirstDisabled = true;
  @track isPreviousDisabled = true;
  @track isNextDisabled = true;
  @track isLastDisabled = true;

  connectedCallback() {
    this.displayedCurrentPage = this.currentPage;
    this.displayedAmountPages = this.amountPages;
  }

  @api
  setAmountPages(value) {
    this.displayedAmountPages = value;
    this.repaintPaginationButtons();
  }

  @api
  setCurrentPage(value) {
    this.displayedCurrentPage = value;
    this.repaintPaginationButtons();
  }

  clickFirstPage() {
    this.displayedCurrentPage = 1;
    this.sendPageChangeEvent();
    this.repaintPaginationButtons();
  }

  clickNextPage() {
    if(this.displayedCurrentPage >= this.displayedAmountPages) return;

    this.displayedCurrentPage++;

    this.sendPageChangeEvent();
    this.repaintPaginationButtons();
  }

  clickPreviousPage() {
    if(this.displayedCurrentPage == 1) return;

    this.displayedCurrentPage--;

    this.sendPageChangeEvent();
    this.repaintPaginationButtons();
  }

  clickLastPage() {
    this.displayedCurrentPage = this.displayedAmountPages;

    this.sendPageChangeEvent();
    this.repaintPaginationButtons();
  }

  sendPageChangeEvent() {
    const pageChangeEvent = new CustomEvent("pagechange", {
      detail: this.displayedCurrentPage
    });
    this.dispatchEvent(pageChangeEvent);
  }

  repaintPaginationButtons() {
    if(this.displayedCurrentPage == 1) {
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
}