import { LightningElement, track, api } from "lwc";
import { FlowNavigationBackEvent } from "lightning/flowSupport";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

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

  @api rules;

  connectedCallback() {
    if (!this.rules) {
      this.rules = [];
    } else {
      let i = 0;
      this.rules.forEach((rule) => {
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
    this.rules = this.getNewTriggerRules();
    if (!this.isMinimalDataAmountFilled()) {
      this.showToast("", this.labels.tip_for_user, "error");
      console.log('ERROR!');
    } else {
      console.log('new tr rules');
      console.log(this.rules);
      const navigateNextEvent = new CustomEvent("navigatenext", {
        detail: { triggerRules: [...this.rules] },
      });
      this.dispatchEvent(navigateNextEvent);
    }
  }

  handleNavigatePrev() {
    this.rules = this.getNewTriggerRules();
    if (!this.isMinimalDataAmountFilled()) {
      this.showToast("", this.labels.tip_for_user, "error");
      console.log('ERROR!');
    } else {
      console.log('new tr rules');
      console.log(this.rules);
      const navigatePrevEvent = new CustomEvent("navigateback", {
        detail: { triggerRules: [...this.rules] },
      });
      this.dispatchEvent(navigatePrevEvent);
    }
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
        console.log('trigger r fr single');
        console.log(triggerRule);
        if(!this.isEmpty(triggerRule)) {
          newTriggerRules.push(triggerRule);
        }        
      }
    });
    return newTriggerRules;
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: "dismissable",
    });
    this.dispatchEvent(event);
  }

  isMinimalDataAmountFilled() {
    if(!this.rules[0] || this.isEmpty(this.rules[0]) || this.rules[0].Field_Value__c === "" || this.rules[0].Operator__c === "") {
      return false;
    }
    return true;
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
}
