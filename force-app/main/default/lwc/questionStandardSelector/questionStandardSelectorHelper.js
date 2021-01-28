import {label} from "./labels.js";

const columns = [
  { label: label.question, fieldName: 'Label__c' },
  { label: label.type, fieldName: 'Type__c'},
  { label: label.options, fieldName: 'Question_Options__r'},
  {
      type: 'button',
      initialWidth: 100,
      typeAttributes: {
          label: label.select,
          name: 'select'
      }
  },
];

const reduceOptionsToString = (options) => {
  return options.reduce((accumulator, currentItem, index) => {
    accumulator += currentItem.Value__c;
          
    if(index !== options.length - 1) {
     accumulator += ", ";
    }

    return accumulator;
    }, 
  "");
};

const transformStandardQuestions = (standardQuestions) => {
  return standardQuestions.map((standardQuestion) => {
    const displayedQuestion = {
      Id: standardQuestion.Id,
      Label__c: standardQuestion.Label__c,
      Type__c: standardQuestion.Type__c
    };
  
    if(!standardQuestion.Question_Options__r || standardQuestion.Question_Options__r.length === 0) {
      displayedQuestion.Question_Options__r  = label.none;
    } else {
      displayedQuestion.Question_Options__r = reduceOptionsToString(standardQuestion.Question_Options__r);
    }
  
    return displayedQuestion;
  });
}

export {
  columns,
  transformStandardQuestions
}