import { LightningElement } from "lwc";
import { FlowNavigationBackEvent } from "lightning/flowSupport";

export default class TriggerRulesFooterNavigation extends LightningElement {
  handleNext() {
    const navigateNextEvent = new CustomEvent("navigatenext");
    this.dispatchEvent(navigateNextEvent);
  }

  handlePrev() {
    const navigateBackEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(navigateBackEvent);
  }
}
