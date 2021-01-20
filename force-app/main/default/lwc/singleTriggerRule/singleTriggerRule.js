import { LightningElement, track, api } from "lwc";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getPicklistValues from "@salesforce/apex/MetadataFetcher.getPicklistValues";
import TRIGGER_RULE_OBJECT from '@salesforce/schema/Trigger_Rule__c';
import OBJECT_API_NAME_FIELD from '@salesforce/schema/Trigger_Rule__c.Object_Api_Name__c';
import OPERATOR_FIELD from '@salesforce/schema/Trigger_Rule__c.Operator__c';

import {
  getFieldAttributes,
  generateBooleanField,
  filterOperatorList,
  generateFieldsDescriptionsList,
  generateFieldOptions
} from "./helper";

import { importedLabels } from "./labels"

import {
  operatorTypes,
  booleanPicklistOptions
} from "c/formUtil";


export default class SingleTriggerRule extends LightningElement {

  labels = importedLabels;

  triggerRuleObjectApiName = TRIGGER_RULE_OBJECT.objectApiName;
  object_Api_NameFieldName = OBJECT_API_NAME_FIELD.fieldApiName;
  operatorFieldName = OPERATOR_FIELD.fieldApiName;

  initialRender = true;
  
  clearIconName = "utility:clear";
  deleteIconName = "utility:delete";

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
  @track _rule;

  @api isDeleteAvailable;
  @api number;

  @track objectApiName;
  @track recordTypeId;

  constructor() {
    super();
    getPicklistValues({objectApiName: this.triggerRuleObjectApiName, fieldApiName: this.object_Api_NameFieldName})
      .then((result) => {
        this.objectNames = generateFieldOptions(result);
        if (this._rule && this._rule.Object_Api_Name__c) {
          this.objectValue = this._rule.Object_Api_Name__c;
          this.getObjectFields(this.objectValue);
        }
      })
      .catch((error) => {
        this.error = error;
      });

    getPicklistValues({objectApiName: this.triggerRuleObjectApiName, fieldApiName: this.operatorFieldName})
      .then((result) => {
        this.fullOperatorList = generateFieldOptions(result);
        if (this._rule && this._rule.Operator__c) {
          this.operatorValue = this._rule.Operator__c;
        }
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      }); 
  }

  connectedCallback() {
    this._rule = this.rule;
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
        if (this._rule && this._rule.Field_Name__c) {
          let receivedFieldObject = this.fieldNames.find(
            (field) => field.value === this._rule.Field_Name__c
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
    getPicklistValues({
      objectApiName: this.objectValue,
      fieldApiName: chosenFieldObject.value,
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
    if (this._rule && this._rule.Field_Value__c) {
      settedValue = this._rule.Field_Value__c;
      this.value = settedValue;
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
    this.setOperatorsByType();
    this._rule = null;
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

  handleClearRuleClick() {
    this.clearChosenData();
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
    this.value = JSON.parse(JSON.stringify(event.detail.value));
  }

  handleRecordSelection(event) {    
    this.value = JSON.parse(JSON.stringify(event.detail));
  }

  @api getTriggerRule() {    
    const triggerRule = {
      Object_Api_Name__c: this.objectValue,
      Field_Name__c: this.fieldValue,
      Operator__c: this.operatorValue,
      Field_Value__c: this.value,
    };
    if(this.isTriggerRuleClear(triggerRule)) {
      return {};
    }  
    return triggerRule;
  }

  isTriggerRuleClear(triggerRule) {
    let isClear = true;
    for(let field in triggerRule) { 
      if(triggerRule[field]) {
        isClear = false;
        break;
      }
    }
    return isClear;
  }
}