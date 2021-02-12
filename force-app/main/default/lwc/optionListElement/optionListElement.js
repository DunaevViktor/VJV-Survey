import { LightningElement, api } from "lwc";
import { optionFields } from "c/fieldService";

import deleteTitle from "@salesforce/label/c.delete";

export default class OptionListElement extends LightningElement {
  @api option;
  @api isInForm = false;
  
  label = {
    deleteTitle
  }

  get optionValue() {
    return this.option[optionFields.VALUE];
  }

  deleteOption() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.option[optionFields.VALUE]
    });
    this.dispatchEvent(deleteEvent);
  }

  editOption() {
    const editEvent = new CustomEvent("edit", {
      detail: this.option[optionFields.VALUE]
    });
    this.dispatchEvent(editEvent);
  }
}