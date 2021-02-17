import { LightningElement, api, track } from "lwc";
import { FlowNavigationBackEvent,FlowNavigationNextEvent } from "lightning/flowSupport";
import { label } from "./labels.js";
import { initQuestionFields } from "./previewScreenHelper.js";
import { surveyFields } from "c/fieldService";

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

  get surveyName() {
    return this.survey[surveyFields.NAME];
  }
  
  get surveyLogo() {
    return this.survey[surveyFields.LOGO];
  }

  get surveyDescription() {
    return this.survey[surveyFields.DESCRIPTION];
  }

  get backgroundColor() {
    return `background-color: ${this.survey[surveyFields.BACKGROUND]};`;
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