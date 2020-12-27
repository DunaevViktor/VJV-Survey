import { LightningElement, api } from "lwc";
import EDIT_ICON from "@salesforce/resourceUrl/EditIcon";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";
import ARROW_UP_ICON from "@salesforce/resourceUrl/ArrowUpIcon";
import ARROW_DOWN_ICON from "@salesforce/resourceUrl/ArrowDownIcon";

export default class QuestionCard extends LightningElement {
  @api question;

  editIcon = EDIT_ICON;
  deleteIcon = DELETE_ICON;
  arrowUpIcon = ARROW_UP_ICON;
  arrowDownIcon = ARROW_DOWN_ICON;

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
