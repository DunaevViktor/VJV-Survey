import { validationFields, questionFields, optionFields } from "c/fieldService";

const resetOptionsIds = (options) => {
  return options.map((option) => {
    option[optionFields.ID] = null;
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
        question[questionFields.SURVEY].localeCompare(surveyId) === 0
      );
    }
  ).map(
    (question, index) => {
      question[questionFields.ID] = null;
      question[questionFields.POSITION] = '' + (index + 1);
      question.Editable = true;
      question[questionFields.VISIBLE] = true;
      question[questionFields.REUSABLE] = false;

      if(question.Question_Options__r) {
        question.Question_Options__r = resetOptionsIds(question.Question_Options__r);
      }

      return JSON.parse(JSON.stringify(question));
    }
  );
}

const updateQuestionByPosition = (questions, position, updatedQuestion) => {
  return questions.map((question) => {
    if (question[questionFields.POSITION] === position) {
      return {
        ...updatedQuestion,
        [questionFields.POSITION]: position
      };
    }
    return question;
  });
}

const updateValidationByPosition = (validations, updatedValidation) => {
  return validations.map((validation) => {
    if (validation[validationFields.RELATED][questionFields.POSITION] 
        === updatedValidation[validationFields.RELATED][questionFields.POSITION] &&
        validation[validationFields.DEPENDANT][questionFields.POSITION] 
        === updatedValidation[validationFields.DEPENDANT][questionFields.POSITION]) {
      return {
        ...updatedValidation
      };
    }
    return validation;
  });
}

const solveQuestionPosition = (questions) => {
  questions = questions.filter((question) => {
    return !~question[questionFields.POSITION].indexOf('.');
  }) 

  return '' + (+questions.length + 1);
}

const solveDependentQuestionPosition = (validations, question) => {
  const amount = validations.filter((validation) => {
    return validation[validationFields.RELATED][questionFields.POSITION]  === question[questionFields.POSITION] 
  }).length;
  return question[questionFields.POSITION]  + "." + (+amount + 1);
}

const prepareSelectedQuestion = (selectedQuestion) => {
  const question = JSON.parse(JSON.stringify(selectedQuestion));
  question[questionFields.REUSABLE] = false;
  question[questionFields.ID] = null;

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
    return !question[questionFields.POSITION].startsWith(position);
  })
  .map((question) => {
    if(question[questionFields.POSITION].startsWith(leftPart)) {
      question[questionFields.POSITION] = resolvePositionByDeleted(
        question[questionFields.POSITION], 
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
    return !validation[validationFields.RELATED][questionFields.POSITION].startsWith(position) &&
      !validation[validationFields.DEPENDANT][questionFields.POSITION].startsWith(position);
  })
  .map((validation) => {
    if(validation[validationFields.RELATED][questionFields.POSITION].startsWith(leftPart)) {
      validation[validationFields.RELATED][questionFields.POSITION]= resolvePositionByDeleted(
        validation[validationFields.RELATED][questionFields.POSITION], 
        leftPart, rightPart);
    }
    if(validation[validationFields.DEPENDANT][questionFields.POSITION].startsWith(leftPart)) {
      validation[validationFields.DEPENDANT][questionFields.POSITION] = resolvePositionByDeleted(
        validation[validationFields.DEPENDANT][questionFields.POSITION], 
        leftPart, rightPart);
    }
    return validation;
  });
}

const resolveEditableQuestions = (questions, validations) => {
  return questions.map((question) => {

    const filteredValidations = validations.filter((validation) => {
      return validation[validationFields.RELATED][questionFields.POSITION] === question[questionFields.POSITION];
    })

    if(filteredValidations.length === 0) question.Editable = true;

    return question;
  })
}

const prepareValidationForPush = (validations, newValidation) => {
  newValidation[validationFields.DEPENDANT][questionFields.POSITION] = solveDependentQuestionPosition(
    validations, newValidation[validationFields.RELATED]);
  newValidation[validationFields.DEPENDANT].Editable = true;
  newValidation[validationFields.DEPENDANT][questionFields.VISIBLE] = false;
  newValidation[validationFields.RELATED].Editable = false;
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
    question[questionFields.POSITION] = updatePosition(question[questionFields.POSITION] , upperPosition, downPosition)
    return question;
  });
}

const swapValidations = (validations, upperPosition, downPosition) => {
  return validations.map((validation) => {
    validation[validationFields.RELATED][questionFields.POSITION] = 
    updatePosition(validation[validationFields.RELATED][questionFields.POSITION], upperPosition, downPosition);
    validation[validationFields.DEPENDANT][questionFields.POSITION] = 
    updatePosition(validation[validationFields.DEPENDANT][questionFields.POSITION], upperPosition, downPosition);
    return validation;
  });
}

const findSwapIndex = (questions, position, action) => {
  const rightPart = position.slice(-1);
  const leftPart = position.slice(0, -1);
  let questionIndex;

  for(let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if(question[questionFields.POSITION].startsWith(leftPart) 
      && question[questionFields.POSITION].length === position.length) {
      const currentRightPart = +question[questionFields.POSITION].slice(-1);

      if(currentRightPart + (1 * action) === +rightPart) {
        questionIndex = i;
        break;
      }
    }
  }

  return questionIndex;
}

const sortQuestionsFunction = (firstItem, secondItem) => {
  const firstPosition = firstItem[questionFields.POSITION];
  const secondPosition = secondItem[questionFields.POSITION];

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