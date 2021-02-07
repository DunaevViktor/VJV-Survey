import { LightningElement, api, track } from "lwc";
import { FlowNavigationBackEvent,FlowNavigationNextEvent } from "lightning/flowSupport";
import { label } from "./labels.js";
import { initQuestionFields } from "./previewScreenHelper.js";

export default class PreviewScreen extends LightningElement {
  label = label;

  @track _survey;
  @track _questions = [];

  @api
  get questions() {
    return this._questions;
  }

  set questions(value) {
    this._questions = initQuestionFields(JSON.parse(JSON.stringify(value)));
  }

  @api
  get survey() {
    return this._survey;
  }

  set survey(value) {
    this._survey = JSON.parse(JSON.stringify(value));
  }

  get backgroundColor() {
    return "background-color: " + this.survey.Background_Color__c + ";";
  }

  clickPreviousButton() {
    const backNavigationEvent = new FlowNavigationBackEvent();
    this.dispatchEvent(backNavigationEvent);
  }

  clickNextButton() {
    const nextNavigationEvent = new FlowNavigationNextEvent();
    this.dispatchEvent(nextNavigationEvent);
  }
}