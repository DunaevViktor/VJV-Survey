import trueLabel from "@salesforce/label/c.true";
import falseLabel from "@salesforce/label/c.false";

const booleanPicklistOptions = [
  {
    label: trueLabel,
    value: "true",
  },
  {
    label: falseLabel,
    value: "false",
  },
];

const NULL = "IS NULL";
const GREATER_THAN = "GREATER THAN";
const LESS_THAN = "LESS THAN";
const CONTAINS = "CONTAINS";
const NOT_CONTAINS = "NOT CONTAINS";

const generateComboboxOptions = (result) => {
  let comboboxOptions = [];
  for (let key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      let comboboxObject = {
        label: result[key],
        value: key,
      };
      comboboxOptions.push(comboboxObject);
    }
  }
  return comboboxOptions;
};

const getFieldAttributes = (field, picklistOptions, settedValue) => {
  let fieldObject = {};
  switch (field.datatype) {
    case "PICKLIST":
      fieldObject.isCombobox = true;
      fieldObject.type = "picklist";
      fieldObject.picklistValues = picklistOptions;
      fieldObject.isInput = false;
      fieldObject.value = settedValue;
      fieldObject.operatorType = 1;
      break;
    case "ID":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
      break;
    case "PHONE":
      fieldObject.isInput = true;
      fieldObject.pattern = "[0-9]+";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
      break;
    case "EMAIL":
      fieldObject.isInput = true;
      fieldObject.type = "email";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
      break;
    case "CURRENCY":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.formatter = "currency";
      fieldObject.step = "0.5";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 2;
      break;
    case "DATETIME":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 2;
      break;
    case "DATE":
      fieldObject.isInput = true;
      fieldObject.type = "date";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 2;
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
      fieldObject.operatorType = 2;
      break;
    case "DOUBLE":
      fieldObject.isInput = true;
      fieldObject.type = "number";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 2;
      break;
    case "STRING":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
      break;
    case "ADDRESS":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
      break;
    case "TEXTAREA":
      fieldObject.isInput = true;
      fieldObject.type = "text";
      fieldObject.value = settedValue;
      fieldObject.operatorType = 3;
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

const checkForNullOperator = (chosenValue) => {
  if (chosenValue === NULL) {
    return true;
  }
  return false;
};

const generateComparisonOperatorList = (fullOperatorList) => {
  const comparisonOperatorList = fullOperatorList.filter(
    (operator) => operator.value !== CONTAINS && operator.value !== NOT_CONTAINS
  );
  return comparisonOperatorList;
};

const generateContaintmentOperatorList = (fullOperatorList) => {
  const containtmentOperatorList = fullOperatorList.filter(
    (operator) =>
      operator.value !== GREATER_THAN && operator.value !== LESS_THAN
  );
  return containtmentOperatorList;
};

const generateReducedOperatorList = (fullOperatorList) => {
  const reducedOperatorList = fullOperatorList.filter(
    (operator) =>
      operator.value !== CONTAINS &&
      operator.value !== NOT_CONTAINS &&
      operator.value !== GREATER_THAN &&
      operator.value !== LESS_THAN
  );
  return reducedOperatorList;
};

const getBooleanPicklistOptions = () => {
  return booleanPicklistOptions;
};

const generateFieldsDescriptionsList = (result) => {
  let comboboxFieldsOptions = [];
  result.forEach((fieldDescriptionList) => {
    let fieldObject = {
      label: fieldDescriptionList[1],
      value: fieldDescriptionList[0],
      datatype: fieldDescriptionList[2],
    };
    setReferencedObjectNames(fieldDescriptionList, fieldObject);
    comboboxFieldsOptions.push(fieldObject);
  });
  return comboboxFieldsOptions;
};

export {
  generateComboboxOptions,
  getFieldAttributes,
  setReferencedObjectNames,
  generateBooleanField,
  checkForNullOperator,
  generateComparisonOperatorList,
  getBooleanPicklistOptions,
  generateFieldsDescriptionsList,
  generateContaintmentOperatorList,
  generateReducedOperatorList,
};
