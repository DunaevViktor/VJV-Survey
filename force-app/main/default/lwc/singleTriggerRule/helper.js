import {
  operatorTypes,
  booleanPicklistOptions
} from "c/formUtil";

const INTEGER_MIN = "0";
const INTEGER_MAX = "99999999999999";
const INTEGER_STEP = "1";
const DOUBLE_MIN = "0.0";
const DOUBLE_MAX = "99999999999999.0";
const DOUBLE_STEP = "0.01";
const CURRENCY_MIN = "0.0";
const CURRENCY_MAX = "99999999999999.0";
const CURRENCY_STEP = "0.1";

const fieldTypes = {
  PICKLIST : "PICKLIST",
  ID : "ID",
  PHONE : "PHONE",
  EMAIL : "EMAIL",
  CURRENCY : "CURRENCY",
  DATETIME : "DATETIME",
  DATE : "DATE",
  URL : "URL",
  BOOLEAN : "BOOLEAN",
  INTEGER : "INTEGER",
  DOUBLE : "DOUBLE",
  STRING : "STRING",
  ADDRESS : "ADDRESS",
  TEXTAREA : "TEXTAREA",
  REFERENCE : "REFERENCE",
}

const operatorGroups = {
  GENERAL_TYPES : "GENERAL",
  COMPARABLE_VALUES : "COMPARABLE",
  STRING_VALUES : "STRING"
}

const inputTypes = {
  TEXT : "text",
  NUMBER : "number",
  DATETIME : "datetime",
  DATE : "date",
  EMAIL : "email",
  URL : "url",
  PHONE : "tel",
}

const operatorsGroupDescription = {
  [operatorGroups.GENERAL_TYPES] : {
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.NOT_CONTAINS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  },
  [operatorGroups.COMPARABLE_VALUES] : {
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.NOT_CONTAINS,
    ]
  },
  [operatorGroups.STRING_VALUES] : {
    deprecatedOperators: [
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  }
}

const fieldDescription = {
  [fieldTypes.PICKLIST] : {
    isCombobox : true,
    operatorType : operatorGroups.GENERAL_TYPES 
  },
  [fieldTypes.ID] : {
    isInput : true,
    type : inputTypes.TEXT,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.PHONE] : {
    isInput : true,
    pattern : "[0-9]+",
    type : inputTypes.PHONE,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.EMAIL] : {
    isInput : true,
    type : inputTypes.EMAIL,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.CURRENCY] : {
    isInput : true,
    type : inputTypes.NUMBER,
    min : CURRENCY_MIN,
    max : CURRENCY_MAX,
    step : CURRENCY_STEP,
    operatorType : operatorGroups.COMPARABLE_VALUES
  },
  [fieldTypes.DATETIME] : {
    isInput : true,
    type : inputTypes.DATETIME,
    operatorType : operatorGroups.COMPARABLE_VALUES
  },
  [fieldTypes.DATE] : {
    isInput : true,
    type : inputTypes.DATE,
    operatorType : operatorGroups.COMPARABLE_VALUES
  },
  [fieldTypes.URL] : {
    isInput : true,
    type : inputTypes.URL,
    operatorType : operatorGroups.GENERAL_TYPES 
  },
  [fieldTypes.BOOLEAN] : {
    isCombobox : true,
    operatorType : operatorGroups.GENERAL_TYPES
  },
  [fieldTypes.INTEGER] : {
    isInput : true,
    type : inputTypes.NUMBER,
    min : INTEGER_MIN,
    max : INTEGER_MAX,
    step : INTEGER_STEP,
    operatorType : operatorGroups.COMPARABLE_VALUES
  },
  [fieldTypes.DOUBLE] : {
    isInput : true,
    type : inputTypes.NUMBER,
    min : DOUBLE_MIN,
    max : DOUBLE_MAX,
    step : DOUBLE_STEP,
    operatorType : operatorGroups.COMPARABLE_VALUES
  },
  [fieldTypes.STRING] : {
    isInput : true,
    type : inputTypes.TEXT,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.ADDRESS] : {
    isInput : true,
    type : inputTypes.TEXT,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.TEXTAREA] : {
    isInput : true,
    type : inputTypes.TEXT,
    operatorType : operatorGroups.STRING_VALUES
  },
  [fieldTypes.REFERENCE] : {
    isLookup: true,
    type : fieldTypes.REFERENCE,
    operatorType : operatorGroups.GENERAL_TYPES
  },
};

const getFieldOperatorType = (field) => {
  return fieldDescription[field.datatype].operatorType;
}

const getFieldAttributes = (field, picklistOptions, settedValue) => {

  const fieldObject = fieldDescription[field.datatype];
  fieldObject.picklistValues = picklistOptions;
  fieldObject.value = settedValue;
  fieldObject.label = field.label;

  if(fieldTypes.REFERENCE === field.datatype) {
    fieldObject.objectsApiNames = field.referencedObjects;
    const value = JSON.parse(JSON.stringify(settedValue));
    fieldObject.value = value.selectedRecordId;
    fieldObject.name = value.selectedValue;    
  }

  return fieldObject;
};

const generateBooleanField = (fieldName, settedValue) => {
  const fieldObject = getFieldAttributes({datatype : fieldTypes.BOOLEAN}, booleanPicklistOptions, settedValue);
  fieldObject.label = fieldName;
  return fieldObject;
};

const filterOperatorList = (fullOperatorList, operatorType) => {
  if(!operatorType) return fullOperatorList;

  const deprecatedOperators = operatorsGroupDescription[operatorType].deprecatedOperators;

  const resolvedOperators = fullOperatorList.filter((item) => {
    return deprecatedOperators.reduce(
      (accumulator, deprecatedOperator) => {
        return (
          accumulator &&
          !item.value
            .toLowerCase()
            .includes(deprecatedOperator.toLowerCase())
        );
      },
      true
    );
  });

  return resolvedOperators;
};

const generateFieldOptions = (result) => {
  let fieldOptions = [];
  for (let key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      let comboboxObject = {
        label: result[key],
        value: key,
      };
      fieldOptions.push(comboboxObject);
    }
  }
  return fieldOptions;
};

export {
  getFieldAttributes,
  generateBooleanField,
  filterOperatorList,
  operatorGroups,
  generateFieldOptions,
  getFieldOperatorType
};