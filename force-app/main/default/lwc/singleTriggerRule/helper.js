const booleanPicklistOptions = [
  {
    label: "TRUE",
    value: true
  },
  {
    label: "FALSE",
    value: false
  }
];

const createPicklistOption = (label, value, datatype) => {
  let objectForPicklist = {
    label: label,
    value: value,
    datatype: datatype
  };

  return objectForPicklist;
};

const retrieveObjectApiName = (fieldName) => {
  let objectApiName = fieldName.replace("Id", "");
  return objectApiName;
};

const getFieldAttributes = (field, picklistOptions) => {
  let fieldObject = {};
  switch (field.datatype) {
    case "PICKLIST":
      fieldObject.isCombobox = true;
      fieldObject.type = "picklist";
      console.log("picklist values");
      console.log(picklistOptions);
      fieldObject.picklistValues = picklistOptions;
      fieldObject.isInput = false;
      break;
    case "phone":
      fieldObject.isInput = true;
      fieldObject.pattern = "[0-9]+";
      break;
    case "EMAIL":
      fieldObject.isInput = true;
      fieldObject.type = "email";
      break;
    case "currency":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.formatter = "currency";
      fieldObject.step = "0.5";
      break;
    case "DATETIME":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      break;
    case "BOOLEAN":
      fieldObject.isCombobox = true;
      fieldObject.type = "boolean";
      fieldObject.picklistValues = booleanPicklistOptions;
      fieldObject.isInput = false;
      break;
    case "int":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.min = "0";
      fieldObject.max = "99999999999999";
      fieldObject.step = "1";
      break;
    case "string":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
    case "textarea":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
    case "REFERENCE":
      fieldObject.isLookup = true;
      fieldObject.type = "REFERENCE";
      fieldObject.objectApiName = retrieveObjectApiName(field.value);
      break;
    default:
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
  }
  fieldObject.name = field.name;
  fieldObject.label = field.label;
  field.dataMyId = field.name;
  return fieldObject;
};

export { createPicklistOption, getFieldAttributes };
