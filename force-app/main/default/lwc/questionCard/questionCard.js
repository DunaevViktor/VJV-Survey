import { LightningElement, api } from "lwc";

import { label } from "./labels.js";

export default class QuestionCard extends LightningElement {
  @api question;

  label = label;

  deleteQuestion() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(deleteEvent);
  }

  editQuestion() {
    const editEvent = new CustomEvent("edit", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(editEvent);
  }

  addOptionalQuestion() {
    const addOptionalEvent = new CustomEvent("addoptional", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(addOptionalEvent);
  }
}