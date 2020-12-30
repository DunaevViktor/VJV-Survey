import { LightningElement, api, track } from "lwc";

export default class QuestionSearch extends LightningElement {
  EMPTY_STRING = "";

  @api standardQuestions;
  @track searchResults;

  searchTerm;

  connectedCallback() {
    this.searchTerm = this.EMPTY_STRING;
    this.setAllQuestions();
  }

  onSearchTermChange(event) {
    this.searchTerm = event.target.value;

    if (this.searchTerm.localeCompare(this.EMPTY_STRING) === 0) {
      this.setAllQuestions();
    } else {
      this.filterQuestions();
    }
  }

  setAllQuestions() {
    if (!this.standardQuestions) {
      this.searchResults = [];
      return;
    }
    this.searchResults = this.standardQuestions;
  }

  filterQuestions() {
    this.searchResults = this.standardQuestions.filter((question) => {
      return question.Label__c.toLowerCase().includes(
        this.searchTerm.toLowerCase()
      );
    });
  }

  selectQuestion(event) {
    const selectEvent = new CustomEvent("select", {
      detail: event.detail
    });
    this.dispatchEvent(selectEvent);
  }
}
