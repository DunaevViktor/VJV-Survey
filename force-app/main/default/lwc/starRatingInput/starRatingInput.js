import { LightningElement, track, api } from "lwc";
import completeThisField from "@salesforce/label/c.complete_this_field";
import { questionFields } from "c/fieldService";

export default class StarRatingInput extends LightningElement {
  MIN_RATING_VALUE = 1;
  MAX_RATING_VALUE = 10;

  isInvalid = false;
  invalidMessage = completeThisField;

  @track selectedRate;
  @track rating = [];

  @api question;

  @api checkValidity() {
    if (
      this.question[questionFields.VISIBLE] &&
      this.question[questionFields.REQUIRED] &&
      this.selectedRate === undefined
    ) {
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
    for (let i = this.MIN_RATING_VALUE; i <= this.MAX_RATING_VALUE; i++) {
      this.rating.push({ rate: i, filled: false });
    }
  }

  get questionLabel() {
    return this.question[questionFields.LABEL];
  }

  get questionRequired() {
    return this.question[questionFields.REQUIRED];
  }

  handleStarPick(event) {
    if (!this.question.IsDisabled === true) {
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
          questionId: this.question[questionFields.ID],
          answer: this.selectedRate
        }
      });

      this.dispatchEvent(answerChangeEvent);
    }
  }
}