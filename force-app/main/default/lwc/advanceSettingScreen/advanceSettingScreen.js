import { LightningElement, track, api } from "lwc";
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import { label } from "./labels.js";
import { columns, receiverOptions, isReceiverExist } from "./advanceSettingScreenHelper.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class AdvanceSettingScreen extends LightningElement {
  TYPE_EMAIL = "email";
  TYPE_GROUP = "groupName";
  EMAIL_PATTERN = /\w+@\w+\.\w+/;

  EMAIL_VARIANT = "Email";
  GROUP_VARIANT = "User Group";

  label = label;
  columns = columns;
  receiverOptions = receiverOptions;

  @track hasReceiers;
  @track receivers = [];
  @track isEmailReceiver = true;
  @track isConnectToSurvey;

  @track __survey = {};
  @track displayedSurveys = [];
  @track displayedGroups = [];

  @track isHasSurveys = false;
  @track isHasGroups = false;
  @track isError = false;

  get surveyReceivers() {
    return this.receivers;
  }

  get survey() {
    return this.__survey;
  }

  get surveys() {
    return this.displayedSurveys;
  }

  get groups() {
    return this.displayedSurveys;
  }

  @api set survey(value) {
    this.__survey = JSON.parse(JSON.stringify(value));
    if (this.__survey.Related_To__c === undefined) {
      this.isConnectToSurvey = false;
    } else {
      this.isConnectToSurvey = true;
      this.surveyId = this.__survey.Related_To__c;
    }
  }

  @api set surveyReceivers(value) {
    this.receivers = JSON.parse(JSON.stringify(value));
  }

  @api set surveys(value) {
    this.displayedSurveys = JSON.parse(JSON.stringify(value));
  }

  @api set groups(value) {
    this.displayedGroups = JSON.parse(JSON.stringify(value));
  }

  groupId = "";
  surveyId = "";

  connectedCallback() {
    this.initSurveys();
    this.initGroups();
    this.setIsHasReseivers();

    this.isHasSurveys = this.displayedSurveys.length > 0;
    this.isHasGroups = this.displayedGroups > 0;
  }

  initSurveys() {
    if(this.displayedSurveys.length === 0) {
      getSurveys()
      .then((result) => {
        this.displayedSurveys = result.length > 0 ? result : [];
        this.isHasSurveys = this.displayedSurveys.length > 0;
      })
      .catch(() => {
        this.isError = true;
      });
    }
  }

  initGroups() {
    if(this.displayedGroups.length === 0) {
      getGroups()
      .then((result) => {
        this.displayedGroups = result.length > 0 ? result : [];
        this.isHasGroups = this.displayedGroups.length > 0;
      })
      .catch(() => {
        this.isError = true;
      });
    }
  } 

  get groupOptions() {
    return this.displayedGroups.map((group) => {
      return { label: group.Name, value: group.Id };
    });
  }

  get surveyOptions() {
    return this.displayedSurveys.map((survey) => {
      return { label: survey.Name, value: survey.Id };
    });
  }


  setIsHasReseivers() {
    this.hasReceiers = this.receivers && this.receivers.length > 0;
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if(actionName === "delete") {
      this.deleteRow(row);
    }
  }

  deleteRow(row) {
    const { Value__c } = row;
    this.receivers = this.receivers.filter((receiver) => {
      return receiver.Value__c !== Value__c;
    });

    this.setIsHasReseivers();
  }

  handleIsNewReceiverChange(event) {
    const selectedReceiver = event.detail.value;
    this.isEmailReceiver = selectedReceiver === this.TYPE_EMAIL;

    if(!this.isEmailReceiver) {
      this.groupId = "";
    }
  }

  handleGroupChange(event) {
    this.groupId = event.detail.value;
  }

  handleAddEmailReceiver() {
    const input = this.template.querySelector(".email-input");
    
    if(!this.isEmailValid(input)) {
      return;
    }
    
    const receiver = {};
    receiver.Type__c = this.EMAIL_VARIANT;
    receiver.Value__c = input.value;
    this.receivers = [...this.receivers, receiver];

    input.setCustomValidity("");
    input.reportValidity();
    input.value = "";

    this.setIsHasReseivers();
  }

  isEmailValid(input) {
    const result = input.value.match(this.EMAIL_PATTERN);
    if (result === null) {
      this.callReportValidity(input, label.error_email_pattern_mismatch);
      return false;
    }

    if(isReceiverExist(this.receivers, input.value)) {
      this.callReportValidity(input, label.error_already_added_this_email);
      return false;
    }

    return true;
  }

  callReportValidity(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
  }

  handleAddGroupReceiver() {
    const combobox = this.template.querySelector(".group-combobox");

    if(!this.isGroupValid(combobox)) {
      return;
    }
    
    const receiver = {};
    receiver.Type__c = this.GROUP_VARIANT;
    receiver.Value__c = this.displayedGroups.find((group) => {
      if (this.groupId == group.Id) return true;
    }).Name;

    this.receivers = [...this.receivers, receiver];

    combobox.setCustomValidity("");
    combobox.reportValidity();

    this.setIsHasReseivers();
  }

  isGroupValid(combobox) {
    if (this.groupId.localeCompare("") === 0) {
      this.callReportValidity(combobox, label.error_choose_some_group);
      return false;
    }

    const value = this.displayedGroups.find((group) => {
      if (this.groupId == group.Id) return true;
    }).Name;

    if(isReceiverExist(this.receivers, value)) {
      this.callReportValidity(combobox, label.error_already_added_this_group);
      return false;
    }

    return true;
  }

  handleIsStandardSurveyChange(event) {
    this.__survey.IsStandard__c = event.target.checked;
  }

  handleIsResendingChange(event) {
    this.__survey.IsResending__c = event.target.checked;
  }

  handleSurveyChange(event) {
    this.__survey.Related_To__c = event.detail.value;
    this.surveyId = event.detail.value;
  }

  handleConnectToAnotherSurveyChange(event) {
    this.isConnectToSurvey = event.target.checked;
    if (!this.isConnectToSurvey) {
      this.surveyId = "";
      this.__survey.Related_To__c = undefined;
    }
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