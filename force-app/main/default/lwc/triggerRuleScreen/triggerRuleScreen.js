import { api, LightningElement, track } from 'lwc';
import {FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent} from 'lightning/flowSupport';


export default class TriggerRuleScreen extends LightningElement {
    @track _triggerRules = [];

    
    get triggerRules() {
        return this._triggerRules;
    }

    @api
    set triggerRules(value) {
        this._triggerRules = value;
    }

    handleNavigateNext(event) {
        this._triggerRules = event.detail.triggerRules;        
        const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);
    }

    handleNavigatePrev(event) {
        this._triggerRules = event.detail.triggerRules;
        const backNavigationEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(backNavigationEvent);
    }

    fireAttributeChangeEvent() {
        const attributeChangeEvent = new FlowAttributeChangeEvent('triggerRules', this._triggerRules);
        this.dispatchEvent(attributeChangeEvent);
    }
}