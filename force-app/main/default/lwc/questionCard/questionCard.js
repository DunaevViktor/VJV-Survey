import { LightningElement, api } from "lwc";

import { icons } from "./icons.js";
import { label } from "./labels.js";

export default class QuestionCard extends LightningElement {
  @api question;

  icons = icons;
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

  downQuestion() {
    const downEvent = new CustomEvent("down", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(downEvent);
  }

  upQuestion() {
    const upEvent = new CustomEvent("up", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(upEvent);
  }
}
