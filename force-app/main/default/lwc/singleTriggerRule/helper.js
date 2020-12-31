const booleanPicklistOptions = [
  {
    label: "TRUE",
    value: "true"
  },
  {
    label: "FALSE",
    value: "false"
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

const getFieldAttributes = (field, picklistOptions, settedValue) => {
  let fieldObject = {};
  switch (field.datatype) {
    case "PICKLIST":
      fieldObject.isCombobox = true;
      fieldObject.type = "picklist";
      console.log("picklist values");
      console.log(picklistOptions);
      fieldObject.picklistValues = picklistOptions;
      fieldObject.isInput = false;
      fieldObject.value = settedValue;
      break;
    case "ID":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      break;
    case "PHONE":
      fieldObject.isInput = true;
      fieldObject.pattern = "[0-9]+";
      fieldObject.value = settedValue;
      break;
    case "EMAIL":
      fieldObject.isInput = true;
      fieldObject.type = "email";
      break;
    case "CURRENCY":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.formatter = "currency";
      fieldObject.step = "0.5";
      break;
    case "DATETIME":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      break;
    case "DATE":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      break;
    case "URL":
      fieldObject.isInput = true;
      fieldObject.type = "url";
      break;
    case "BOOLEAN":
      fieldObject.isCombobox = true;
      fieldObject.type = "boolean";
      fieldObject.picklistValues = booleanPicklistOptions;
      fieldObject.value = settedValue;
      fieldObject.isInput = false;
      break;
    case "INTEGER":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.min = "0";
      fieldObject.max = "99999999999999";
      fieldObject.step = "1";
      break;
    case "DOUBLE":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      break;
    case "STRING":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
    case "ADDRESS":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
    case "TEXTAREA":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      break;
    case "REFERENCE":
      fieldObject.isLookup = true;
      fieldObject.type = "REFERENCE";
      fieldObject.objectsApiNames = field.referencedObjects;
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

const setReferencedObjectNames = (objectFieldsDescriptionList, fieldObject) => {
  if (fieldObject.datatype === "REFERENCE") {
    let referencedObjectsNames = [];
    for (let i = 3; i < objectFieldsDescriptionList.length; i++) {
      referencedObjectsNames.push(objectFieldsDescriptionList[i]);
    }
    fieldObject.referencedObjects = referencedObjectsNames;
  }
};

export { createPicklistOption, getFieldAttributes, setReferencedObjectNames };
