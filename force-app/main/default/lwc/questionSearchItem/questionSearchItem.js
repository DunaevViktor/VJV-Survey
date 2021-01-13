import { LightningElement, api } from "lwc";

import add_question from "@salesforce/label/c.add_question";

export default class QuestionSearchItem extends LightningElement {
  @api question;

  label = {
    add_question
  }

  selectQuestion() {
    const selectEvent = new CustomEvent("select", {
      detail: this.question
    });
    this.dispatchEvent(selectEvent);
  }
}