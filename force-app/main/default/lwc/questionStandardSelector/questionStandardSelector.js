import { LightningElement, api, track } from 'lwc';
import {transformStandardQuestions} from "./questionStandardSelectorHelper.js";
import {label} from "./labels.js";

export default class QuestionStandardSelector extends LightningElement {

  SELECT_OPTION_VARIANT = 'select';

  label = label;

  @api standardQuestions;
  @track displayedQuestions;

  columns = [
    { label: label.question, fieldName: 'Label__c' },
    { label: label.type, fieldName: 'Type__c'},
    { label: label.options, fieldName: 'Question_Options__r'},
    {
        type: 'button',
        initialWidth: 100,
        typeAttributes: {
            label: label.select,
            name: 'select'
        }
    },
  ];

  connectedCallback() {
    this.displayedQuestions = transformStandardQuestions(this.standardQuestions);
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if(actionName === this.SELECT_OPTION_VARIANT) {
      this.addStandardQuestion(row);
    }
      
  }

  handleBack() {
    const backEvent = new CustomEvent("back");
    this.dispatchEvent(backEvent);
  }

  addStandardQuestion(row) {
    const { Id } = row;

    const selectedQuestion = this.standardQuestions.find((question) => {
      return question.Id === Id;
    });

    const selectEvent = new CustomEvent("select", {
      detail: selectedQuestion
    });
    this.dispatchEvent(selectEvent);
  }
}