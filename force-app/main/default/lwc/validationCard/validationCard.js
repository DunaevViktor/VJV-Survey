import { LightningElement, api } from "lwc";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

import question from "@salesforce/label/c.question";
import dependent_question from "@salesforce/label/c.dependent_question";
import operator from "@salesforce/label/c.operator";
import compared_value from "@salesforce/label/c.compared_value";
import deleteTitle from "@salesforce/label/c.delete";

export default class ValidationCard extends LightningElement {
  deleteIcon = DELETE_ICON;

  @api validation;
  @api index;

  label = {
    question,
    dependent_question,
    operator,
    compared_value,
    deleteTitle
  };

  deleteValidation() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.index
    });
    this.dispatchEvent(deleteEvent);
  }
}