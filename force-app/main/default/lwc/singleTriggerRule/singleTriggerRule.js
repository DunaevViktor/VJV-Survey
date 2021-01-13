import { LightningElement, track, api } from "lwc";
import getObjectApiNamePickListValues from "@salesforce/apex/MetadataFetcher.getObjectApiNamePickListValues";
import getTriggerRuleOperatorPickListValues from "@salesforce/apex/MetadataFetcher.getTriggerRuleOperatorPickListValues";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getFieldPicklistValues from "@salesforce/apex/MetadataFetcher.getFieldPicklistValues";
import {
  getFieldAttributes,
  generateBooleanField,
  filterOperatorList,
  generateFieldsDescriptionsList,
  generateFieldOptions
} from "./helper";

import {
  operatorTypes,
  booleanPicklistOptions
} from "c/formUtil";

import deleteLabel from "@salesforce/label/c.delete";
import deleteTitle from "@salesforce/label/c.delete_trigger_rule";
import operatorLabel from "@salesforce/label/c.operator";
import fieldLabel from "@salesforce/label/c.field";
import objectLabel from "@salesforce/label/c.object";
import errorMessage from "@salesforce/label/c.errorMessage";

export default class SingleTriggerRule extends LightningElement {

  labels = {
    deleteLabel,
    deleteTitle,
    operatorLabel,
    fieldLabel,
    objectLabel,
    errorMessage
  };

  initialRender = true;

  @track objectValue = "";
  @track fieldType = "";
  @track fieldValue = "";
  @track operatorValue = "";
  @track value = "";

  @track objectNames = [];
  @track fieldNames = [];
  @track operators = [];
  fullOperatorList = [];
  @track picklistFieldOptions = [];

  @track error;
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
        this.objectNames = generateFieldOptions(result);
        if (this.rule) {
          this.objectValue = this.rule.Object_Api_Name__c;
          this.getObjectFields(this.objectValue);
        }
      })
      .catch((error) => {
        this.error = error;
      });

    getTriggerRuleOperatorPickListValues()
      .then((result) => {
        this.fullOperatorList = generateFieldOptions(result);
        if (this.rule) {
          this.operatorValue = this.rule.Operator__c;
        }
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  handleObjectChange(event) {
    this.clearChosenData();
    this.objectApiName = event.detail.value;
    this.objectValue = event.detail.value;
    this.getObjectFields(this.objectApiName);
  }

  getObjectFields(objectApiName) {
    getObjectFieldsDescriptionList({ objectApiName: objectApiName })
      .then((result) => {
        this.fieldNames = generateFieldsDescriptionsList(result);
        if (this.rule) {
          let receivedFieldObject = this.fieldNames.find(
            (field) => field.value === this.rule.Field_Name__c
          );
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
    this.fieldValue = event.detail.value;
    this.operatorValue = "";
    this.provideValueInput(event.detail);
    this.value = "";
  }

  provideValueInput(fieldObject) {
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === fieldObject.value
    );
    this.value = "";

    if (chosenFieldObject.datatype === "PICKLIST") {
      this.generateFieldPicklistOptions(chosenFieldObject);
    } else if (chosenFieldObject.datatype === "BOOLEAN") {
      this.picklistFieldOptions = booleanPicklistOptions;
      this.setField(chosenFieldObject, this.picklistFieldOptions);
    } else {
      this.setField(chosenFieldObject);
    }
  }

  generateFieldPicklistOptions(chosenFieldObject) {
    getFieldPicklistValues({
      objApiName: this.objectValue,
      field: chosenFieldObject.value,
    })
      .then((result) => {
        let comboboxOptions = generateFieldOptions(result);
        this.picklistFieldOptions = comboboxOptions;
        this.setField(chosenFieldObject, this.picklistFieldOptions);
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }

  setField(chosenFieldObject, picklistOptions) {
    let settedValue = "";
    if (this.rule) {
      settedValue = this.rule.Field_Value__c;
    }
    if (this.operatorValue === operatorTypes.NULL) {
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
    this.setOperatorsByType();
    if (this.rule) {
      this.rule = undefined;
    }
  }

  setOperatorsByType() {
    this.operators = filterOperatorList(
      this.fullOperatorList,
      this.field.operatorType
    );
  }

  handleOperatorChange(event) {
    this.operatorValue = event.detail.value;
    if (this.operatorValue === operatorTypes.NULL) {
      let settedValue = "";
      if (this.rule) {
        settedValue = this.rule.Field_Value__c;
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
      detail: this.number,
    });

    this.dispatchEvent(deleteEvent);
  }

  clearChosenData() {
    this.value = "";
    this.operatorValue = "";
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
    this.value = event.detail;
  }

  @api getTriggerRule() {
    const triggerRule = {
      Object_Api_Name__c: this.objectValue,
      Field_Name__c: this.fieldValue,
      Operator__c: this.operatorValue,
      Field_Value__c: this.value,
    };

    return triggerRule;
  }
}
