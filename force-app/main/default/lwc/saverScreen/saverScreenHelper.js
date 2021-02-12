import {findQuestionByPosition} from "c/formUtil";
import { ruleFields, receiverFields, questionFields, optionFields, validationFields } from "c/fieldService";

const transformRules = (rules, surveyId) => {
  return rules.map((rule) => {
    rule = JSON.parse(JSON.stringify(rule));
    rule[ruleFields.SURVEY] = surveyId;
    return rule;
  });
}

const transformQuestions = (questions, surveyId) => {
  return questions.map((question) => {
    question = JSON.parse(JSON.stringify(question));
    question[questionFields.SURVEY] = surveyId;
    return question;
  });
}

const transformOptions = (questions, savedQuestions) => {
  const options = [];

  for(let i = 0; i < questions.length; i++) {
    const question = questions[i];
     
    if(!question.Question_Options__r || question.Question_Options__r.length === 0) continue;

    const savedQuestion = findQuestionByPosition(savedQuestions, question[questionFields.POSITION]);

    question.Question_Options__r.forEach((option) => {
      option = JSON.parse(JSON.stringify(option));
      option[optionFields.QUESTION] = savedQuestion[questionFields.ID];
      options.push(option);
    });
  }

  return options;
}

const transformValidations = (validations, savedQuestions) => {
  if(validations === null || validations.length === 0) return [];

  const transformedValidations = [];

  validations.forEach((validation) => {
    validation = JSON.parse(JSON.stringify(validation));

    const relatedQuestion = findQuestionByPosition(
      savedQuestions, validation[validationFields.RELATED][questionFields.POSITION]);

    const dependantQuestion = findQuestionByPosition(
      savedQuestions, validation[validationFields.DEPENDENT][questionFields.POSITION]);

    validation[validationFields.RELATED] = relatedQuestion[questionFields.ID];
    validation[validationFields.DEPENDENT] = dependantQuestion[questionFields.ID];

    transformedValidations.push(validation);
  })

  return transformedValidations;
}

const transformEmailReceivers = (emailReceivers, surveyId) => {
  return emailReceivers.map((receiver) => {
    receiver = JSON.parse(JSON.stringify(receiver));
    receiver[receiverFields.SURVEY] = surveyId;
    return receiver;
  });
}

export {
  transformRules,
  transformQuestions,
  transformOptions,
  transformValidations,
  transformEmailReceivers
}