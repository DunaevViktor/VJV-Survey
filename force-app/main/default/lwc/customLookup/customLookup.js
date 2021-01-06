import { LightningElement, track, api } from "lwc";
import findRecords from "@salesforce/apex/LookupController.findRecords";
import select_an_option from "@salesforce/label/c.select_an_option";
import remove_selected_option from "@salesforce/label/c.remove_selected_option";
import search from "@salesforce/label/c.search";
import no_records_found from "@salesforce/label/c.no_records_found";

export default class LwcLookup extends LightningElement {

  labels = {
    select_an_option,
    remove_selected_option,
    search,
    no_records_found
  }

  @track recordsList;
  @track searchKey = "";
  @api selectedValue;
  @api selectedRecordId;
  @api objectsApiNames;
  @api iconName;
  @api lookupLabel;
  @track message;

  onLeave(event) {
    setTimeout(() => {
      this.searchKey = "";
      this.recordsList = null;
    }, 300);
  }

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

  removeRecordOnLookup(event) {
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
