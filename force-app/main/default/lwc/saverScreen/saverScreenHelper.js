import {findQuestionByPosition} from "c/formUtil";

const transformRules = (rules, surveyId) => {
  return rules.map((rule) => {
    rule = JSON.parse(JSON.stringify(rule));
    rule.Survey__c = surveyId;
    return rule;
  });
}

const transformQuestions = (questions, surveyId) => {
  return questions.map((question) => {
    question = JSON.parse(JSON.stringify(question));
    question.Survey__c = surveyId;
    return question;
  });
}

const transformOptions = (questions, savedQuestions) => {
  const options = [];

  for(let i = 0; i < questions.length; i++) {
    const question = questions[i];
     
    if(question.Question_Options__r === null || question.Question_Options__r.length === 0) continue;

    const savedQuestion = findQuestionByPosition(savedQuestions, question.Position__c);

    question.Question_Options__r.forEach((option) => {
      option = JSON.parse(JSON.stringify(option));
      option.Question__c = savedQuestion.Id;
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

    const relatedQuestion = findQuestionByPosition(savedQuestions, validation.Related_Question__c.Position__c);

    const dependantQuestion = findQuestionByPosition(savedQuestions, validation.Dependent_Question__c.Position__c);

    validation.Related_Question__c = relatedQuestion.Id;
    validation.Dependent_Question__c = dependantQuestion.Id;

    transformedValidations.push(validation);
  })

  return transformedValidations;
}

export {
  transformRules,
  transformQuestions,
  transformOptions,
  transformValidations
}