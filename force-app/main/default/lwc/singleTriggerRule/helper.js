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
      fieldObject.value = settedValue;
      break;
    case "CURRENCY":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.formatter = "currency";
      fieldObject.step = "0.5";
      fieldObject.value = settedValue;
      break;
    case "DATETIME":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      break;
    case "DATE":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      break;
    case "URL":
      fieldObject.isInput = true;
      fieldObject.type = "url";
      fieldObject.value = settedValue;
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
      fieldObject.value = settedValue;
      break;
    case "DOUBLE":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.value = settedValue;
      break;
    case "STRING":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      break;
    case "ADDRESS":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      break;
    case "TEXTAREA":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      break;
    case "REFERENCE":
      fieldObject.isLookup = true;
      fieldObject.type = "REFERENCE";
      let value = JSON.parse(JSON.stringify(settedValue));
      console.log("val");
      console.log(value);
      fieldObject.objectsApiNames = field.referencedObjects;
      fieldObject.value = value.selectedRecordId;
      fieldObject.name = value.selectedValue;
      break;
    default:
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      break;
  }
  fieldObject.label = field.label;
  field.dataMyId = field.name;
  console.log("ret obj");
  console.log(fieldObject);
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
