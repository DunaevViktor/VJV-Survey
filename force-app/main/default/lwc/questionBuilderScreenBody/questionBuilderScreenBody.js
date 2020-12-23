import { LightningElement } from "lwc";

export default class QuestionBuilderScreenBody extends LightningElement {
  value = "inProgress";

  get options() {
    return [
      { label: "New", value: "new" },
      { label: "In Progress", value: "inProgress" },
      { label: "Finished", value: "finished" }
    ];
  }

  get questionOptions() {
    return [
      { Id: 1, name: "Test 1" },
      { Id: 2, name: "Test 2" },
      { Id: 3, name: "Test 3" }
    ];
  }

  get questions() {
    return [
      {
        Id: 1,
        Label: "Happy Christmas",
        Type: "Type",
        Is_Required__c: false,
        options: [
          { Id: 1, Label: "Option 1" },
          { Id: 1, Label: "Option 2" },
          { Id: 1, Label: "Option 3" }
        ]
      },
      {
        Id: 2,
        Label: "Happy New Year",
        Type: "Type",
        Is_Required__c: true,
        options: []
      },
      {
        Id: 3,
        Label: "Happy Womens Day",
        Type: "Type",
        Is_Required__c: false,
        options: []
      }
    ];
  }
}
