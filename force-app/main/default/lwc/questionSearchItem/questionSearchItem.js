import { LightningElement, api } from "lwc";

export default class QuestionSearchItem extends LightningElement {
  @api question;

  selectQuestion() {
    const selectEvent = new CustomEvent("select", {
      detail: this.question
    });
    this.dispatchEvent(selectEvent);
  }
}