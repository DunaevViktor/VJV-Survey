import { operatorTypes, questionTypes } from "c/formUtil";
import { surveyObject, surveyFields, questionFields, optionFields, validationFields, answerFields } from "c/fieldService";
import { label } from "./labels.js";

const FIELDS = [
  surveyObject + "." + surveyFields.ID,
  surveyObject + "." + surveyFields.NAME,
  surveyObject + "." + surveyFields.DESCRIPTION,
  surveyObject + "." + surveyFields.LOGO,
  surveyObject + "." + surveyFields.BACKGROUND,
  surveyObject + "." + surveyFields.RELATED
];

const initQuestionFields = (questions, data) => {
  questions = [];
  data.forEach((question) => {
    questions.push({ 
      ...question, 
      Key: question[questionFields.ID]
    });
  });

  questions.forEach((question) => {
    let fieldType = "is" + question[questionFields.TYPE];
    question[fieldType] = true;
    let options = [];

    switch (question[questionFields.TYPE]) {
      case questionTypes.CHECKBOX:
        question.Answer = [];
        break;
      case questionTypes.PICKLIST:
        options = [{ label: `-- ${label.none} --`, value: null }];
        break;
      default:
    }

    if (question.Question_Options__r) {
      question.Question_Options__r.forEach((option) => {
        options.push({ label: option[optionFields.VALUE], value: option[optionFields.VALUE] });
      });

      question.Question_Options__r = options;
    }
  });

  return questions;
};

const sortQuestionsByPosition = (questions) => {
  questions.sort(function (a, b) {
    return a[questionFields.POSITION].localeCompare(b[questionFields.POSITION], undefined, {
      numeric: true,
      sensitivity: "base"
    });
  });
  return questions;
};

const compareValues = (answerValue, operator, validationValue) => {
  let isConditionMet;
  switch (operator) {
    case operatorTypes.NULL:
      isConditionMet =
        String(
          answerValue == null || answerValue === undefined || answerValue === ""
        ) === validationValue;
      break;
    case operatorTypes.EQUALS:
      // eslint-disable-next-line eqeqeq
      isConditionMet = answerValue == validationValue;
      break;
    case operatorTypes.NOT_EQUALS:
      isConditionMet = answerValue !== validationValue;
      break;
    case operatorTypes.CONTAINS:
      isConditionMet = answerValue.includes(validationValue);
      break;
    case operatorTypes.NOT_CONTAINS:
      isConditionMet = !answerValue.includes(validationValue);
      break;
    case operatorTypes.LESS_THAN:
      isConditionMet = parseFloat(answerValue) < parseFloat(validationValue);
      break;
    case operatorTypes.GREATER_THAN:
      isConditionMet = parseFloat(answerValue) > parseFloat(validationValue);
      break;
    default:
      isConditionMet = false;
  }

  return isConditionMet;
};

const hideAnswerChain = (questions, validation) => {
  const dependentQuestion = questions.findIndex(
    (question) => question[questionFields.ID] === validation[validationFields.DEPENDANT]
  );
  questions[dependentQuestion][questionFields.VISIBLE] = false;
  questions[dependentQuestion].Answer =
    questions[dependentQuestion][questionFields.TYPE] === questionTypes.CHECKBOX ? [] : null;
  if (questions[dependentQuestion].Related_Question_Validations__r != null) {
    questions[dependentQuestion].Related_Question_Validations__r.forEach(
      (nextValidation) => {
        hideAnswerChain(questions, nextValidation);
      }
    );
  }
};

const checkDependentQuestion = (event, questions) => {
  const answeredQuestionId = event.detail.questionId;
  const answer = event.detail.answer;

  const questionWithChangedAnswer = questions.find(
    (question) => question[questionFields.ID] === answeredQuestionId
  );
  const questionIndex = questions.findIndex(
    ( question ) => question[questionFields.ID] === answeredQuestionId
  );
  questions[questionIndex].Answer = answer;

  if (questionWithChangedAnswer.Related_Question_Validations__r != null) {
    questionWithChangedAnswer.Related_Question_Validations__r.forEach(
      (validation) => {
        let isConditionMet = compareValues(
          answer,
          validation[validationFields.OPERATOR],
          validation[validationFields.VALUE]
        );

        const dependentQuestion = questions.findIndex(
          (question) => question[questionFields.ID] === validation[validationFields.DEPENDANT]
        );

        if (isConditionMet === true) {
          questions[dependentQuestion][questionFields.VISIBLE] = true;
        } else {
          hideAnswerChain(questions, validation);
        }
      }
    );
  }
};

const createAnswers = (questions, groupAnswerId) => {
  let answers = [];
  questions.forEach((question) => {
      if(question.Answer){
        let createAnswer = true;
        if (question.isText && question[questionFields.VISIBLE] && question.Answer.trim().length === 0) {
            createAnswer = false;
        }
        if (createAnswer) {
          let singleAnswer = { SObjectType: "Answer__c" };
          singleAnswer[answerFields.GROUP] = groupAnswerId;
          singleAnswer[answerFields.QUESION] = question.Id;
    
          if (question[questionFields.TYPE] === questionTypes.CHECKBOX) {
            question.Answer.forEach((checkedBox) => {
              let singleCheckboxAnswer = { ...singleAnswer };
              singleCheckboxAnswer[answerFields.VALUE] = checkedBox;
              answers.push(singleCheckboxAnswer);
            });
          } else {
            singleAnswer[answerFields.VALUE] = question.Answer;
            answers.push(singleAnswer);
          }
        }
>>>>>>> develop
      }

  });

  return answers;
};

export {
  FIELDS,
  sortQuestionsByPosition,
  hideAnswerChain,
  compareValues,
  checkDependentQuestion,
  initQuestionFields,
  createAnswers
};