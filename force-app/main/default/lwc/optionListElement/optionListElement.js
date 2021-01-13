import { LightningElement, api } from "lwc";
import EDIT_ICON from "@salesforce/resourceUrl/EditIcon";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

export default class OptionListElement extends LightningElement {
  @api option;

  editIcon = EDIT_ICON;
  deleteIcon = DELETE_ICON;

  deleteOption() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.option.Value__c
    });
    this.dispatchEvent(deleteEvent);
  }

  editOption() {
    const editEvent = new CustomEvent("edit", {
      detail: this.option.Value__c
    });
    this.dispatchEvent(editEvent);
  }
}