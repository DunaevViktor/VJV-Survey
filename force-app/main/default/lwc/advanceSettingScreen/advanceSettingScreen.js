//TODO: aura to lwc
//TODO: naming
//TODO: tests
//TODO: add styles for button
//TODO: add labels
//TODO: format code with prettier
//TODO: add constants to code

import { LightningElement, track, wire } from "lwc";
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getSurveys";

const columns = [
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Group Name or Email", fieldName: "nameOrEmail", type: "text" },
  {
    type: "button",
    initialWidth: 100,
    typeAttributes: {
      label: "Delete",
      name: "delete"
    }
  }
];

export default class SurveyDistributionScreenBody extends LightningElement {
  groupId = "";
  surveyId = "";
  columns = columns;
  isCreateDiagrams = false;
  @track data = [];
  @track isEmailReceiver = true;
  @track isConnectToSurvey = false;
  @track receiverType = "email";
  @track surveys;
  @wire(getGroups, {})
  groups;
  @wire(getSurveys, {})
  wiredSurveys({ error, data }) {
    if (data) {
      this.surveys;
    } else {
      this.surveys = undefined;
    }
  }

  get newReceiverOptions() {
    return [
      { label: "Email", value: "email" },
      { label: "Group Name", value: "groupName" }
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

  handleIsCreateDiagramsChange(event) {
    this.isCreateDiagrams = event.target.checked;
  }

  handleIsNewReceiverChange(event) {
    const selectedReceiver = event.detail.value;
    switch (selectedReceiver) {
      case "email":
        this.receiverType = "email";
        this.isEmailReceiver = true;
        break;

      case "groupName":
        this.groupId = "";
        this.receiverType = "group";
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

  handleAddEmailReceiver(inputForm, receiver) {
    let inputStr = inputForm.value.match(/\w+@\w+\.\w+/);
    if (inputStr === null) {
      inputForm.setCustomValidity("Email pattern mismatch!");
      inputForm.reportValidity();
      return;
    }
    receiver.type = "Email";
    receiver.nameOrEmail = inputForm.value;
    let validityMessage = "";
    console.log("shit");
    if (
      this.data.find((tempReceiver, index) => {
        if (receiver.nameOrEmail.localeCompare(tempReceiver.nameOrEmail) === 0)
          return true;
      })
    ) {
      validityMessage = "You've alredy added this email";
    } else {
      this.data = [...this.data, receiver];
    }
    inputForm.setCustomValidity(validityMessage);
    inputForm.reportValidity();
  }

  handleAddGroupReceiver(combobox, receiver) {
    if (this.groupId.localeCompare("") === 0) {
      combobox.setCustomValidity("Choose some group!");
      combobox.reportValidity();
      return;
    }
    console.log("shit2");
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
      validityMessage = "You've alredy added this group";
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

    switch (this.receiverType) {
      case "email":
        {
          let inputForm = this.template.querySelector("lightning-input");
          this.handleAddEmailReceiver(inputForm, receiver);
        }
        break;
      case "group":
        {
          let combobox = this.template.querySelector("lightning-combobox");
          console.log("shit1");
          this.handleAddGroupReceiver(combobox, receiver);
        }
        break;
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
