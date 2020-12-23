import { LightningElement, api } from "lwc";
import EDIT_ICON from "@salesforce/resourceUrl/EditIcon";

export default class QuestionCard extends LightningElement {
  @api question;

  editIcon = EDIT_ICON;
}
