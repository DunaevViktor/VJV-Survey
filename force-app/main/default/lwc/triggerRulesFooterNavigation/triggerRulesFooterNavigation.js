import { LightningElement } from "lwc";
import {
  FlowAttributeChangeEvent,
  FlowNavigationNextEvent
} from "lightning/flowSupport";

export default class TriggerRulesFooterNavigation extends LightningElement {
  handleNext(event) {
    /*const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);*/
    try {
      const navigateNextEvent = new CustomEvent("navigatenext", {});

      this.dispatchEvent(navigateNextEvent);
    } catch (error) {
      console.log("error");
    }
  }
}
