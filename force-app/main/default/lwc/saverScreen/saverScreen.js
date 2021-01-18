import { LightningElement, api, track } from 'lwc';
import { stepsOfSave } from './constants.js';

import saveSurvey from "@salesforce/apex/SaverController.saveSurvey";
import saveTriggerRules from "@salesforce/apex/SaverController.saveTriggerRules";
import saveQuestions from "@salesforce/apex/SaverController.saveQuestions";
import saveOptions from "@salesforce/apex/SaverController.saveOptions";
import saveValidations from "@salesforce/apex/SaverController.saveValidations";

import { transformRules,  
         transformQuestions,
         transformOptions,
         transformValidations
} from './saverScreenHelper';

import {label} from "./labels.js";

export default class SaverScreen extends LightningElement {

  label = label;

  @api survey;
  @api triggerRules;
  @api questions;
  @api validations = [];

  @track
  stepsOfSave = stepsOfSave;

  currentStep = 0;

  surveyId;
  savedQuestions;

  get isComplete() {
    return this.stepsOfSave.reduce((accumulator, currentValue) => {
      return accumulator && currentValue.isDone;
    }, true);
  }

  connectedCallback() {
    this.sendSaveSurveyRequest();
  }

  sendSaveSurveyRequest() {
    saveSurvey({survey : this.survey})
      .then((result) => {
        this.surveyId = result;

        this.increaseProgress();

        if(!this.triggerRules || this.triggerRules.length === 0) {
          this.increaseProgress();
          this.sendSaveQuestionsRequest();
          return;
        }

        this.sendSaveTriggerRulesRequest();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  sendSaveTriggerRulesRequest() {
    const transfomedRules = transformRules(this.triggerRules, this.surveyId);

    saveTriggerRules({rules : transfomedRules})
      .then(() => {
        this.increaseProgress();
        this.sendSaveQuestionsRequest();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  sendSaveQuestionsRequest() {
    const transformedQuestions = transformQuestions(this.questions, this.surveyId);

    saveQuestions({questions : transformedQuestions})
      .then((result) => {
        this.savedQuestions = result;
        this.sendSaveOptionsRequest();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  sendSaveOptionsRequest() {
    const tranformedOptions = transformOptions(this.questions, this.savedQuestions);

    if(tranformedOptions.length === 0) {
      this.increaseProgress();
      this.sendSaveValidationsRequest();
      return;
    }

    saveOptions({options : tranformedOptions})
      .then(() => {
        this.increaseProgress();
        this.sendSaveValidationsRequest();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  sendSaveValidationsRequest() {
    const transformedValidations = transformValidations(this.validations, this.savedQuestions);

    if(transformedValidations.length === 0) {
      this.increaseProgress();
      return;
    }

    saveValidations({validations : transformedValidations})
      .then(() => {
        this.increaseProgress();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  increaseProgress() {
    this.stepsOfSave[this.currentStep].isDone = true;
    this.currentStep++;
  }
}