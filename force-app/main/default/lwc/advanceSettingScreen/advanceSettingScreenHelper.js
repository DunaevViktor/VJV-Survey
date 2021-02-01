import { label } from "./labels.js";

const TYPE_TEXT = "text";
const FIELD_NAME = "Name";
const FIELD_STANDARD_TYPE = "Type";
const FIELD_CUSTOM_TYPE = "Type__c";

const columns = [
    { label: label.type, fieldName: FIELD_CUSTOM_TYPE, type: TYPE_TEXT },
    { label: label.Name, fieldName: FIELD_NAME, type: TYPE_TEXT },
    {
        type: "button",
        initialWidth: 100,
        typeAttributes: {
            label: label.delete_button,
            name: "delete"
        }
    }
];

const columnsMember = [
    { label: label.type, fieldName: FIELD_STANDARD_TYPE, type: TYPE_TEXT },
    { label: label.Name, fieldName: FIELD_NAME, type: TYPE_TEXT },
    {
        type: "button",
        initialWidth: 100,
        typeAttributes: {
            label: label.add,
            name: "add"
        }
    }
];

const isReceiverExist = (receivers, value) => {
    return receivers.find((receiver) => {
        return receiver.Value__c.localeCompare(value) === 0
    });
};

const deleteReceiver = (receiverList, filterValue) => {
    return receiverList.filter((receiver) => {
        return receiver.Value__c !== filterValue;
    });
}

export { columns, columnsMember, isReceiverExist, deleteReceiver};