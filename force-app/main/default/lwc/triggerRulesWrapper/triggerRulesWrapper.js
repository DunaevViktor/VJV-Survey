import { LightningElement, track, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createTriggerRuleList from "@salesforce/apex/TriggerRuleController.createTriggerRuleList";
import promptForUser from "@salesforce/label/c.TriggerRulesPrompt";

export default class TriggerRulesWrapper extends LightningElement {
  prompt = promptForUser;

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
      createTriggerRuleList()
        .then((result) => {
          this.rules = result;
        })
        .catch((error) => {
          console.log(error);
        });
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
    let newTriggerRules = [];

    this.renderConditions.forEach((condition) => {
      if (condition.cond === true) {
        let id = condition.id.toString();
        let element = this.template.querySelector(
          'c-single-trigger-rule[data-my-id="' + id + '"]'
        );
        let triggerRule = JSON.parse(JSON.stringify(element.getTriggerRule()));
        let newTriggerRule = {
          Object_Api_Name__c: triggerRule.Object_Api_Name__c,
          Field_Name__c: triggerRule.Field_Name__c,
          Field_Value__c: triggerRule.Field_Value__c,
          Operator__c: triggerRule.Operator__c,
        };

        newTriggerRules.push(newTriggerRule);
      }
    });
    this.rules = newTriggerRules;
    if (
      this.rules[0].Field_Value__c === "" ||
      this.rules[0].Operator__c === ""
    ) {
      this.showToast("", "At least one trigger rule must be filled.", "error");
    } else {
      const navigateNextEvent = new CustomEvent("navigatenext", {
        detail: { triggerRules: [...this.rules] },
      });
      this.dispatchEvent(navigateNextEvent);
    }
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
}
