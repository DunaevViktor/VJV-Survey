import trueLabel from "@salesforce/label/c.true";
import falseLabel from "@salesforce/label/c.false";

const questionTypes = {
  PICKLIST: "Picklist",
  RADIOBUTTON: "RadioButton",
  TEXT: "Text",
  CHECKBOX: "Checkbox",
  RATING: "Rating"
};

const operatorTypes = {
  NULL: "IS NULL",
  CONTAINS: "CONTAINS",
  NOT_CONTAINS : "NOT CONTAINS",
  LESS_THAN: "LESS THAN",
  GREATER_THAN: "GREATER THAN",
  EQUALS: "EQUALS"
};

const booleanPicklistOptions = [
  {
    label: trueLabel,
    value: "TRUE"
  },
  {
    label: falseLabel,
    value: "FALSE"
  }
];

const typesDescription = [
  {
    label: questionTypes.PICKLIST,
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  },
  {
    label: questionTypes.RADIOBUTTON,
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  },
  {
    label: questionTypes.TEXT,
    deprecatedOperators: [
      operatorTypes.EQUALS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  },
  {
    label: questionTypes.CHECKBOX,
    deprecatedOperators: [
      operatorTypes.EQUALS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN
    ]
  },
  {
    label: questionTypes.RATING,
    deprecatedOperators: [operatorTypes.CONTAINS]
  }
];

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
  questionTypes, 
  operatorTypes, 
  typesDescription,
  booleanPicklistOptions,
  generateFieldOptions
};