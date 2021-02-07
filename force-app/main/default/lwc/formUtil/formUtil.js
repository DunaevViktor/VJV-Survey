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
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT EQUALS"
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

const findQuestionByPosition = (questions, position) => {
  return questions.filter((question) => {
    return question.Position__c === position;
  })[0];
}

export { 
  questionTypes, 
  operatorTypes, 
  booleanPicklistOptions,
  findQuestionByPosition
};