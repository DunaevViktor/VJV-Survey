import { LightningElement, api, track } from "lwc";
import { questionFields } from "c/fieldService";

export default class SingleQuestion extends LightningElement {
  @api singleQuestion;
  @track question;

  @api validate() {
      if(this.question[questionFields.VISIBLE]){
        let inputComponent = this.template.querySelector(".validate-input");
        inputComponent.reportValidity();
        return inputComponent.checkValidity();
      }
      
      return true;
  }

  connectedCallback() {
    this.question = JSON.parse(JSON.stringify(this.singleQuestion));
  }
  
  get questionId() {
    return this.question[questionFields.ID];
  }

  get questionLabel() {
    return this.question[questionFields.LABEL];
  }

  get questionRequired() {
    return this.question[questionFields.REQUIRED];
  }

  get questionVisible() {
    return this.question[questionFields.VISIBLE];
  }

  handleAnswerChange(event) {
    const changedQuestionId = event.target.dataset.item;
    const inputChangedValue = event.target.value;

    const answerChangeEvent = new CustomEvent("answerchange", {
      detail: {
        questionId: changedQuestionId,
        answer: inputChangedValue
      }
    });

    this.dispatchEvent(answerChangeEvent);
  }
}