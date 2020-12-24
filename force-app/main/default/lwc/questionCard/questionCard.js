import { LightningElement, api } from "lwc";
import EDIT_ICON from "@salesforce/resourceUrl/EditIcon";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

export default class QuestionCard extends LightningElement {
  @api question;

  editIcon = EDIT_ICON;
  deleteIcon = DELETE_ICON;

  deleteQuestion() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.question.Position__c
    });
    this.dispatchEvent(deleteEvent);
  }
}
