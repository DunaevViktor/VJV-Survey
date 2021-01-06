import { LightningElement } from "lwc";
import { FlowNavigationBackEvent } from "lightning/flowSupport";
import next from "@salesforce/label/c.next";
import previous from "@salesforce/label/c.previous";

export default class TriggerRulesFooterNavigation extends LightningElement {

  labels = {
    next,
    previous
  }

  handleNext() {
    const navigateNextEvent = new CustomEvent("navigatenext");
    this.dispatchEvent(navigateNextEvent);
  }

  handlePrev() {
    const navigateBackEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(navigateBackEvent);
  }
}
