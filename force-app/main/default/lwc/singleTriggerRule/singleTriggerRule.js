import { LightningElement, track, api } from "lwc";
import getObjectFieldsDescriptionList from "@salesforce/apex/MetadataFetcher.getObjectFieldsDescriptionList";
import getPicklistValues from "@salesforce/apex/MetadataFetcher.getPicklistValues";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
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
  EMPTY_STRING = "";
  DATETIME_DATATYPE = "DATETIME";
  PICKLISRT_DATATYPE = "PICKLIST";
  BOOLEAN_DATATYPE = "BOOLEAN";

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

  @api anyChangeFieldsAndObjectsApi = [];
  anyChangeFieldsAndObjects = [];

  constructor() {
    super();
    this.fetchFullOperatorList();     
  }

  connectedCallback() {
    this._rule = this.rule;
    this.anyChangeFieldsAndObjects = this.anyChangeFieldsAndObjectsApi;
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
        if(this.operatorValue !== operatorTypes.ANY_CHANGE) {
          this.provideValueInput(receivedFieldObject);
        }
      }
    } 
  }

  handleObjectChange(event) {
    if(this.operatorValue && this.operatorValue === operatorTypes.ANY_CHANGE) {
      this.dispatchAnyChangeDeleted(this.objectValue, this.fieldValue);
    }
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
    if(this.operatorValue === operatorTypes.ANY_CHANGE) {
      this.dispatchAnyChangeDeleted(this.objectValue, this.fieldValue);
    }
    const newFieldValue = event.detail.value;
    this.fieldValue = null;
    this.operatorValue = this.EMPTY_STRING;    
    this.value = this.EMPTY_STRING;
    this.field = {}; 
    if(this.areObjectAndFieldInAnyChange(newFieldValue)) {
      this.showToast(this.EMPTY_STRING, this.labels.field_setted_with_any_change, "error");
      return;
    }
    this.fieldValue = event.detail.value;    
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === this.fieldValue
    );
    chosenFieldObject.operatorType = getFieldOperatorType(chosenFieldObject);
    this.setOperatorsByType(chosenFieldObject);
  }

  areObjectAndFieldInAnyChange(newFieldValue) {
    return this.anyChangeFieldsAndObjects.some(objectAndField => (objectAndField.object === this.objectValue) && (objectAndField.field === newFieldValue));
  }

  provideValueInput(chosenField) {
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === chosenField.value
    );
    this.value = this.EMPTY_STRING;

    if(chosenFieldObject.datatype === this.DATETIME_DATATYPE) {
      this.template.querySelector('[data-my-id="value-input"]').classList.add('no-margin-bottom');
    } else {
      this.template.querySelector('[data-my-id="value-input"]').classList.remove('no-margin-bottom');
    }

    if (chosenFieldObject.datatype === this.PICKLISRT_DATATYPE) {
      this.generateFieldPicklistOptions(chosenFieldObject);
    } else if (chosenFieldObject.datatype === this.BOOLEAN_DATATYPE) {
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
    let settedValue = this.EMPTY_STRING;
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

    if(this.operatorValue === operatorTypes.ANY_CHANGE) {
      this.dispatchAnyChangeDeleted(this.objectValue, this.fieldValue);
    }
    this.operatorValue = null;
    if(event.detail.value === operatorTypes.ANY_CHANGE) {
      const anyChangeEvent = new CustomEvent("anychangechosen", {
        detail: {
          number: this.number,
          object: this.objectValue,
          field: this.fieldValue
        }
      });  
      this.dispatchEvent(anyChangeEvent);      
      this.field = {};
      this.value = this.EMPTY_STRING;
      return;
    }
    this.operatorValue = event.detail.value;
    let chosenFieldObject = this.fieldNames.find(
      (field) => field.value === this.fieldValue
    );
    if (this.operatorValue === operatorTypes.NULL) {
      let settedValue = this.EMPTY_STRING;      
      this.field = generateBooleanField(chosenFieldObject.label, settedValue);
      this.picklistFieldOptions = this.field.picklistValues;
    }
    this.provideValueInput(chosenFieldObject);
  }

  handleClearRuleClick() {
    if(this.operatorValue === operatorTypes.ANY_CHANGE) {
      this.dispatchAnyChangeDeleted(this.objectValue, this.fieldValue);
    }
    this.clearChosenData();
  }

  handleDeleteRuleClick() {

    if(this.operatorValue === operatorTypes.ANY_CHANGE) {
      this.dispatchAnyChangeDeleted(this.objectValue, this.fieldValue);
    }

    this.clearChosenData();

    const deleteEvent = new CustomEvent("deletetriggerrule", {
      detail: this.number
    });

    this.dispatchEvent(deleteEvent);
  }

  dispatchAnyChangeDeleted(object, field) {
    const deleteAnyChangeEvent = new CustomEvent("anychangedeleted", {
      detail: {
        object: object,
        field: field
      }
    });

    this.dispatchEvent(deleteAnyChangeEvent);
  }

  clearChosenData() {
    this.value = this.EMPTY_STRING;
    this.operatorValue = this.EMPTY_STRING;
    this.operators = [];
    this.fieldNames = [];
    this.fieldValue = this.EMPTY_STRING;
    this.fieldType = this.EMPTY_STRING;
    this.objectValue = this.EMPTY_STRING;
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

  @api setAnyChangeOperator() {
    this.operatorValue = operatorTypes.ANY_CHANGE;
  }

  @api updateAnyChangeFieldObjects(anyChangeFieldsObjects) {
    this.anyChangeFieldsAndObjects = JSON.parse(JSON.stringify(anyChangeFieldsObjects));
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({title, message, variant, mode: "dismissable"});
    this.dispatchEvent(event);
  }
}