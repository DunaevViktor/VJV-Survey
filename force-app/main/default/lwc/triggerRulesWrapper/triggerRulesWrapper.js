import { LightningElement, track, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getMaxTriggerRuleAmount from "@salesforce/apex/SurveySettingController.getMaxTriggerRuleAmount";

import { importedLabels } from "./labels"

import { 
  areTriggerRulesFilledCompletely,
  isEmpty,
  areDuplicatesPresent
 } from "./helper"

export default class TriggerRulesWrapper extends LightningElement {

  @track maxTriggerRulesAmount = 5;

  labels = importedLabels;

  @track triggerRules = [];

  @track isDeleteAvailable = false;

  @api rules = [];
  @track _rules = [];

  constructor() {
    super();
    getMaxTriggerRuleAmount()
      .then((result) => {
        this.maxTriggerRulesAmount = result;        
      })
      .catch((error) => {
        this.error = error;
        console.log(error);
      });
  }
  
  connectedCallback() { 
    if (this.rules && this.rules.length > 0) {
      let newtriggerRules = [];
      this._rules = this.rules;
      let i = 0;
      this._rules.forEach((rule) => {
        newtriggerRules.push({
          id: i,
          rule: rule
        });
        i++;
      });
      this.triggerRules = newtriggerRules;
    } else {
      this.triggerRules.push({
        id: 0
      });
    }
    this.updateIsDeleteAvailableState();
  }

  handlePlusClick() {
    const triggerRuleId = this.triggerRules.length;
    const newTriggerRule = {
      id: triggerRuleId
    }
    this.triggerRules.unshift(newTriggerRule);
    this.updateIsDeleteAvailableState();
  }

  handleDeleteTriggerRule(event) {
    let childKey = event.detail;
    this.triggerRules.splice(this.triggerRules.findIndex(rule => rule.id === childKey), 1);
    this.updateIsDeleteAvailableState();
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

  showToast(title, message, variant) {
    const event = new ShowToastEvent({title, message, variant, mode: "dismissable"});
    this.dispatchEvent(event);
  }

}