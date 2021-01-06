const questionTypes = {
  PICKLIST: "Picklist",
  RADIOBUTTON: "RadioButton",
  TEXT: "Text",
  CHECKBOX: "Checkbox",
  RATING: "Rating"
};

const operatorTypes = {
  NULL: "NULL",
  CONTAINS: "CONTAINS",
  LESS_THAN: "LESS THAN",
  GREATER_THAN: "GREATER THAN",
  EQUALS: "EQUALS"
};

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

export { questionTypes, operatorTypes, typesDescription };
