import { LightningElement, api } from 'lwc';

export default class SingleQuestion extends LightningElement {

    @api question;

    handleAnswerChange(event){
        const changedQuestionId = event.target.dataset.item;
        const inputChangedValue = event.target.value;

        const answerChangeEvent = new CustomEvent("answerchange", {
            detail:{
                questionId: changedQuestionId,
                answer: inputChangedValue
            }
        });

        this.dispatchEvent(answerChangeEvent);
    }
}