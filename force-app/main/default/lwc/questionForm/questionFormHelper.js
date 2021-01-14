import {questionTypes} from "c/formUtil";

const transformQuestionTypes = (types) => {
  return types.values.map((item) => {
    return {
      label: item.label,
      value: item.value
    };
  });
}

const isOptionEnabnling = (selectedType) => {
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

const updateOptionsValue = (options, oldValue, newValue) => {
  return options.map(
    (option) => {
      if (option.Value__c.localeCompare(oldValue) === 0) {
        option.Value__c = newValue;
      }
      return option;
    }
  );
}

const deleteFromOptions = (options, selectedValue) => {
  return options.filter(
    (option) => {
      return option.Value__c.localeCompare(selectedValue) !== 0;
    }
  );
}

const clearInput = (input) => {
  input.value = ".";
  input.focus();
  input.reportValidity();
}

export {
  transformQuestionTypes,
  isOptionEnabnling,
  filterOptionsByValue,
  updateOptionsValue,
  deleteFromOptions,
  clearInput
}