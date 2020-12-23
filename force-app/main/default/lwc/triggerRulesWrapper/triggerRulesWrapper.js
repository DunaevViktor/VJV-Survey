import { LightningElement, track } from "lwc";

export default class TriggerRulesWrapper extends LightningElement {
  MAX_RULE_COUNT = 5;
  @track renderConditions = [
    { cond: true, id: 1, isDeleteAvailable: false },
    { cond: false, id: 2, isDeleteAvailable: true },
    { cond: false, id: 3, isDeleteAvailable: true },
    { cond: false, id: 4, isDeleteAvailable: true },
    { cond: false, id: 5, isDeleteAvailable: true }
  ];

  currentTriggerRulesCount;

  connectedCallback() {
    this.currentTriggerRulesCount = 1;
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
}
