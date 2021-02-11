import { LightningElement, api, track } from "lwc";

export default class SingleQuestion extends LightningElement {
  @api singleQuestion;
  @track modifiedLabel = false;

  @api validate() {
      if(this.question.IsVisible__c){
        let inputComponent = this.template.querySelector(".validate-input");
        if(this.question.isText && this.question.Required__c){
            let trimmedInput = inputComponent.value.trim();
            inputComponent.value = trimmedInput;
        }
        inputComponent.reportValidity();
        return inputComponent.checkValidity();
      }
      
      return true;
  }

  get question(){
      return JSON.parse(JSON.stringify(this.singleQuestion))
  }

  connectedCallback(){
      if(this.question.isCheckbox || this.question.isRadioButton){
          this.modifiedLabel = true;
      }
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