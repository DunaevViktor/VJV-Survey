import {questionTypes, operatorTypes} from "c/formUtil";
import { label } from "./labels.js";

const typesDescription = [
  {
    label: questionTypes.PICKLIST,
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN,
      operatorTypes.ANY_CHANGE
    ]
  },
  {
    label: questionTypes.RADIOBUTTON,
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN,
      operatorTypes.ANY_CHANGE
    ]
  },
  {
    label: questionTypes.TEXT,
    deprecatedOperators: [
      operatorTypes.EQUALS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN,
      operatorTypes.ANY_CHANGE
    ]
  },
  {
    label: questionTypes.CHECKBOX,
    deprecatedOperators: [
      operatorTypes.EQUALS,
      operatorTypes.GREATER_THAN,
      operatorTypes.LESS_THAN,
      operatorTypes.ANY_CHANGE
    ]
  },
  {
    label: questionTypes.RATING,
    deprecatedOperators: [
      operatorTypes.CONTAINS,
      operatorTypes.ANY_CHANGE
    ]
  }
];

const transformQuestionTypes = (types) => {
  return types.values.map((item) => {
    return {
      label: item.label,
      value: item.value
    };
  });
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

const isOptionEnabling = (selectedType) => {
  return selectedType.toLowerCase().localeCompare(questionTypes.CHECKBOX.toLowerCase()) === 0 ||
         selectedType.toLowerCase().localeCompare(questionTypes.RADIOBUTTON.toLowerCase()) === 0 ||
         selectedType.toLowerCase().localeCompare(questionTypes.PICKLIST.toLowerCase()) === 0;
}

const filterOptionsByValue = (options, value) => {
  return options.filter(
    (option) => {
      return option.Value__c.localeCompare(value) === 0;
    }
  );
}

const filterOptionsByValueAndIndex = (options, value, editiIndex) => {
  return options.filter(
    (option, index) => {
      return option.Value__c.localeCompare(value) === 0 && index !== editiIndex;
    }
  );
}

const findOptionIndexByValue = (options, value) => {
  let idx;

  options.forEach((option, index) => {
    if(option.Value__c.localeCompare(value) === 0) {
      idx = index;
    }
  });

  return idx;
}

const deleteFromOptions = (options, selectedValue) => {
  return options.filter(
    (option) => {
      return option.Value__c.localeCompare(selectedValue) !== 0;
    }
  );
}

const clearInput = (input) => {
  input.setCustomValidity("");
  input.reportValidity();
  input.value = "";
  input.blur();
}

const setInputValidity = (input, message) => {
  input.setCustomValidity(message);
  input.reportValidity();
}

const transformOperators = (operators) => {
  return operators.map((item) => {
    return {
      label: item.label,
      value: item.value
    };
  });
}

const buildVisibilityMessage = (validation) => {
  return  label.visible_if + " '" + validation.Related_Question__c.Label__c 
    + "' " + validation.Operator__c.toLowerCase() + " " + validation.Value__c;
}

export {
  transformQuestionTypes,
  isOptionEnabling,
  filterOptionsByValue,
  filterOptionsByValueAndIndex,
  findOptionIndexByValue,
  deleteFromOptions,
  clearInput,
  setInputValidity,
  transformOperators,
  isNeedPicklist,
  resolveOperatorsByQuestionType,
  buildVisibilityMessage
}