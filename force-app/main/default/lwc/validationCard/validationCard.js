import { LightningElement, api } from "lwc";

import {label} from "./labels.js";

export default class ValidationCard extends LightningElement {

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