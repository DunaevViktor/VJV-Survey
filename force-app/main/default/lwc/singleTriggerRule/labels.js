import deleteLabel from "@salesforce/label/c.delete";
import deleteTitle from "@salesforce/label/c.delete_trigger_rule";
import operatorLabel from "@salesforce/label/c.operator";
import fieldLabel from "@salesforce/label/c.field";
import objectLabel from "@salesforce/label/c.object";
import errorMessage from "@salesforce/label/c.errorMessage";

const importedLabels = {
    deleteLabel,
    deleteTitle,
    operatorLabel,
    fieldLabel,
    objectLabel,
    errorMessage
}

export {
    importedLabels
}