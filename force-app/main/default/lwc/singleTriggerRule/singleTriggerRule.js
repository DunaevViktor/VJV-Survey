import { LightningElement, track, api } from "lwc";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getPicklistValues from "@salesforce/apex/MetadataFetcher.getPicklistValues";
import { triggerRuleObject, ruleFields } from "c/fieldService";

import {
  getFieldAttributes,
  generateBooleanField,
  filterOperatorList,
  generateFieldOptions,
  getFieldOperatorType
} from "./helper";

import { importedLabels } from "./labels"

import {
  operatorTypes,
  booleanPicklistOptions
} from "c/formUtil";


export default class SingleTriggerRule extends LightningElement {

  labels = importedLabels;

  triggerRuleObjectApiName = triggerRuleObject;
  object_Api_NameFieldName = ruleFields.API;
  operatorFieldName = ruleFields.OPERATOR;

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
    this.fetchFullOperatorList();     
  }

  connectedCallback() {
    this._rule = this.rule;
  }

  generateObjectField() {
    getPicklistValues({objectApiName: this.triggerRuleObjectApiName, fieldApiName: this.object_Api_NameFieldName})
      .then((result) => {
        this.objectNames = generateFieldOptions(result);
        if (this._rule && this._rule[ruleFields.API]) {
          this.objectValue = this._rule[ruleFields.API];
          this.getObjectFields(this.objectValue);
        }
      })
      .catch((error) => {
        this.error = error;
      });
  }

  fetchFullOperatorList() {
    getPicklistValues({objectApiName: this.triggerRuleObjectApiName, fieldApiName: this.operatorFieldName})
      .then((result) => {
        this.fullOperatorList = generateFieldOptions(result);
        this.generateObjectField();
      })
      .catch((error) => {
        this.error = error;
      });
  }

  generateOperatorField() {
    if(this._rule && this._rule[ruleFields.FIELD]) {
      let receivedFieldObject = this.fieldNames.find(
          (field) => field.value === this.fieldValue
      );
      receivedFieldObject.operatorType = getFieldOperatorType(receivedFieldObject); 
      this.setOperatorsByType(receivedFieldObject); 
      if(this._rule && this._rule[ruleFields.OPERATOR]) {
        this.operatorValue = this._rule[ruleFields.OPERATOR];
        this.provideValueInput(receivedFieldObject);
      }
    } 
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
        this.fieldNames = JSON.parse(JSON.stringify(result));
        if (this._rule && this._rule[ruleFields.FIELD]) {
          this.fieldValue = this._rule[ruleFields.FIELD];  
          this.generateOperatorField();        
        }
      })
      .catch((error) => {
        this.error = error;
      });
  }

  handleFieldChange(event) {
    this.fieldValue = event.detail.value;
    this.operatorValue = "";    
    this.value = "";
    this.field = {}; 
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === this.fieldValue
    );
    chosenFieldObject.operatorType = getFieldOperatorType(chosenFieldObject);
    this.setOperatorsByType(chosenFieldObject);
  }

  provideValueInput(chosenField) {
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === chosenField.value
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
      });
  }

  setField(chosenFieldObject, picklistOptions) {
    let settedValue = "";
    if (this._rule && this._rule[ruleFields.VALUE]) {
      settedValue = this._rule[ruleFields.VALUE];
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
    this._rule = null;
  }

  setOperatorsByType(chosenFieldObject) {
    this.operators = filterOperatorList(
      this.fullOperatorList,
      chosenFieldObject.operatorType
    );
  }

  handleOperatorChange(event) {
    this.operatorValue = event.detail.value;
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === this.fieldValue
    );
    if (this.operatorValue === operatorTypes.NULL) {
      let settedValue = "";      
      this.field = generateBooleanField(chosenFieldObject.label, settedValue);
      this.picklistFieldOptions = this.field.picklistValues;
    }
      this.provideValueInput(chosenFieldObject);
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
    this.fieldNames = [];
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
      [ruleFields.API]: this.objectValue,
      [ruleFields.FIELD]: this.fieldValue,
      [ruleFields.OPERATOR]: this.operatorValue,
      [ruleFields.VALUE]: this.value,
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