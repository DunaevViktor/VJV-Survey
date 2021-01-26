const getQuestionsBySurveyId = (templateQuestions, surveyId) => {
  return templateQuestions.filter(
    (question) => {
      return (
        question.Survey__c.localeCompare(surveyId) === 0
      );
    }
  ).map(
    (question, index) => {
      question.Id = null;
      question.Position__c = index + 1;

      if(question.Question_Options__r) {
        question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
      }

      return JSON.parse(JSON.stringify(question));
    }
  );
}

const resetOptionsIds = (options) => {
  return options.map((option) => {
    option.Id = null;
    return option;
  });
}

const updateQuestionByPosition = (questions, position, updatedQuestion) => {
  return questions.map((question) => {
    if (+question.Position__c === +position) {
      return {
        ...updatedQuestion,
        Position__c: position
      };
    }
    return question;
  });
}

const findQuestionsForDownSwap = (questions, position) => {
  let relocatableQuestion, relocatableIndex;
  let lowerQuestion, lowerIndex;

  for(let i = 0; i < questions.length - 1; i++) {
    if (+questions[i].Position__c === position) {
      relocatableQuestion = questions[i];
      relocatableIndex = i;

      lowerQuestion = questions[i + 1];
      lowerIndex = i + 1;

      break;
    }
  }

  return {
    relocatableQuestion,
    relocatableIndex,
    lowerQuestion,
    lowerIndex
  }
}

const findQuestionsForUpSwap = (questions, position) => {
  let relocatableQuestion, relocatableIndex;
  let upperQuestion, upperIndex;

  for(let i = 1; i < questions.length; i++) {
    if (+questions[i].Position__c === position) {
      relocatableQuestion = questions[i];
      relocatableIndex = i;

      upperQuestion = questions[i - 1];
      upperIndex = i - 1;

      break;
    }
  }

  return {
    relocatableQuestion,
    relocatableIndex,
    upperQuestion,
    upperIndex
  }
}

const solveQuestionPosition = (questions) => {
  if (questions.length === 0) {
    return "1";
  } 

  return +questions[questions.length - 1].Position__c[0] + 1;
}

export {
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  findQuestionsForDownSwap,
  findQuestionsForUpSwap,
  resetOptionsIds,
  solveQuestionPosition
}