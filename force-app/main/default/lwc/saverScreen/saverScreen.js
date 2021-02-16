import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { stepsOfSave, navigationType } from './constants.js';

import saveSurvey from "@salesforce/apex/SaverController.saveSurvey";
import saveTriggerRules from "@salesforce/apex/SaverController.saveTriggerRules";
import saveQuestions from "@salesforce/apex/SaverController.saveQuestions";
import saveOptions from "@salesforce/apex/SaverController.saveOptions";
import saveValidations from "@salesforce/apex/SaverController.saveValidations";
import saveEmailReceivers from "@salesforce/apex/SaverController.saveEmailReceivers";
import sendEmails from "@salesforce/apex/SendEmailLogic.sendEmails";
import saveSurveyUrl from "@salesforce/apex/SaverController.saveSurveyUrl";
import saveCommunityUrl from "@salesforce/apex/SaverController.saveCommunityUrl";
import getCommunityUrl from "@salesforce/apex/CommunityController.getCommunityUrl";
import getCommunityName from "@salesforce/apex/SurveySettingController.getCommunityName";

import { surveyObject } from "c/fieldService";

import { transformRules,  
         transformQuestions,
         transformOptions,
         transformValidations,
         transformEmailReceivers
} from './saverScreenHelper';

import {label} from "./labels.js";

export default class SaverScreen extends NavigationMixin(LightningElement) {

  label = label;

  @api survey;
  @api triggerRules;
  @api questions;
  @api validations = [];
  @api emailReceivers = [];

  @track
  stepsOfSave = stepsOfSave;

  @track isError = false;

  currentStep = 0;

  surveyId;
  savedQuestions;

  SURVEY_URL_PARAMETER_NAME = 'c__surveyId';
  ANSWER_PAGE_API_NAME = 'Survey_Answer_Form';

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
        this.getSurveyUrl(this.surveyId);
        this.getSurvey

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
        this.isError = true;
      })
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
        this.isError = true;
      })
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
        this.isError = true;
      })
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
        this.isError = true;
      })
  }

  sendSaveValidationsRequest() {
    const transformedValidations = transformValidations(this.validations, this.savedQuestions);

    if(transformedValidations.length === 0) {
      this.increaseProgress();
      this.sendSaveEmailReceiversRequest();
      return;
    }

    saveValidations({validations : transformedValidations})
      .then(() => {
        this.increaseProgress();
        this.sendSaveEmailReceiversRequest();
      })
      .catch((error) => {
        console.log(error);
        this.isError = true;
      })
  }

  sendSaveEmailReceiversRequest() {
    const transformedEmailReceivers = transformEmailReceivers(this.emailReceivers, this.surveyId);

    if(!transformedEmailReceivers || transformedEmailReceivers.length === 0) {
      this.increaseProgress();
      return;
    }

    saveEmailReceivers({receivers : transformedEmailReceivers})
      .then((receiverList) => {
        this.increaseProgress();
        this.sendImmediatelyEmails(receiverList);
      })
      .catch((error) => {
        console.log(error);
        this.isError = true;
      })
  }

  sendImmediatelyEmails(receiverList){
    sendEmails({emailReceiverList: receiverList})
    .catch((error) => {
        console.log(error);
        this.isError = true;
    })
  }

  increaseProgress() {
    this.stepsOfSave[this.currentStep].isDone = true;
    this.currentStep++;
  }

  getSurveyUrl(_surveyId){
    if(surveyObject.split("__S").length > 1){
        this.ANSWER_PAGE_API_NAME = surveyObject.split("__S")[0] + '__' +  this.ANSWER_PAGE_API_NAME;
        this.SURVEY_URL_PARAMETER_NAME = this.SURVEY_URL_PARAMETER_NAME.replace('c', surveyObject.split("__S")[0]);
    }

    this[NavigationMixin.GenerateUrl]({
        type: navigationType,
        attributes: {
            apiName: this.ANSWER_PAGE_API_NAME
        }
    })
    .then((url) => {
        url = url + '?' + this.SURVEY_URL_PARAMETER_NAME + '=' + _surveyId;
        saveSurveyUrl({surveyId : this.surveyId, surveyUrl : url})
        .catch(() => {
            this.isError = true;
        })
    });
  }

  getCommunityUrl(_surveyId){
    getCommunityName()
      .then((data) => {
        if (data) {
          return getCommunityUrl({communityName: data})
        }
      })
      .then((url) => {
        if (url) {
          url = `${url}?${this.SURVEY_URL_PARAMETER_NAME}=${_surveyId}`;
          saveCommunityUrl({surveyId : this.surveyId, communityUrl : url});
        }
      })
      .catch(() => {
          this.isError = true;
      });
    
  }
}