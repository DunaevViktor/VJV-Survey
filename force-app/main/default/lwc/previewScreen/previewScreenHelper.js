import { questionTypes } from "c/formUtil";
import { questionFields, optionFields } from "c/fieldService";
import { label } from "./labels.js";

const initQuestionFields = (data) => {
  let questions = [];
  data.forEach((question) => {
    if (question[questionFields.VISIBLE] === false) {
      question[questionFields.LABEL] += " (" + label.dependentQuestion + ")";
    }
    question[questionFields.VISIBLE] = true;
    question.IsDisabled = true;
    questions.push(question);
  });

  questions.forEach((question) => {
    let fieldType = "is" + question[questionFields.TYPE];
    question[fieldType] = true;
    question.Key = question[questionFields.POSITION]
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

export { initQuestionFields };