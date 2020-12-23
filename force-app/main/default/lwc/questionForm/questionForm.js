import { LightningElement } from "lwc";
import EDIT_ICON from "@salesforce/resourceUrl/EditIcon";
import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

export default class QuestionForm extends LightningElement {
  editIcon = EDIT_ICON;
  deleteIcon = DELETE_ICON;

  value = "inProgress";
  valueO = "";

  get options() {
    return [
      { label: "New", value: "new" },
      { label: "In Progress", value: "inProgress" },
      { label: "Finished", value: "finished" }
    ];
  }

  get optionsO() {
    return [
      { label: "Is required", value: "Is_Required__c" },
      { label: "Is reusable", value: "Is_Reusable__c" }
    ];
  }
}
