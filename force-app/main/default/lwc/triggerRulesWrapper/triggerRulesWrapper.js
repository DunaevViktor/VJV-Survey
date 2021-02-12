import { LightningElement, track, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getMaxTriggerRuleAmount from "@salesforce/apex/SurveySettingController.getMaxTriggerRuleAmount";

import { importedLabels } from "./labels"

import { 
  areTriggerRulesFilledCompletely,
  isEmpty,
  areDuplicatesPresent
 } from "./helper"
import { operatorTypes } from "c/formUtil";

export default class TriggerRulesWrapper extends LightningElement {

  @track maxTriggerRulesAmount = 5;

  labels = importedLabels;

  @track triggerRules = [];

  @track isDeleteAvailable = false;

  @api rules = [];
  @track _rules = [];

  @track isDialogVisible = false;
  originalMessage = 'anyChange';
  message = '';
  anyChangeObject;
  anyChangeField;
  anyChangeRuleNumber;
  @track objectFieldsWithAnyChangeOperator = [];

  nextId = 0;

  constructor() {
    super();
    getMaxTriggerRuleAmount()
      .then((result) => {
        this.maxTriggerRulesAmount = result;        
      })
      .catch((error) => {
        this.error = error;
      });
  }
  
  connectedCallback() { 
    if (this.rules && this.rules.length > 0) {
      let newtriggerRules = [];
      this._rules = this.rules;
      this._rules.forEach((rule) => {
        newtriggerRules.push({
          id: this.nextId,
          rule: rule
        });
        this.nextId++;
        if(rule.Operator__c === operatorTypes.ANY_CHANGE) {
          this.addObjectFieldWithAnyChangeOperator(rule.Object_Api_Name__c, rule.Field_Name__c);
        }
      });
      this.triggerRules = newtriggerRules;
    } else {
      this.triggerRules.push({
        id: 0
      });
      this.nextId++;
    }
    this.updateIsDeleteAvailableState();
  }

  handlePlusClick() {
    const newTriggerRule = {
      id: this.nextId
    }
    this.nextId++;
    this.triggerRules.unshift(newTriggerRule);
    this.updateIsDeleteAvailableState();
  }

  handleDeleteTriggerRule(event) {
    const childKey = event.detail;
    this.triggerRules.splice(this.triggerRules.findIndex(rule => rule.id === childKey), 1);
  }

  updateIsDeleteAvailableState() {
    let visibleRulesAmount = this.triggerRules.length;
    if(visibleRulesAmount === 1) {
      this.isDeleteAvailable = false;
    } else {
      this.isDeleteAvailable = true;
    }
  }

  get isPlusVisible() {
    const triggerRulesAmount = this.triggerRules.length;    
    return triggerRulesAmount === this.maxTriggerRulesAmount ? false : true;
  }

  get labelOfAvailableItems() {
    const availableTriggerRulesAmount = this.maxTriggerRulesAmount - this.triggerRules.length;
    if (availableTriggerRulesAmount === 1) {
      return this.labels.you_can_create + " " 
        + availableTriggerRulesAmount + " " + this.labels.more + " " + this.labels.trigger_rule + ".";
    }
    return this.labels.you_can_create + " " 
      + availableTriggerRulesAmount + " " + this.labels.more + " " + this.labels.trigger_rules + ".";
  }

  handleNavigateNext() {    
    this._rules = this.getNewTriggerRules();
    if(!areTriggerRulesFilledCompletely(this._rules)) {
      this.showToast("", this.labels.fill_trigger_rules, "error");
    } else if(areDuplicatesPresent(this._rules)) {
      this.showToast("", this.labels.restrict_duplicate_rules, "error");
    } else {
      const navigateNextEvent = new CustomEvent("navigatenext", {
        detail: { triggerRules: [...this._rules] },
      });
      this.dispatchEvent(navigateNextEvent);    
    }    
  }

  handleNavigatePrev() {
    this._rules = this.getNewTriggerRules();
    if(!areTriggerRulesFilledCompletely(this._rules)) {
      this.showToast("", this.labels.fill_trigger_rules, "error");
    } else if(areDuplicatesPresent(this._rules)) {
      this.showToast("", this.labels.restrict_duplicate_rules, "error");
    } else {
      const navigatePrevEvent = new CustomEvent("navigateback", {
        detail: { triggerRules: [...this._rules] },
      });
      this.dispatchEvent(navigatePrevEvent);
    }    
  }

  getNewTriggerRules() {
    let newTriggerRules = [];

    this.triggerRules.forEach((rule) => {
        let id = rule.id.toString();
        let element = this.template.querySelector(
          'c-single-trigger-rule[data-my-id="' + id + '"]'
        );
        let triggerRule = JSON.parse(JSON.stringify(element.getTriggerRule()));
        if(!isEmpty(triggerRule)) {
          newTriggerRules.push(triggerRule);
        }    
    });

    return newTriggerRules;
  }  

  handleAnyChangeChosen(event)  {
    this.anyChangeRuleNumber = event.detail.number;
    this.anyChangeObject = event.detail.object;
    this.anyChangeField = event.detail.field;
    this.isDialogVisible = true;
  }

  addObjectFieldWithAnyChangeOperator(objectField) {
    this.objectFieldsWithAnyChangeOperator.push(objectField);
    this.updateObjectsFieldsInChildren();
  }

  deleteObjectFieldWithAnyChangeOperator(object, field) {
    const index = this.objectFieldsWithAnyChangeOperator.findIndex(obj => (obj.object = object) && (obj.field = field));
    this.objectFieldsWithAnyChangeOperator.splice(index, 1);
    this.updateObjectsFieldsInChildren();
  }

  handleAnyChangeDeleted(event) {
    this.deleteObjectFieldWithAnyChangeOperator(event.detail.object, event.detail.field);
    this.updateObjectsFieldsInChildren();
  }

  updateObjectsFieldsInChildren() {
    this.triggerRules.forEach(rule => {
      let id = rule.id.toString();
      let element = this.template.querySelector(
        'c-single-trigger-rule[data-my-id="' + id + '"]'
      )
      element.updateAnyChangeFieldObjects(this.objectFieldsWithAnyChangeOperator);
    });
  }

  clearAnyChangeData() {
    this.anyChangeObject = null;
    this.anyChangeField = null;
    this.anyChangeRuleNumber = null;
  }

  handleCongirmationPopupClick(event) {
    if(event.detail.originalMessage === this.originalMessage) {
      if(event.detail.status === 'confirm') {
        this.deleteAnyChangeDuplicates();
        this.setOperatorValueInChild(this.anyChangeRuleNumber);
        this.addObjectFieldWithAnyChangeOperator({object: this.anyChangeObject, field: this.anyChangeField});
        this.clearAnyChangeData();
      }
    } 
    this.clearAnyChangeData();
    this.isDialogVisible = false;
  }

  deleteAnyChangeDuplicates() {
    this.triggerRules.forEach(rule => {
      if(rule.id !== this.anyChangeRuleNumber) {
        let id = rule.id.toString();
        let element = this.template.querySelector(
          'c-single-trigger-rule[data-my-id="' + id + '"]'
        );
        let triggerRule = JSON.parse(JSON.stringify(element.getTriggerRule()));
        if((triggerRule.Object_Api_Name__c === this.anyChangeObject) && (triggerRule.Field_Name__c === this.anyChangeField)) {
          const index = this.triggerRules.findIndex(trRule => trRule.id === rule.id);
          this.triggerRules.splice(index, 1);
        }  
      }      
    });
  }

  setOperatorValueInChild(ruleId) {
    const id = ruleId.toString();
    const element = this.template.querySelector(
      'c-single-trigger-rule[data-my-id="' + id + '"]'
    );
    element.setAnyChangeOperator();
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({title, message, variant, mode: "dismissable"});
    this.dispatchEvent(event);
  }

}