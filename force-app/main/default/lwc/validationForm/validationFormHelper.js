import {questionTypes, operatorTypes} from "c/formUtil";

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

const transformOperators = (operators) => {
  return operators.map((item) => {
    return {
      label: item.label,
      value: item.value
    };
  });
}

const resolveOperatorsByQuestionType = (operators, question) => {
  let resolvedOperators = [...operators];

  if (question.Required__c) {
    resolvedOperators = resolvedOperators.filter((item) => {
      return !item.label
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase());
    });
  }

  for (let i = 0; i < typesDescription.length; i++) {
    const questionType = typesDescription[i];

    if (question.Type__c !== questionType.label) {
      continue;
    }

    resolvedOperators = resolvedOperators.filter((item) => {
      return questionType.deprecatedOperators.reduce(
        (accumulator, deprecatedOperator) => {
          return (
            accumulator &&
            !item.label
              .toLowerCase()
              .includes(deprecatedOperator.toLowerCase())
          );
        },
        true
      );
    });
  }

  return resolvedOperators;
}

const isNeedPicklist = (firstQuestion, selectedOperator) => {
  return (
    firstQuestion.Type__c.toLowerCase() ===
      questionTypes.PICKLIST.toLowerCase() ||
    firstQuestion.Type__c.toLowerCase() ===
      questionTypes.RADIOBUTTON.toLowerCase() ||
    firstQuestion.Type__c.toLowerCase() ===
      questionTypes.CHECKBOX.toLowerCase() ||
    (selectedOperator &&
      selectedOperator
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase()))
  );
}

export {
  typesDescription,
  transformOperators,
  resolveOperatorsByQuestionType,
  isNeedPicklist
}