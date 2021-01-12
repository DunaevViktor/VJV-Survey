import { LightningElement, api } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

import {label} from "./labels.js";

export default class ValidationCard extends LightningElement {
  deleteIcon = DELETE_ICON;

  @api validation;
  @api index;

  label = label;

  deleteValidation() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.index
    });
    this.dispatchEvent(deleteEvent);
  }
}
