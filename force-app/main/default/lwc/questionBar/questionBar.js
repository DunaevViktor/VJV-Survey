import { LightningElement, api, track } from 'lwc';

import {label} from './labels.js';
import {
    transformDisplayesTypes
} from './questionBarHelper.js';

export default class QuestionBar extends LightningElement {
  NO_TEMPLATE_VALUE = "0";

  @track displayedTemplates = [];
  @track noTemplate;

  get templates() {
    return this.displayedTemplates;
  }

  @api
  set templates(value) {
    this.displayedTemplates = JSON.parse(JSON.stringify(value));
  }

  @api templateOptionsValue;
  @api hasStandardQuestions;

  label = label;

  connectedCallback() {
    this.noTemplate = {
      label: label.no_template,
      value: this.NO_TEMPLATE_VALUE
    };
  }

  get templateOptions() {
    let templateOptions  = this.displayedTemplates ? 
    transformDisplayesTypes(this.displayedTemplates) : [];

    templateOptions.push(this.noTemplate);
    return templateOptions;
  }

  handleTemplateChange(event) {
    const templateSelectEvent = new CustomEvent("select", {
      detail: event.detail.value
    });
    this.dispatchEvent(templateSelectEvent);
  }

  handleAddStandardQuestion() {
    const addStandrardEvent = new CustomEvent("addstandard", {});
    this.dispatchEvent(addStandrardEvent);
  }

  handleAddQuestion() {
    const addEvent = new CustomEvent("add", {});
    this.dispatchEvent(addEvent);
  }
}