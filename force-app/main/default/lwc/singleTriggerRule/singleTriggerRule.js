import { LightningElement, track, api } from "lwc";
import getObjectApiNamePickListValues from "@salesforce/apex/MetadataFetcher.getObjectApiNamePickListValues";
import getTriggerRuleOpearatorPickListValues from "@salesforce/apex/MetadataFetcher.getTriggerRuleOpearatorPickListValues";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getFieldPicklistValues from "@salesforce/apex/MetadataFetcher.getFieldPicklistValues";
import {
  setReferencedObjectNames,
  getFieldAttributes,
  generateBooleanField,
  checkForNullOperators,
  generateComboboxOptions,
  filterComparisonOperators
} from "./helper";

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
  initialRender = true;

  @track objectValue = "";
  @track fieldType = "";
  @track fieldValue = "";
  @track opearatorValue = "";
  @track value = "";

  @track objectNames = [];
  @track fieldNames = [];
  @track operators = [];
  fullOperatorList = [];
  reducedOperatorList = [];
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
        let comboboxObjectOptions = generateComboboxOptions(result);
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
        let comboboxOperatorOptions = generateComboboxOptions(result);
        this.fullOperatorList = comboboxOperatorOptions;
        this.reducedOperatorList = filterComparisonOperators(
          this.fullOperatorList
        );
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
    this.opearatorValue = "";
    this.provideValueInput(event.detail);
    this.value = "";
  }

  provideValueInput(fieldObject) {
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === fieldObject.value
    );
    this.value = "";
    let picklistOptions = [];

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
      console.log("setted val");
      console.log(settedValue);
    }
    if (this.opearatorValue === "NULL" || this.opearatorValue === "NOT NULL") {
      if (this.rule) {
        settedValue = this.rule.Field_Value__c;
        console.log("setted val");
        console.log(settedValue);
      }
      let chosenFieldObj = this.fieldNames.find(
        (field) => field.value === this.fieldValue
      );
      this.field = generateBooleanField(chosenFieldObj.label, settedValue);
      this.picklistFieldOptions = this.field.picklistValues;
    } else {
      this.field = getFieldAttributes(
        chosenFieldObject,
        picklistOptions,
        settedValue
      );
    }
    this.value = this.field.value;
    if (this.field.operatorType === 0) {
      this.operators = this.fullOperatorList;
    } else {
      this.operators = this.reducedOperatorList;
    }
    if (this.rule) {
      console.log("CLEAR received value!!!");
      this.rule = undefined;
    }
  }

  handleOperatorChange(event) {
    this.opearatorValue = event.detail.value;
    if (checkForNullOperators(this.opearatorValue)) {
      let settedValue = "";
      if (this.rule) {
        settedValue = this.rule.Field_Value__c;
        console.log("setted val");
        console.log(settedValue);
      }
      let chosenFieldObject = this.fieldNames.find(
        (field) => field.value === this.fieldValue
      );
      this.field = generateBooleanField(chosenFieldObject.label, settedValue);
      this.picklistFieldOptions = this.field.picklistValues;
    } else {
      let selectedFieldObject = this.fieldNames.find(
        (field) => field.value === this.fieldValue
      );
      this.provideValueInput(selectedFieldObject);
    }
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
    this.operators = [];
    this.fieldValue = "";
    this.fieldType = "";
    this.objectValue = "";
    this.field = {};
  }

  handleValueChange(event) {
    this.value = event.detail.value;
  }

  handleRecordSelection(event) {
    console.log("record selection");
    console.log(JSON.stringify(event.detail));
    this.value = event.detail;
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
