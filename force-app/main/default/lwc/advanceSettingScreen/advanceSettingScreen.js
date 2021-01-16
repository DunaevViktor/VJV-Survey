//TODO: format code with prettier
//TODO: pass settings to flow (pass array of receivers, isStandard, connectToSurvey)

import { LightningElement, track, wire, api } from "lwc";
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import {label} from "./labels";

const columns = [
  { label: label.type, fieldName: "type", type: "text" },
  { label: label.group_name_or_email, fieldName: "nameOrEmail", type: "text" },
  {
    type: "button",
    initialWidth: 100,
    typeAttributes: {
      label: label.delete_button,
      name: "delete"
    }
  }
];

export default class AdvanceSettingScreen extends LightningElement {

  label = label;
  groupId = "";
  @api surveyId = "";
  columns = columns;
  @api isStandardSurvey = false;
  @api shit = {
    name: "shit",
  };
  @track data = [];
  @track isEmailReceiver = true;
  @track isConnectToSurvey = false;
  @track surveys;
  @wire(getGroups, {})
  groups;
  @wire(getSurveys, {})
  wiredSurveys({ error, data }) {
    if (data) {
      console.log("shit1");
      this.surveys = data;
    } else {
      console.log("shit2");
      this.surveys = undefined;
    }
  }

  get newReceiverOptions() {
    return [
      { label: label.email, value: "email" },
      { label: label.group_name, value: "groupName" }
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
      this.data = this.data.slice(0, index).concat(this.data.slice(index + 1));
    }
  }

  findRowIndexById(id) {
    let ret = -1;
    this.data.some((row, index) => {
      if (row.id === id) {
        ret = index;
        return true;
      }
      return false;
    });
    return ret;
  }

  handleIsStandardSurveyChange(event) {
    this.isStandardSurvey = event.target.checked;
  }

  handleIsNewReceiverChange(event) {
    const selectedReceiver = event.detail.value;
    switch (selectedReceiver) {
      case "email":
        this.isEmailReceiver = true;
        break;

      case "groupName":
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
    receiver.type = "Email";
    receiver.nameOrEmail = inputForm.value;
    let validityMessage = "";
    if (
      this.data.find((tempReceiver, index) => {
        if (receiver.nameOrEmail.localeCompare(tempReceiver.nameOrEmail) === 0)
          return true;
      })
    ) {
      validityMessage = label.error_alredy_added_this_email;
    } else {
      this.data = [...this.data, receiver];
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
    receiver.type = "Group";
    receiver.nameOrEmail = this.groups.data.find((group, index) => {
      if (this.groupId == group.Id) return true;
    }).Name;

    let validityMessage = "";
    if (
      this.data.find((tempReceiver, index) => {
        if (receiver.nameOrEmail.localeCompare(tempReceiver.nameOrEmail) === 0)
          return true;
      })
    ) {
      validityMessage = label.error_alredy_added_this_group;
    } else {
      this.data = [...this.data, receiver];
    }
    combobox.setCustomValidity(validityMessage);
    combobox.reportValidity();
  }

  handleAddClick() {
    const receiver = {
      type: "",
      nameOrEmail: ""
    };

    if(this.isEmailReceiver) {
      this.handleAddEmailReceiver(receiver);
    }else{
      this.handleAddGroupReceiver(receiver);
    }
  }

  get surveyOptions() {
    return this.surveys.map((survey) => {
      return { label: survey.Name, value: survey.Id };
    });
  }

  handleSurveyChange(event) {
    this.surveyId = event.detail.value;
  }

  handleConnectToAnotherSurveyChange(event) {
    this.isConnectToSurvey = event.target.checked;
  }
}
