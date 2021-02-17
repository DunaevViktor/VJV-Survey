import { LightningElement, api, track } from "lwc";
import { questionFields } from "c/fieldService";

import { label } from "./labels.js";

export default class QuestionCard extends LightningElement {
  ZERO = 0;
  STATUS_CONFIRM = 'confirm';
  EMPTY_STRING = '';
  MESSAGE_DELETE = 'deleteQuestion';
  MESSAGE_ADD = 'addOptional';

  @api question;

  label = label;

  @track message = '';

  @track isDialogVisible = false;
  @track originalMessage;

  get questionPosition() {
    return this.question[questionFields.POSITION];
  }

  get questionLabel() {
    return this.question[questionFields.LABEL];
  }

  get questionType() {
    return this.question[questionFields.TYPE];
  }

  get questionRequired() {
    return this.question[questionFields.REQUIRED];
  }

  get isHasOptions() {
    return this.question.Question_Options__r && this.question.Question_Options__r.length > this.ZERO;
  }

  deleteQuestionClick() {
    this.originalMessage = this.MESSAGE_DELETE;
    this.message = label.confirm_question_delete_message;
    this.isDialogVisible = true;
  }

  deleteQuestion() {
    const deleteEvent = new CustomEvent("delete", {
      detail: this.question[questionFields.POSITION]
    });
    this.dispatchEvent(deleteEvent);
  }

  editQuestion() {
    const editEvent = new CustomEvent("edit", {
      detail: this.question[questionFields.POSITION]
    });
    this.dispatchEvent(editEvent);
  }

  addOptionalQuestion() {
    const addOptionalEvent = new CustomEvent("addoptional", {
      detail: this.question[questionFields.POSITION]
    });
    this.dispatchEvent(addOptionalEvent);
  }

  addOptionalQuestionClick() {
    if(!this.question.Editable) {
      this.addOptionalQuestion();
      return;
    }
    
    this.originalMessage = this.MESSAGE_ADD;
    this.message = label.add_optional_full_confirm_message;
    this.isDialogVisible = true;
  }

  handleCongirmationPopupClick(event) {
    if(event.detail.originalMessage === this.MESSAGE_ADD) {
      if(event.detail.status === this.STATUS_CONFIRM) {
        this.addOptionalQuestion();
      }
    } else if(event.detail.originalMessage === this.MESSAGE_DELETE) {
      if(event.detail.status === this.STATUS_CONFIRM) {
        this.deleteQuestion();
      }
    }
    this.message = this.EMPTY_STRING;
    this.originalMessage = this.EMPTY_STRING;
    this.isDialogVisible = false;
  }
  
  downQuestion() {
    const downEvent = new CustomEvent("down", {
      detail: this.question[questionFields.POSITION]
    });
    this.dispatchEvent(downEvent);
  }

  upQuestion() {
    const upEvent = new CustomEvent("up", {
      detail: this.question[questionFields.POSITION]
    });
    this.dispatchEvent(upEvent);
  }
}