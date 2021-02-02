const FIELDS = [
  "Survey__c.Id",
  "Survey__c.Name",
  "Survey__c.Description__c",
  "Survey__c.Logo__c",
  "Survey__c.Background_Color__c"
];

const initQuestionFields = (questions, data) => {
  questions = [];
  data.forEach((question) => {
    questions.push({ ...question });
  });

  questions.forEach((question) => {
    let fieldType = "is" + question.Type__c;
    question[fieldType] = true;
    let options = [];

    switch (question.Type__c) {
      case "Checkbox":
        question.Answer = [];
        break;
      case "Picklist":
        options = [{ label: "-- None --", value: null }];
        break;
      default:
    }

    if (question.Question_Options__r) {
      question.Question_Options__r.forEach((option) => {
        options.push({ label: option.Value__c, value: option.Value__c });
      });

      question.Question_Options__r = options;
    }
  });

  return questions;
};

const sortQuestionsByPosition = (questions) => {
  questions.sort(function (a, b) {
    return a.Position__c.localeCompare(b.Position__c, undefined, {
      numeric: true,
      sensitivity: "base"
    });
  });
  return questions;
};

const compareValues = (answerValue, operator, validationValue) => {
  let isConditionMet;
  switch (operator) {
    case "IS NULL":
      isConditionMet =
        String(
          answerValue == null || answerValue === undefined || answerValue === ""
        ) === validationValue;
      break;
    case "EQUALS":
      // eslint-disable-next-line eqeqeq
      isConditionMet = answerValue == validationValue;
      break;
    case "NOT EQUALS":
      isConditionMet = answerValue !== validationValue;
      break;
    case "CONTAINS":
      isConditionMet = answerValue.includes(validationValue);
      break;
    case "NOT CONTAINS":
      isConditionMet = !answerValue.includes(validationValue);
      break;
    case "LESS THAN":
      isConditionMet = parseFloat(answerValue) < parseFloat(validationValue);
      break;
    case "GREATER THAN":
      isConditionMet = parseFloat(answerValue) > parseFloat(validationValue);
      break;
    default:
      isConditionMet = false;
  }

  return isConditionMet;
};

const hideAnswerChain = (questions, validation) => {
  const dependentQuestion = questions.findIndex(
    (question) => question.Id === validation.Dependent_Question__c
  );
  questions[dependentQuestion].IsVisible__c = false;
  questions[dependentQuestion].Answer =
    questions[dependentQuestion].Type__c === "Checkbox" ? [] : null;
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
    ({ Id }) => Id === answeredQuestionId
  );
  const questionIndex = questions.findIndex(
    ({ Id }) => Id === answeredQuestionId
  );
  questions[questionIndex].Answer = answer;

  if (questionWithChangedAnswer.Related_Question_Validations__r != null) {
    questionWithChangedAnswer.Related_Question_Validations__r.forEach(
      (validation) => {
        let isConditionMet = compareValues(
          answer,
          validation.Operator__c,
          validation.Value__c
        );

        const dependentQuestion = questions.findIndex(
          (question) => question.Id === validation.Dependent_Question__c
        );
        if (isConditionMet === true) {
          questions[dependentQuestion].IsVisible__c = true;
        } else {
          hideAnswerChain(questions, validation);
        }
      }
    );
  }
};

const createAnswers = (questions, groupAnswerId, linkedRecordId) => {
  let answers = [];
  questions.forEach((question) => {
    if (question.Answer !== null && question.Answer !== undefined) {
      let singleAnswer = { SObjectType: "Answer__c" };
      singleAnswer.Group_Answer__c = groupAnswerId;
      singleAnswer.Question__c = question.Id;

      if (linkedRecordId !== null) {
        singleAnswer.IsLinked__c = true;
      } else {
        singleAnswer.IsLinked__c = false;
      }

      if (question.Type__c === "Checkbox") {
        question.Answer.forEach((checkedBox) => {
          let singleCheckboxAnswer = { ...singleAnswer };
          singleCheckboxAnswer.Value__c = checkedBox;
          answers.push(singleCheckboxAnswer);
        });
      } else {
        singleAnswer.Value__c = question.Answer;
        answers.push(singleAnswer);
      }
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