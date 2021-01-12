import { LightningElement, track, api } from "lwc";
import { importedLabels } from "./labels";

export default class LwcLookup extends LightningElement {

  labels = importedLabels;

  @track recordsList;
  @track searchKey = "";
  @api selectedValue;
  @api selectedRecordId;
  @api objectsApiNames;
  @api iconName;
  @api lookupLabel;
  @track message;

  onRecordSelection(event) {
    this.selectedRecordId = event.target.dataset.key;
    this.selectedValue = event.target.dataset.name;
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
    this.selectedValue = null;
    this.selectedRecordId = null;
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
    const passEventr = new CustomEvent("recordselection", {
      detail: {
        selectedRecordId: this.selectedRecordId,
        selectedValue: this.selectedValue
      }
    });
    this.dispatchEvent(passEventr);
  }
}
