import { LightningElement, track, api } from "lwc";
import getObjectApiNamePickListValues from "@salesforce/apex/MetadataFetcher.getObjectApiNamePickListValues";
import getTriggerRuleOperatorPickListValues from "@salesforce/apex/MetadataFetcher.getTriggerRuleOperatorPickListValues";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getFieldPicklistValues from "@salesforce/apex/MetadataFetcher.getFieldPicklistValues";

import DELETE_ICON from "@salesforce/resourceUrl/DeleteIcon";

import {
  getFieldAttributes,
  generateBooleanField,
  filterOperatorList,
  generateFieldsDescriptionsList,
} from "./helper";

import { importedLabels } from "./labels"

import {
  operatorTypes,
  booleanPicklistOptions,
  generateFieldOptions
} from "c/formUtil";


export default class SingleTriggerRule extends LightningElement {

  labels = importedLabels;

  initialRender = true;
  deleteIcon = DELETE_ICON;

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

      console.log('Generated field');
      console.log(this. field);
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

    if(this.isAllDataFilled()) {
      const triggerRule = {
        Object_Api_Name__c: this.objectValue,
        Field_Name__c: this.fieldValue,
        Operator__c: this.operatorValue,
        Field_Value__c: this.value,
      };  
      return triggerRule;
    }
    return {};    
  }

  isAllDataFilled() {
    if(this.objectValue === "" || this.fieldValue === "" ||
       this.operatorValue === "" || this.operatorValue.value === "") {
      return false;
    }
    return true;
  }
}
