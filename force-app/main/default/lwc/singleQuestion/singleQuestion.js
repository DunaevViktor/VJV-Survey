import { LightningElement, api } from "lwc";

export default class SingleQuestion extends LightningElement {
  @api question;

  @api validate() {
      if(this.question.IsVisible__c){
        let inputComponent = this.template.querySelector(".validate-input");
        inputComponent.reportValidity();
        return inputComponent.checkValidity();
      }
      
      return true;
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