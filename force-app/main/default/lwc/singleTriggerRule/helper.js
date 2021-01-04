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

const NULL = "NULL";
const NOT_NULL = "NOT NULL";
const GREATER_THAN = "GREATER THAN";
const LESS_THAN = "LESS THAN";

const generateComboboxOptions = (result) => {
  let comboboxOptions = [];
  result.forEach((objectLabel) => {
    let comboboxObject = {
      label: objectLabel,
      value: objectLabel
    };
    comboboxObjectOptions.push(comboboxObject);
  });
  return comboboxOptions;
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
      fieldObject.operatorType = 1;
      break;
    case "ID":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "PHONE":
      fieldObject.isInput = true;
      fieldObject.pattern = "[0-9]+";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "EMAIL":
      fieldObject.isInput = true;
      fieldObject.type = "email";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "CURRENCY":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.formatter = "currency";
      fieldObject.step = "0.5";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 0;
      break;
    case "DATETIME":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 0;
      break;
    case "DATE":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 0;
      break;
    case "URL":
      fieldObject.isInput = true;
      fieldObject.type = "url";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "BOOLEAN":
      fieldObject.isCombobox = true;
      fieldObject.type = "boolean";
      fieldObject.picklistValues = booleanPicklistOptions;
      fieldObject.value = settedValue;
      fieldObject.isInput = false;
      fieldObject.operatorType = 1;
      break;
    case "INTEGER":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.min = "0";
      fieldObject.max = "99999999999999";
      fieldObject.step = "1";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 0;
      break;
    case "DOUBLE":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 0;
      break;
    case "STRING":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "ADDRESS":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "TEXTAREA":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "REFERENCE":
      fieldObject.isLookup = true;
      fieldObject.type = "REFERENCE";
      fieldObject.objectsApiNames = field.referencedObjects;
      fieldObject.operatorType = 1;
      if (settedValue) {
        let value = JSON.parse(JSON.stringify(settedValue));
        fieldObject.value = value.selectedRecordId;
        fieldObject.name = value.selectedValue;
      }
      break;
    default:
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
  }
  fieldObject.label = field.label;
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

const generateBooleanField = (fieldName, settedValue) => {
  let fieldObject = {};
  fieldObject.isCombobox = true;
  fieldObject.type = "boolean";
  fieldObject.picklistValues = booleanPicklistOptions;
  fieldObject.value = settedValue;
  fieldObject.isInput = false;
  fieldObject.label = fieldName;
  return fieldObject;
};

const checkForNullOperators = (chosenValue) => {
  if (chosenValue === "NULL" || chosenValue === "NOT NULL") {
    return true;
  }
  return false;
};

const filterComparisonOperators = (fullOperatorList) => {
  const reducedOperatorList = fullOperatorList.filter(
    (operator) =>
      operator.value !== GREATER_THAN && operator.value !== LESS_THAN
  );
  return reducedOperatorList;
};

export {
  generateComboboxOptions,
  getFieldAttributes,
  setReferencedObjectNames,
  generateBooleanField,
  checkForNullOperators,
  filterComparisonOperators
};
