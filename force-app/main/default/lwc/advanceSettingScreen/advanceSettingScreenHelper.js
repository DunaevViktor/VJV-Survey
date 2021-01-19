import { label } from "./labels.js";

const columns = [
  { label: label.type, fieldName: "Type__c", type: "text" },
  { label: label.group_name_or_email, fieldName: "Value__c", type: "text" },
  {
    type: "button",
    initialWidth: 100,
    typeAttributes: {
      label: label.delete_button,
      name: "delete"
    }
  }
];

const isReceiverExist = (receiver, data) => {
  return data.find((tempReceiver, index) => {
    if (receiver.Value__c.localeCompare(tempReceiver.Value__c) === 0)
      return true;
  });
};

export { columns, isReceiverExist };
