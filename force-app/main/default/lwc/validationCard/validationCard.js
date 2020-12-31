import { LightningElement, api } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

export default class ValidationCard extends LightningElement {
  deleteIcon = DELETE_ICON;

  @api validation;
  @api index;

  deleteValidation() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.index
    });
    this.dispatchEvent(deleteEvent);
  }
}
