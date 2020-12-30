import { LightningElement, track, api } from "lwc";
import createTriggerRuleWithParams from "@salesforce/apex/TriggerRuleController.createTriggerRuleWithParams";
import createTrigerRuleList from "@salesforce/apex/TriggerRuleController.createTrigerRuleList";
import promptForUser from "@salesforce/label/c.TriggerRulesPrompt";

export default class TriggerRulesWrapper extends LightningElement {
  MAX_RULE_COUNT = 5;

  prompt = promptForUser;

  @track renderConditions = [
    { cond: true, id: 0, isDeleteAvailable: false },
    { cond: false, id: 1, isDeleteAvailable: true },
    { cond: false, id: 2, isDeleteAvailable: true },
    { cond: false, id: 3, isDeleteAvailable: true },
    { cond: false, id: 4, isDeleteAvailable: true }
  ];

  @api triggerRules;

  currentTriggerRulesCount;

  connectedCallback() {
    this.currentTriggerRulesCount = 1;
    if (!this.triggerRules) {
      console.log("Tr rules are null");
      createTrigerRuleList()
        .then((result) => {
          this.triggerRules = result;
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("trigger rules arent null");
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
    console.log(event.detail);
    this.renderConditions[childKey].cond = false;
  }

  get isPlusVisible() {
    let filteredRenderConditions = this.renderConditions.filter(
      (condition) => condition.cond === false
    );
    return filteredRenderConditions.length === 0 ? false : true;
  }

  handleNavigateNext() {
    console.log("Handle nav next wrapper");
    //let newTriggerRules = [];
    this.triggerRules.splice(0, this.triggerRules.length);
    try {
      console.log(
        this.template.querySelector('c-single-trigger-rule[data-my-id="0"]')
      );

      let th = this;
      this.renderConditions.forEach((condition) => {
        if (condition.cond === true) {
          console.log(condition.id);
          let id = condition.id.toString();
          console.log(id);
          let element = th.template.querySelector(
            'c-single-trigger-rule[data-my-id="' + condition.id + '"]'
          );
          console.log("before apex");
          console.log(element);
          let triggerRule = element.getTriggerRule();
          // this.triggerRules = JSON.parse(JSON.stringify(this.triggerRules));
          createTriggerRuleWithParams({
            objApiName: triggerRule.Object_Api_Name__c,
            fieldName: triggerRule.Field_Name__c,
            fieldValue: triggerRule.Field_Value__c,
            operator: triggerRule.Opearator__c
          })
            .then((result) => {
              console.log("result");
              console.log(result);
              let newTrRule = result;
              console.log(JSON.stringify(newTrRule));
              this.triggerRules.push(newTrRule);

              let detail = JSON.parse(JSON.stringify(this.triggerRules));
              console.log("Detail");
              console.log(detail);
              const navigateNextEvent = new CustomEvent("navigatenext", {
                detail: { triggerRules: [...detail] }
              });
              this.dispatchEvent(navigateNextEvent);
            })
            .catch((error) => {
              console.log("error!");
              console.error(error);
            });
        }
      });
      console.log("current tr rules (api)!");

      //this.currentTriggerRules = JSON.stringify(newTriggerRules);

      console.log(JSON.stringify(this.triggerRules));
    } catch (error) {
      console.log(error);
    }
  }
}
