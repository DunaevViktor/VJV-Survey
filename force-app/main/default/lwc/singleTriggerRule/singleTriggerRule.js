import { LightningElement, wire, track, api } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import getObjectApiNamePickListValues from "@salesforce/apex/MetadataFetcher.getObjectApiNamePickListValues";
import getTriggerRuleOpearatorPickListValues from "@salesforce/apex/MetadataFetcher.getTriggerRuleOpearatorPickListValues";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getFieldPicklistValues from "@salesforce/apex/MetadataFetcher.getFieldPicklistValues";
import { setReferencedObjectNames, getFieldAttributes } from "./helper";
import { reduceErrors } from "c/loadDataUtils";

const booleanPicklistOptions = [
  {
    label: "TRUE",
    value: "true"
  },
  {
    label: "FALSE",
    value: "false"
  }
];

export default class SingleTriggerRule extends LightningElement {
  @track objectValue = "";
  @track fieldType = "";
  @track fieldValue = "";
  @track opearatorValue = "";
  @track value = "";

  @track objectNames = [];
  @track fieldNames = [];
  @track operators = [];
  @track picklistFieldOptions = [];

  @track error = "";
  @track field = {};

  @api isDeleteAvailable;
  @api number;

  @track objectApiName;
  @track recordTypeId;

  constructor() {
    super();

    getObjectApiNamePickListValues()
      .then((result) => {
        let comboboxObjectOptions = [];
        result.forEach((objectLabel) => {
          let object = {
            label: objectLabel,
            value: objectLabel
          };
          comboboxObjectOptions.push(object);
        });
        this.objectNames = comboboxObjectOptions;
      })
      .catch((error) => {
        this.error = error;
      });

    getTriggerRuleOpearatorPickListValues()
      .then((result) => {
        console.log(result);
        let comboboxOperatorOptions = [];
        result.forEach((operatorLabel) => {
          let operator = {
            label: operatorLabel,
            value: operatorLabel
          };
          comboboxOperatorOptions.push(operator);
        });
        console.log(comboboxOperatorOptions.length);
        this.operators = comboboxOperatorOptions;
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  handleObjectChange(event) {
    console.log("Object combo change");
    console.log(event.detail);
    this.objectApiName = event.detail.value;
    this.objectValue = event.detail.value;
    getObjectFieldsDescriptionList({ objectApiName: this.objectApiName })
      .then((result) => {
        console.log(result);
        let comboboxFieldsOptions = [];
        result.forEach((fieldDescriptionList) => {
          // Preventing unexcepted data

          // Filtering the data in the loop
          console.log(fieldDescriptionList);
          let fieldObject = {
            label: fieldDescriptionList[1],
            value: fieldDescriptionList[0],
            datatype: fieldDescriptionList[2]
          };
          setReferencedObjectNames(fieldDescriptionList, fieldObject);
          comboboxFieldsOptions.push(fieldObject);
        });
        this.fieldNames = comboboxFieldsOptions;
        console.log("fieeld options");
        console.log(comboboxFieldsOptions);
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  handleFieldChange(event) {
    console.log(JSON.stringify(event.detail));
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === event.detail.value
    );
    this.fieldValue = event.detail.value;
    let picklistOptions = [];
    console.log("chosen field obj");
    console.log(JSON.stringify(chosenFieldObject));

    if (chosenFieldObject.datatype === "PICKLIST") {
      getFieldPicklistValues({
        objApiName: this.objectApiName,
        field: chosenFieldObject.value
      })
        .then((result) => {
          let comboboxOptions = [];
          for (let key in result) {
            // Preventing unexcepted data
            if (Object.prototype.hasOwnProperty.call(result, key)) {
              // Filtering the data in the loop
              comboboxOptions.push({
                label: key,
                value: result[key]
              });
            }
          }
          this.picklistFieldOptions = comboboxOptions;
          console.log("Picklist optins");
          console.log(comboboxOptions);
        })
        .catch((error) => {
          this.error = error;
          console.log(error);
        });
    } else if (chosenFieldObject.datatype === "BOOLEAN") {
      this.picklistFieldOptions = booleanPicklistOptions;
    }
    //this.options = picklistOptions;
    console.log("res combo optins");
    console.log(picklistOptions);
    this.field = getFieldAttributes(chosenFieldObject, picklistOptions);
    console.log("Fielddd chosen object!");
    console.log(JSON.stringify(this.field));
  }

  handleOperatorChange(event) {
    this.opearatorValue = event.detail.value;
  }

  handleDeleteRuleClick() {
    this.clearChosenData();

    const deleteEvent = new CustomEvent("deletetriggerrule", {
      detail: this.number
    });

    this.dispatchEvent(deleteEvent);
  }

  clearChosenData() {
    this.value = "";
    this.opearatorValue = "";
    this.fieldValue = "";
    this.fieldType = "";
    this.objectValue = "";
  }

  handleValueChange(event) {
    this.value = event.detail.value;
  }

  @api getTriggerRule() {
    /*let triggerRule = {
      Object_Api_Name__c: this.objectValue,
      Field_Name__c: this.fieldValue,
      Operator__c: this.operator,
      Field_Value__c: this.value
    }*/

    /*let triggerRule = {
      Object_Api_Name__c: "Case",
      Field_Name__c: "Origin",
      Operator__c: "EQUALS",
      Field_Value__c: ""

    }*/

    let triggerRule = {};
    triggerRule.Object_Api_Name__c = "Lead";
    triggerRule.Field_Name__c = "Company";
    triggerRule.Operator__c = "EQUALS";
    triggerRule.Field_Value__c = "Test";

    return triggerRule;
  }
}
