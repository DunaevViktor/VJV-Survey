const resetOptionsIds = (options) => {
  return options.map((option) => {
    option.Id = null;
    return option;
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
      question.Position__c = '' + (index + 1);
      question.Editable = true;

      if(question.Question_Options__r) {
        question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
      }

      return JSON.parse(JSON.stringify(question));
    }
  );
}

const updateQuestionByPosition = (questions, position, updatedQuestion) => {
  return questions.map((question) => {
    if (question.Position__c === position) {
      return {
        ...updatedQuestion,
        Position__c: position
      };
    }
    return question;
  });
}

const updateValidationByPosition = (validations, updatedValidation) => {
  return validations.map((validation) => {
    if (validation.Related_Question__c.Position__c === updatedValidation.Related_Question__c.Position__c &&
        validation.Dependent_Question__c.Position__c === updatedValidation.Dependent_Question__c.Position__c) {
      return {
        ...updatedValidation
      };
    }
    return validation;
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

  return ""  + (+questions[questions.length - 1].Position__c[0] + 1);
}

const solveDependentQuestionPosition = (validations, question) => {
  const amount = validations.filter((validation) => {
    return validation.Related_Question__c.Position__c === question.Position__c
  }).length;
  return question.Position__c + "." + (+amount + 1);
}

const resolvePositionByDeleted = (position, leftPart, rightPart) => {
  const index = leftPart.length;
  const value = position[index]; 
  if(value && value > +rightPart) {
    position = position.slice(0, index) + (value - 1) + position.slice(index + 1);
  }
  return position;
}

const resolveQuestionsByDeleted = (questions, position) => {
  const leftPart = position.slice(0, -1);
  const rightPart = position.slice(-1);

  return questions.filter((question) => {
    return !question.Position__c.startsWith(position);
  }).map((question) => {
    if(question.Position__c.startsWith(leftPart)) {
      question.Position__c = resolvePositionByDeleted(
        question.Position__c, 
        leftPart, rightPart);
    }
    return question;
  });
};

const resolveValidationsByDeleted = (validations, position) => {
  const leftPart = position.slice(0, -1);
  const rightPart = position.slice(-1);

  return validations.filter((validation) => {
    return !validation.Related_Question__c.Position__c.startsWith(position) &&
      !validation.Dependent_Question__c.Position__c.startsWith(position);
  }).map((validation) => {
    if(validation.Related_Question__c.Position__c.startsWith(leftPart)) {
      validation.Related_Question__c.Position__c = resolvePositionByDeleted(
        validation.Related_Question__c.Position__c, 
        leftPart, rightPart);
    } else if (validation.Dependent_Question__c.Position__c.startsWith(leftPart)) {
      validation.Dependent_Question__c.Position__c = resolvePositionByDeleted(
        validation.Dependent_Question__c.Position__c, 
        leftPart, rightPart);
    }
    return validation;
  });
}

const prepareValidationForPush = (validations, newValidation) => {
  newValidation.Dependent_Question__c.Position__c = solveDependentQuestionPosition(
    validations, newValidation.Related_Question__c);
  newValidation.Dependent_Question__c.Editable = true;
  newValidation.Related_Question__c.Editable = false;
  return newValidation;
}

export {
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  findQuestionsForDownSwap,
  findQuestionsForUpSwap,
  resetOptionsIds,
  solveQuestionPosition,
  solveDependentQuestionPosition,
  updateValidationByPosition,
  resolvePositionByDeleted,
  resolveQuestionsByDeleted,
  resolveValidationsByDeleted,
  prepareValidationForPush
}