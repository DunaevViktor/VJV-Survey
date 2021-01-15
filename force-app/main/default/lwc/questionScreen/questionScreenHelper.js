const transformDisplayesTypes = (displayedTemplates) => {
  return displayedTemplates.map((template) => {
    return {
      label: template.Name,
      value: template.Id
    };
  });
}

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
      return JSON.parse(JSON.stringify(question));
    }
  );
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

export {
  transformDisplayesTypes,
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  findQuestionsForDownSwap,
  findQuestionsForUpSwap
}