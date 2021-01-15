import { LightningElement, api, track } from 'lwc';
import { stepsOfSave } from './constants';

export default class SaverScreen extends LightningElement {

  @api survey;
  @api triggerRules;
  @api questions;
  @api validations;

  @track
  stepsOfSave = stepsOfSave;

  get isComplete() {
    return this.stepsOfSave.reduce((accumulator, currentValue) => {
      return accumulator && currentValue.isDone;
    }, true);
  }
}