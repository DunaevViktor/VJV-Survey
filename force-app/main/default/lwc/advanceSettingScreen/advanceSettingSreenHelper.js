import type from "@salesforce/label/c.type";
import group_name_or_email from "@salesforce/label/c.group_name_or_email";
import delete_button from "@salesforce/label/c.delete";

const columns = [
  { label: type, fieldName: "Type__c", type: "text" },
  { label: group_name_or_email, fieldName: "Value__c", type: "text" },
  {
    type: "button",
    initialWidth: 100,
    typeAttributes: {
      label: delete_button,
      name: "delete"
    }
  }
];

const findInReceivers = (receivers, receiver) => {
  return receivers.find((tempReceiver) => {
    return receiver.Value__c.localeCompare(tempReceiver.Value__c) === 0
  })
}

export {
  columns,
  findInReceivers
}