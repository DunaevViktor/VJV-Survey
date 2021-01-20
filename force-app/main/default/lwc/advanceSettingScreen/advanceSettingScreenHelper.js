import { label } from "./labels.js";

const TYPE_EMAIL = "email";
const TYPE_GROUP = "groupName";
const TYPE_TEXT = "text"


const columns = [
  { label: label.type, fieldName: "Type__c", type: TYPE_TEXT },
  { label: label.group_name_or_email, fieldName: "Value__c", type: TYPE_TEXT },
  {
    type: "button",
    initialWidth: 100,
    typeAttributes: {
      label: label.delete_button,
      name: "delete"
    }
  }
];

const receiverOptions =  [
  { label: label.email, value: TYPE_EMAIL },
  { label: label.group_name, value: TYPE_GROUP }
];

const isReceiverExist = (receivers, value) => {
  return receivers.find((receiver) => {
    return receiver.Value__c.localeCompare(value) === 0
  });
};

export { columns, receiverOptions, isReceiverExist };
