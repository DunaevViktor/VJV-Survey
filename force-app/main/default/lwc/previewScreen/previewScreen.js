import { LightningElement, api, track } from "lwc";
import {
  FlowNavigationBackEvent,
  FlowNavigationNextEvent
} from "lightning/flowSupport";
import { label } from "./labels.js";

import {
    initQuestionFields
  } from "./previewScreenHelper";

export default class PreviewScreen extends LightningElement {
  @api survey;

  @track _questions;

  label = label;

  get previewSurvey(){
      return this.survey;
  }

  get questions(){
      return this._questions;
  }

  @api
  set questions(questions = []){
      this._questions = [...questions];
  }

  get previewQuestions() {
    let newInputs = initQuestionFields(JSON.parse(JSON.stringify(this._questions)));
          console.log('in get:', newInputs);

      return newInputs;
}

  get backgroundColor() {
    return (
      "background-color: " +
      this.survey.Background_Color__c +
      ";"
    );
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
