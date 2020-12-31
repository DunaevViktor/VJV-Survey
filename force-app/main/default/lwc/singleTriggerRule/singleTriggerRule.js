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

  @api rule;

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
        if (this.rule) {
          this.objectValue = this.rule.Object_Api_Name__c;
          this.getObjectFields(this.objectValue);
        }
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
        if (this.rule) {
          this.opearatorValue = this.rule.Operator__c;
        }
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  handleObjectChange(event) {
    console.log("Object combo change");
    console.log(event.detail);
    this.clearChosenData();
    this.objectApiName = event.detail.value;
    this.objectValue = event.detail.value;
    this.getObjectFields(this.objectApiName);
  }

  getObjectFields(objectApiName) {
    getObjectFieldsDescriptionList({ objectApiName: objectApiName })
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
        if (this.rule) {
          console.log("setting field");
          let receivedFieldObject = this.fieldNames.find(
            (field) => field.value === this.rule.Field_Name__c
          );
          console.log("receivedFieldObject");
          console.log(JSON.stringify(receivedFieldObject));
          this.fieldValue = JSON.parse(
            JSON.stringify(receivedFieldObject)
          ).value;

          this.provideValueInput(receivedFieldObject);
        }
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  handleFieldChange(event) {
    console.log(JSON.stringify(event.detail));
    this.fieldValue = event.detail.value;
    this.provideValueInput(event.detail);
  }

  provideValueInput(fieldObject) {
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === fieldObject.value
    );
    this.value = "";
    let picklistOptions = [];
    console.log("chosen field obj");
    console.log(JSON.stringify(chosenFieldObject));

    if (chosenFieldObject.datatype === "PICKLIST") {
      getFieldPicklistValues({
        objApiName: this.objectValue,
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
          this.setField(chosenFieldObject, this.picklistFieldOptions);
        })
        .catch((error) => {
          this.error = error;
          console.log(error);
        });
    } else if (chosenFieldObject.datatype === "BOOLEAN") {
      this.picklistFieldOptions = booleanPicklistOptions;
      this.setField(chosenFieldObject, this.picklistFieldOptions);
    } else {
      this.setField(chosenFieldObject);
    }
    //this.options = picklistOptions;
    console.log("res combo optins");
    console.log(picklistOptions);
  }

  setField(chosenFieldObject, picklistOptions) {
    let settedValue = "";
    if (this.rule) {
      settedValue = this.rule.Field_Value__c;
    }
    this.field = getFieldAttributes(
      chosenFieldObject,
      picklistOptions,
      settedValue
    );
    this.value = this.field.value;
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

  handleRecordSelection(event) {
    console.log("record selection");
    console.log(JSON.stringify(event.detail));
    this.value = event.detail.selectedRecordId;
  }

  @api getTriggerRule() {
    let triggerRule = {
      Object_Api_Name__c: this.objectValue,
      Field_Name__c: this.fieldValue,
      Operator__c: this.opearatorValue,
      Field_Value__c: this.value
    };

    return triggerRule;
  }
}
