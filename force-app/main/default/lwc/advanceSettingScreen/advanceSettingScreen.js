import { LightningElement, track, wire, api } from "lwc";
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import { label } from "./labels.js";
import { columns, isReceiverExist } from "./advanceSettingScreenHelper.js";

export default class AdvanceSettingScreen extends LightningElement {
  TYPE_EMAIL = "email";
  TYPE_GROUP = "groupName";

  label = label;
  columns = columns;
  groupId = "";
  surveyId = "";

  @track receivers = [];
  @track isEmailReceiver = true;
  @track isConnectToSurvey;
  @track surveys;

  @wire(getGroups, {})
  groups;

  @wire(getSurveys, {})
  wiredSurveys({ error, data }) {
    if (data) {
      if (data.length != 0) {
        this.surveys = data;
      } else {
        this.surveys = undefined;
      }
      console.log(JSON.stringify(data));
    } else {
      this.surveys = undefined;
    }
  }

  __survey = {};

  get surveyReceivers() {
    return this.receivers;
  }

  get survey() {
    return this.__survey;
  }

  @api set survey(value) {
    this.__survey = JSON.parse(JSON.stringify(value));
    if (this.__survey.Related_To__c == undefined) {
      this.isConnectToSurvey = false;
    } else {
      this.isConnectToSurvey = true;
      this.surveyId = this.__survey.Related_To__c;
    }
  }

  @api set surveyReceivers(value) {
    this.receivers = JSON.parse(JSON.stringify(value));
  }

  get newReceiverOptions() {
    return [
      { label: label.email, value: this.TYPE_EMAIL },
      { label: label.group_name, value: this.TYPE_GROUP }
    ];
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    switch (actionName) {
      case "delete":
        this.deleteRow(row);
        break;
    }
  }

  deleteRow(row) {
    const { id } = row;
    const index = this.findRowIndexById(id);
    if (index !== -1) {
      this.receivers = this.receivers
        .slice(0, index)
        .concat(this.receivers.slice(index + 1));
    }
  }

  findRowIndexById(id) {
    let ret = -1;
    this.receivers.some((row, index) => {
      if (row.id === id) {
        ret = index;
        return true;
      }
      return false;
    });
    return ret;
  }

  handleIsStandardSurveyChange(event) {
    this.__survey.IsStandard__c = event.target.checked;
  }

  handleIsNewReceiverChange(event) {
    const selectedReceiver = event.detail.value;
    switch (selectedReceiver) {
      case this.TYPE_EMAIL:
        this.isEmailReceiver = true;
        break;

      case this.TYPE_GROUP:
        this.groupId = "";
        this.isEmailReceiver = false;
        break;
    }
  }

  get groupOptions() {
    return this.groups.data.map((group) => {
      return { label: group.Name, value: group.Id };
    });
  }

  handleGroupChange(event) {
    this.groupId = event.detail.value;
  }

  handleAddEmailReceiver(receiver) {
    let inputForm = this.template.querySelector("lightning-input");
    let inputStr = inputForm.value.match(/\w+@\w+\.\w+/);
    if (inputStr === null) {
      inputForm.setCustomValidity(label.error_email_pattern_mismatch);
      inputForm.reportValidity();
      return;
    }
    receiver.Type__c = "Email";
    receiver.Value__c = inputForm.value;
    let validityMessage = "";
    if (isReceiverExist(receiver, this.receivers)) {
      validityMessage = label.error_alredy_added_this_email;
    } else {
      this.receivers = [...this.receivers, receiver];
    }
    inputForm.setCustomValidity(validityMessage);
    inputForm.reportValidity();
  }

  handleAddGroupReceiver(receiver) {
    let combobox = this.template.querySelector("lightning-combobox");
    if (this.groupId.localeCompare("") === 0) {
      combobox.setCustomValidity(label.error_choose_some_group);
      combobox.reportValidity();
      return;
    }
    receiver.Type__c = "Group";
    receiver.Value__c = this.groups.data.find((group, index) => {
      if (this.groupId == group.Id) return true;
    }).Name;

    let validityMessage = "";
    if (isReceiverExist(receiver, this.receivers)) {
      validityMessage = label.error_alredy_added_this_group;
    } else {
      this.receivers = [...this.receivers, receiver];
    }
    combobox.setCustomValidity(validityMessage);
    combobox.reportValidity();
  }

  handleAddClick() {
    const receiver = {};
    if (this.isEmailReceiver) {
      this.handleAddEmailReceiver(receiver);
    } else {
      this.handleAddGroupReceiver(receiver);
    }
  }

  get surveyOptions() {
    return this.surveys.map((survey) => {
      return { label: survey.Name, value: survey.Id };
    });
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
}
