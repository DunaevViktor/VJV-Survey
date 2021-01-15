import { LightningElement, track, api } from "lwc";

import { importedLabels } from "./labels"

export default class TriggerRulesWrapper extends LightningElement {

  labels = importedLabels;

  @track renderConditions = [
    { cond: true, id: 0, isDeleteAvailable: false },
    { cond: false, id: 1, isDeleteAvailable: true },
    { cond: false, id: 2, isDeleteAvailable: true },
    { cond: false, id: 3, isDeleteAvailable: true },
    { cond: false, id: 4, isDeleteAvailable: true },
  ];

  @api rules = [];
  @track _rules = [];

  connectedCallback() {
    if (this.rules) {
      this._rules = this.rules;
      let i = 0;
      this._rules.forEach((rule) => {
        this.renderConditions[i].cond = true;
        this.renderConditions[i].rule = rule;
        i++;
      });
    }
  }

  handlePlusClick() {
    let flag = false;
    this.renderConditions.forEach((el) => {
      if (el.cond === false && !flag) {
        el.cond = true;
        flag = true;
      }
    });
  }

  handleDeleteTriggerRule(event) {
    let childKey = event.detail;
    this.renderConditions[childKey].cond = false;
  }

  get isPlusVisible() {
    let filteredRenderConditions = this.renderConditions.filter(
      (condition) => condition.cond === false
    );
    return filteredRenderConditions.length === 0 ? false : true;
  }

  handleNavigateNext() {    
    this._rules = this.getNewTriggerRules();
    const navigateNextEvent = new CustomEvent("navigatenext", {
      detail: { triggerRules: [...this._rules] },
    });
    this.dispatchEvent(navigateNextEvent);    
  }

  handleNavigatePrev() {
    this._rules = this.getNewTriggerRules();
    const navigatePrevEvent = new CustomEvent("navigateback", {
      detail: { triggerRules: [...this._rules] },
    });
    this.dispatchEvent(navigatePrevEvent);
  }

  getNewTriggerRules() {
    let newTriggerRules = [];

    this.renderConditions.forEach((condition) => {
      if (condition.cond === true) {
        let id = condition.id.toString();
        let element = this.template.querySelector(
          'c-single-trigger-rule[data-my-id="' + id + '"]'
        );
        let triggerRule = JSON.parse(JSON.stringify(element.getTriggerRule()));
        if(!this.isEmpty(triggerRule)) {
          newTriggerRules.push(triggerRule);
        }        
      }
    });
    return newTriggerRules;
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
}