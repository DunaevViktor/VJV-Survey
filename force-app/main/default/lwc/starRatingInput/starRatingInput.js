import { LightningElement, track, api } from "lwc";
import completeThisField from "@salesforce/label/c.complete_this_field";

export default class StarRatingInput extends LightningElement {
  isInvalid = false;
  invalidMessage = completeThisField;

  @track selectedRate;
  @track rating = [];

  @api question;

  @api checkValidity() {
    if (this.question.IsVisible__c && this.question.Required__c && this.selectedRate === undefined) {
      return false;
    }
    return true;
  }

  @api reportValidity() {
    if (!this.checkValidity()) {
      this.isInvalid = true;
    }
  }

  connectedCallback() {
    this.initRating();
  }

  initRating() {
    for (let i = 1; i <= 10; i++) {
      this.rating.push({ rate: i, filled: false });
    }
  }

  handleStarPick(event) {
    this.isInvalid = false;
    const selectedRate = event.target.dataset.item;
    this.selectedRate =
      selectedRate === this.selectedRate ? undefined : selectedRate;

    this.rating.forEach((rate) => {
      rate.filled = rate.rate <= this.selectedRate ? true : false;
    });

    event.preventDefault();
    const answerChangeEvent = new CustomEvent("answerchange", {
      bubbles: true,
      composed: true,
      detail: {
        questionId: this.question.Id,
        answer: this.selectedRate
      }
    });

    this.dispatchEvent(answerChangeEvent);
  }
}