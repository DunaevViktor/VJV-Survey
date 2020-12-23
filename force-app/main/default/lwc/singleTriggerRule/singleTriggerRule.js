import { LightningElement, wire, track, api } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { createPicklistOption } from "./helper";

import CASE_OBJECT from "@salesforce/schema/Case";
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import LEAD_OBJECT from "@salesforce/schema/Lead";

export default class SingleTriggerRule extends LightningElement {
  @track objectValue = "";
  @track fieldType = "";
  @track fieldValue = "";

  @track objectNames = [];
  @track fieldNames = [];

  caseFieldNames = [];
  contactFieldNames = [];
  leadFieldNames = [];

  @api isDeleteAvailable = false;

  connectedCallback() {}

  @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
  wiredCaseInfo({ error, data }) {
    if (data) {
      console.log(data);
      console.log(data.label);
      let arr = [...this.objectNames];
      arr.push(createPicklistOption(data.label, data.apiName));
      this.objectNames = arr;

      //get fields
      Object.values(data.fields).forEach((field) => {
        this.caseFieldNames.push(
          createPicklistOption(field.label, field.apiName, field.dataType)
        );
      });
    } else {
      console.log(error);
    }
    //console.log(data)
  }

  @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
  wiredContactInfo({ error, data }) {
    if (data) {
      console.log(data);
      console.log(data.label);
      let arr = [...this.objectNames];
      arr.push(createPicklistOption(data.label, data.apiName));
      this.objectNames = arr;

      //get fields
      Object.values(data.fields).forEach((field) => {
        this.contactFieldNames.push(
          createPicklistOption(field.label, field.apiName, field.dataType)
        );
      });
    } else {
      console.log(error);
    }
    //console.log(data)
  }

  @wire(getObjectInfo, { objectApiName: LEAD_OBJECT })
  wiredLeadInfo({ error, data }) {
    if (data) {
      console.log(data);
      console.log(data.label);
      let arr = [...this.objectNames];
      arr.push(createPicklistOption(data.label, data.apiName));
      this.objectNames = arr;

      //get fields
      Object.values(data.fields).forEach((field) => {
        this.leadFieldNames.push(
          createPicklistOption(field.label, field.apiName, field.dataType)
        );
      });
    } else {
      console.log(error);
    }
  }

  handleObjectChange(event) {
    console.log("Object combo change");
    console.log(event.detail);
    this.objectValue = event.detail.value;
    switch (event.detail.value) {
      case "Case":
        console.log("Case chosen");
        this.fieldNames = this.caseFieldNames;
        break;
      case "Contact":
        console.log("Contact chosen");
        this.fieldNames = this.contactFieldNames;
        break;
      case "Lead":
        console.log("Lead chosen");
        this.fieldNames = this.leadFieldNames;
        break;
      default:
        this.fieldNames = [];
        break;
    }
  }

  handleFieldChange(event) {
    this.fieldValue = event.detail.value;
    this.fieldType = event.detail.datatype;
  }

  @wire(getPicklistValues, {
    recordTypeId: "$recordTypeId",
    fieldApiName: "$apiFieldName"
  })
  getPicklistValues({ error, data }) {
    if (data) {
      // Map picklist values
      this.options = data.values.map((plValue) => {
        return {
          label: plValue.label,
          value: plValue.value
        };
      });
    } else if (error) {
      // Handle error
      console.log("==============Error  " + error);
      console.log(error);
    }
  }
}
