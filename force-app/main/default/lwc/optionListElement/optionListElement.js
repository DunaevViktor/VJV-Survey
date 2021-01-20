import { LightningElement, api } from "lwc";

import deleteTitle from "@salesforce/label/c.delete";

export default class OptionListElement extends LightningElement {
  @api option;
  
  label = {
    deleteTitle
  }

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