import { LightningElement, track, api } from 'lwc';

export default class StarRatingInput extends LightningElement {

    @api question;

    @track selectedRate;
    @track rating = [];

    connectedCallback(){
        this.initRating();
    }

    initRating(){
        for (let i = 1; i <= 10; i++) {
            this.rating.push({rate: i, filled: false});   
        }
    }

    handleStarPick(event){
        const selectedRate = event.target.dataset.item;
        this.selectedRate = selectedRate === this.selectedRate ? undefined : selectedRate;

        this.rating.forEach(rate => {
            rate.filled = rate.rate <= this.selectedRate ? true : false;
        });
        
        event.preventDefault();
        const answerChangeEvent = new CustomEvent("answerchange", {
            bubbles: true, 
            composed: true,
            detail:{
                questionId: this.question.Id,
                answer: this.selectedRate
            }
        });

        this.dispatchEvent(answerChangeEvent);
    }
}