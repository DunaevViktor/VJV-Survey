const resetOptionsIds = (options) => {
  return options.map((option) => {
    option.Id = null;
    return option;
  });
}

const getQuestionsBySurveyId = (templateQuestions, surveyId, noTemplateValue) => {
  if (surveyId.localeCompare(noTemplateValue) === 0) {
    return [];
  } 

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
      question.IsVisible__c = true;
      question.IsReusable__c = false;

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

const solveQuestionPosition = (questions) => {
  questions = questions.filter((question) => {
    return !~question.Position__c.indexOf('.');
  }) 

  return '' + (+questions.length + 1);
}

const solveDependentQuestionPosition = (validations, question) => {
  const amount = validations.filter((validation) => {
    return validation.Related_Question__c.Position__c === question.Position__c
  }).length;
  return question.Position__c + "." + (+amount + 1);
}

const prepareSelectedQuestion = (selectedQuestion) => {
  const question = JSON.parse(JSON.stringify(selectedQuestion));
  question.IsReusable__c = false;
  question.Id = null;

  if(question.Question_Options__r) {
    question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
  }

  return question;
}

const resolvePositionByDeleted = (position, leftPart, rightPart) => {
  const leftPartLength = leftPart.length > 0 ? leftPart.length + 1 : 0;
  const itemPart = position.slice(leftPartLength);
    
  const itemIndex = itemPart.indexOf('.');
  const value = !~itemIndex ? itemPart : itemPart.slice(0, itemIndex);
    
  if(+value > +rightPart) {
    const itemRightPart = !~itemIndex ? '' : itemPart.slice(itemIndex);
    const itemLeftPart = leftPart.length > 0 ? leftPart + '.' : '';
        
    position = itemLeftPart + Math.round(+value - 1) + itemRightPart;
  }
  return position;
}

const resolveQuestionsByDeleted = (questions, position) => {
  const index = position.lastIndexOf('.');
  const leftPart = !~index ? '' : position.slice(0, index);
  const rightPart = !~index ? position : position.slice(index + 1);

  return questions.filter((question) => {
    return !question.Position__c.startsWith(position);
  })
  .map((question) => {
    if(question.Position__c.startsWith(leftPart)) {
      question.Position__c = resolvePositionByDeleted(
        question.Position__c, 
        leftPart, rightPart);
    }
    return question;
  });
};

const resolveValidationsByDeleted = (validations, position) => {
  const index = position.lastIndexOf('.');
  const leftPart = !~index ? '' : position.slice(0, index);
  const rightPart = !~index ? position : position.slice(index + 1);

  return validations.filter((validation) => {
    return !validation.Related_Question__c.Position__c.startsWith(position) &&
      !validation.Dependent_Question__c.Position__c.startsWith(position);
  })
  .map((validation) => {
    if(validation.Related_Question__c.Position__c.startsWith(leftPart)) {
      validation.Related_Question__c.Position__c = resolvePositionByDeleted(
        validation.Related_Question__c.Position__c, 
        leftPart, rightPart);
    }
    if(validation.Dependent_Question__c.Position__c.startsWith(leftPart)) {
      validation.Dependent_Question__c.Position__c = resolvePositionByDeleted(
        validation.Dependent_Question__c.Position__c, 
        leftPart, rightPart);
    }
    return validation;
  });
}

const resolveEditableQuestions = (questions, validations) => {
  return questions.map((question) => {

    const filteredValidations = validations.filter((validation) => {
      return validation.Related_Question__c.Position__c === question.Position__c;
    })

    if(filteredValidations.length === 0) question.Editable = true;

    return question;
  })
}

const prepareValidationForPush = (validations, newValidation) => {
  newValidation.Dependent_Question__c.Position__c = solveDependentQuestionPosition(
    validations, newValidation.Related_Question__c);
  newValidation.Dependent_Question__c.Editable = true;
  newValidation.Dependent_Question__c.IsVisible__c = false;
  newValidation.Related_Question__c.Editable = false;
  return newValidation;
}

const updatePosition = (position, upperPosition, downPosition) => {
  if(position.startsWith(upperPosition)) {
    const teil = position.slice(downPosition.length);
    return downPosition + teil;
  } else if(position.startsWith(downPosition)) {
    const teil = position.slice(upperPosition.length);
    return upperPosition + teil;
  }
  return position;
}

const swapQuestions = (questions, upperPosition, downPosition) => {
  return questions.map((question) => {
    question.Position__c = updatePosition(question.Position__c, upperPosition, downPosition)
    return question;
  });
}

const swapValidations = (validations, upperPosition, downPosition) => {
  return validations.map((validation) => {
    validation.Related_Question__c.Position__c = 
    updatePosition(validation.Related_Question__c.Position__c, upperPosition, downPosition);
    validation.Dependent_Question__c.Position__c = 
    updatePosition(validation.Dependent_Question__c.Position__c, upperPosition, downPosition);
    return validation;
  });
}

const findSwapIndex = (questions, position, action) => {
  const rightPart = position.slice(-1);
  const leftPart = position.slice(0, -1);
  let questionIndex;

  for(let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if(question.Position__c.startsWith(leftPart) && question.Position__c.length === position.length) {
      const currentRightPart = +question.Position__c.slice(-1);

      if(currentRightPart + (1 * action) === +rightPart) {
        questionIndex = i;
        break;
      }
    }
  }

  return questionIndex;
}

const sortQuestionsFunction = (firstItem, secondItem) => {
  const firstPosition = firstItem.Position__c;
  const secondPosition = secondItem.Position__c;

  let firstIndex = firstPosition.indexOf('.');
  let secondIndex = secondPosition.indexOf('.');
  
  if(!~firstIndex) firstIndex = firstPosition.length;
  if(!~secondIndex) secondIndex = secondPosition.length;
  
  const firstNumber = +firstPosition.slice(0, firstIndex);
  const secondNumber = +secondPosition.slice(0, secondIndex);

  if(firstNumber === secondNumber) {
    return firstPosition.localeCompare(secondPosition);
  } 

  return firstNumber - secondNumber;
}

export {
  getQuestionsBySurveyId,
  updateQuestionByPosition,
  resetOptionsIds,
  solveQuestionPosition,
  updateValidationByPosition,
  prepareSelectedQuestion,
  resolvePositionByDeleted,
  resolveQuestionsByDeleted,
  resolveValidationsByDeleted,
  prepareValidationForPush,
  swapQuestions,
  swapValidations,
  findSwapIndex,
  sortQuestionsFunction,
  resolveEditableQuestions
}