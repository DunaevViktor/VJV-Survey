import findRecords from "@salesforce/apex/LookupController.findRecords";
import select_an_option from "@salesforce/label/c.select_an_option";
import remove_selected_option from "@salesforce/label/c.remove_selected_option";
import search from "@salesforce/label/c.search";
import no_records_found from "@salesforce/label/c.no_records_found";

const importedLabels = {
    findRecords,
    select_an_option,
    remove_selected_option,
    search,
    no_records_found
}

export {
    importedLabels
}