/* eslint-disable */
import { LightningElement, track, api } from "lwc";
import { importedLabels } from "./labels";
import findRecords from "@salesforce/apex/LookupController.findRecords";

export default class LwcLookup extends LightningElement {
  ZERO = 0;
  EMPTY_STRING = '';
  DELAY = 300;

  labels = importedLabels;

  @track recordsList;
  @track searchKey = this.EMPTY_STRING;
  @api selectedValue;
  @track _selectedValue;
  @api selectedRecordId;
  @track _selectedRecordId;
  @api objectsApiNames;
  @api iconName;
  @api lookupLabel;
  @track message;

  connectedCallback() {
    this._selectedRecordId = this.selectedRecordId;
    this._selectedValue = this.selectedValue;
  }

  onLeave() {
    setTimeout(() => {
      this.searchKey = this.EMPTY_STRING;
      this.message = null;
      this.recordsList = null;
    }, this.DELAY);
  }

  onRecordSelection(event) {
    this._selectedRecordId = event.target.dataset.key;
    this._selectedValue = event.target.dataset.name;
    this.searchKey = this.EMPTY_STRING;
    this.onSeletedRecordUpdate();
  }

  handleKeyChange(event) {
    const searchKey = event.target.value;
    this.searchKey = searchKey;
    this.getLookupResult();
  }

  removeRecordOnLookup() {
    this.searchKey = this.EMPTY_STRING;
    this._selectedValue = this.EMPTY_STRING;
    this._selectedRecordId = this.EMPTY_STRING;
    this.recordsList = null;
    this.onSeletedRecordUpdate();
  }

  getLookupResult() {
    findRecords({
      searchKey: this.searchKey,
      objectsApiNames: this.objectsApiNames
    })
      .then((result) => {
        if (result.length === this.ZERO) {
          this.recordsList = [];
          this.message = this.labels.no_records_found;
        } else {
          this.recordsList = result;
          this.message = this.EMPTY_STRING;
        }
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.recordsList = undefined;
      });
  }

  onSeletedRecordUpdate() {
    let detailObject = {
        selectedRecordId: this._selectedRecordId,
        selectedValue: this._selectedValue
    }   
    if(!this._selectedRecordId || !this._selectedValue) {
      detailObject = this.EMPTY_STRING;
    } 
    const recordSelectionEvent = new CustomEvent("recordselection", {
      detail: detailObject
    });
    this.dispatchEvent(recordSelectionEvent);
  }
}