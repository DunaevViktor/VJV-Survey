/* eslint-disable */
import { LightningElement, track, api } from "lwc";
import { importedLabels } from "./labels";
import findRecords from "@salesforce/apex/LookupController.findRecords";

export default class LwcLookup extends LightningElement {

  labels = importedLabels;

  @track recordsList;
  @track searchKey = "";
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
      this.searchKey = "";
      this.message = null;
      this.recordsList = null;
    }, 300);
  }

  onRecordSelection(event) {
    this._selectedRecordId = event.target.dataset.key;
    this._selectedValue = event.target.dataset.name;
    this.searchKey = "";
    this.onSeletedRecordUpdate();
  }

  handleKeyChange(event) {
    const searchKey = event.target.value;
    this.searchKey = searchKey;
    this.getLookupResult();
  }

  removeRecordOnLookup() {
    this.searchKey = "";
    this._selectedValue = null;
    this._selectedRecordId = null;
    this.recordsList = null;
    this.onSeletedRecordUpdate();
  }

  getLookupResult() {
    findRecords({
      searchKey: this.searchKey,
      objectsApiNames: this.objectsApiNames
    })
      .then((result) => {
        if (result.length === 0) {
          this.recordsList = [];
          this.message = this.labels.no_records_found;
        } else {
          this.recordsList = result;
          this.message = "";
        }
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.recordsList = undefined;
      });
  }

  onSeletedRecordUpdate() {
    const detailObject = {
        selectedRecordId: this._selectedRecordId,
        selectedValue: this._selectedValue
    }    
    const recordSelectionEvent = new CustomEvent("recordselection", {
      detail: detailObject
    });
    this.dispatchEvent(recordSelectionEvent);
  }
}