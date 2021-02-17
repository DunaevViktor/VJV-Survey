import {questionTypes, operatorTypes} from "c/formUtil";
import { label } from "./labels.js";
import { validationFields, questionFields, optionFields } from "c/fieldService";

const EMPTY_STRING = '';

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
    firstQuestion[questionFields.TYPE].toLowerCase() ===
      questionTypes.PICKLIST.toLowerCase() ||
    firstQuestion[questionFields.TYPE].toLowerCase() ===
      questionTypes.RADIOBUTTON.toLowerCase() ||
    firstQuestion[questionFields.TYPE].toLowerCase() ===
      questionTypes.CHECKBOX.toLowerCase() ||
    (selectedOperator &&
      selectedOperator
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase()))
  );
}

const resolveOperatorsByQuestionType = (operators, question) => {
  let resolvedOperators = [...operators];

  if (question[questionFields.REQUIRED]) {
    resolvedOperators = resolvedOperators.filter((item) => {
      return !item.label
        .toLowerCase()
        .includes(operatorTypes.NULL.toLowerCase());
    });
  }

  for (let i = 0; i < typesDescription.length; i++) {
    const questionType = typesDescription[i];

    if (question[questionFields.TYPE] !== questionType.label) {
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
  return !selectedType.toLowerCase().localeCompare(questionTypes.CHECKBOX.toLowerCase()) ||
         !selectedType.toLowerCase().localeCompare(questionTypes.RADIOBUTTON.toLowerCase()) ||
         !selectedType.toLowerCase().localeCompare(questionTypes.PICKLIST.toLowerCase());
}

const filterOptionsByValue = (options, value) => {
  return options.filter(
    (option) => {
      return !option[optionFields.VALUE].localeCompare(value);
    }
  );
}

const filterOptionsByValueAndIndex = (options, value, editiIndex) => {
  return options.filter(
    (option, index) => {
      return !option[optionFields.VALUE].localeCompare(value) && index !== editiIndex;
    }
  );
}

const findOptionIndexByValue = (options, value) => {
  let idx;

  options.forEach((option, index) => {
    if(!option[optionFields.VALUE].localeCompare(value)) {
      idx = index;
    }
  });

  return idx;
}

const deleteFromOptions = (options, selectedValue) => {
  return options.filter(
    (option) => {
      return option[optionFields.VALUE].localeCompare(selectedValue);
    }
  );
}

const clearInput = (input) => {
  input.setCustomValidity(EMPTY_STRING);
  input.reportValidity();
  input.value = EMPTY_STRING;
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
  return  `${label.visible_if} '${validation[validationFields.RELATED][questionFields.LABEL]}' ` + 
  `${validation[validationFields.OPERATOR].toLowerCase()} ${validation[validationFields.VALUE]}`;
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