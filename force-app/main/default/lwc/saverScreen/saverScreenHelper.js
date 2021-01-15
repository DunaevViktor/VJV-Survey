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

    const savedQuestion = savedQuestions.filter((item) => {
      return item.Position__c === question.Position__c;
    })[0];

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

    const relatedQuestion = savedQuestions.filter((item) => {
      return item.Position__c === validation.Related_Question__c.Position__c;
    })[0];

    const dependantQuestion = savedQuestions.filter((item) => {
      return item.Position__c === validation.Dependent_Question__c.Position__c;
    })[0];

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