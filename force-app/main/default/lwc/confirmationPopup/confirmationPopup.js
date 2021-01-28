import {LightningElement, api} from 'lwc';

export default class ConfirmationDialog extends LightningElement {
    @api visible;
    @api title; 
    @api name;
    @api message;
    @api confirmLabel;
    @api cancelLabel;
    @api originalMessage;

    handleClick(event){
        let finalEvent = {
            originalMessage: this.originalMessage,
            status: event.target.name
        };
        this.dispatchEvent(new CustomEvent('popupclick', {detail: finalEvent}));
    }
}