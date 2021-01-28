import { label } from "./labels.js";

const TYPE_TEXT = "text"

const columns = [
    { label: label.type, fieldName: "Type__c", type: TYPE_TEXT },
    { label: "Name", fieldName: "Name", type: TYPE_TEXT },
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
    { label: "Type", fieldName: "Type", type: TYPE_TEXT },
    { label: "Name", fieldName: "Name", type: TYPE_TEXT },
    {
        type: "button",
        initialWidth: 100,
        typeAttributes: {
            label: "Add",
            name: "add"
        }
    }
];

const isReceiverExist = (receivers, value) => {
    return receivers.find((receiver) => {
        return receiver.Value__c.localeCompare(value) === 0
    });
};

export { columns, columnsMember, isReceiverExist };