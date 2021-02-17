import { validationFields, questionFields, optionFields } from "c/fieldService";

const ZERO = 0;
const ONE = 1;
const ONE_NEG = -1;
const EMPTY_STRING = '';
const DOT = '.';

const trasnformResult = (result) => {
  return result.map((item) => {
    return {
      ...item.question,
      Question_Options__r: item.options
    }
  })
}

const resetOptionsIds = (options) => {
  return options.map((option) => {
    option[optionFields.ID] = null;
    return option;
  });
}

const getQuestionsBySurveyId = (templateQuestions, surveyId, noTemplateValue) => {
  if (!surveyId.localeCompare(noTemplateValue)) {
    return [];
  } 

  return templateQuestions.filter(
    (question) => {
      return !question[questionFields.SURVEY].localeCompare(surveyId);
    }
  ).map(
    (question, index) => {
      question[questionFields.ID] = null;
      question[questionFields.POSITION] = EMPTY_STRING + (index + ONE);
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
        validation[validationFields.DEPENDENT][questionFields.POSITION] 
        === updatedValidation[validationFields.DEPENDENT][questionFields.POSITION]) {
      return {
        ...updatedValidation
      };
    }
    return validation;
  });
}

const solveQuestionPosition = (questions) => {
  questions = questions.filter((question) => {
    return !~question[questionFields.POSITION].indexOf(DOT);
  }) 

  return EMPTY_STRING + (+questions.length + ONE);
}

const solveDependentQuestionPosition = (validations, question) => {
  const amount = validations.filter((validation) => {
    return validation[validationFields.RELATED][questionFields.POSITION]  === question[questionFields.POSITION] 
  }).length;
  return question[questionFields.POSITION]  + DOT + (+amount + ONE);
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
  const leftPartLength = leftPart.length ? leftPart.length + ONE : ZERO;
  const itemPart = position.slice(leftPartLength);
    
  const itemIndex = itemPart.indexOf(DOT);
  const value = !~itemIndex ? itemPart : itemPart.slice(ZERO, itemIndex);
    
  if(+value > +rightPart) {
    const itemRightPart = !~itemIndex ? EMPTY_STRING : itemPart.slice(itemIndex);
    const itemLeftPart = leftPart.length ? leftPart + DOT : EMPTY_STRING;
        
    position = itemLeftPart + Math.round(+value - ONE) + itemRightPart;
  }
  return position;
}

const resolveQuestionsByDeleted = (questions, position) => {
  const index = position.lastIndexOf(DOT);
  const leftPart = !~index ? EMPTY_STRING : position.slice(ZERO, index);
  const rightPart = !~index ? position : position.slice(index + ONE);

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
  const index = position.lastIndexOf(DOT);
  const leftPart = !~index ? EMPTY_STRING : position.slice(ZERO, index);
  const rightPart = !~index ? position : position.slice(index + ONE);

  return validations.filter((validation) => {
    return !validation[validationFields.RELATED][questionFields.POSITION].startsWith(position) &&
      !validation[validationFields.DEPENDENT][questionFields.POSITION].startsWith(position);
  })
  .map((validation) => {
    if(validation[validationFields.RELATED][questionFields.POSITION].startsWith(leftPart)) {
      validation[validationFields.RELATED][questionFields.POSITION]= resolvePositionByDeleted(
        validation[validationFields.RELATED][questionFields.POSITION], 
        leftPart, rightPart);
    }
    if(validation[validationFields.DEPENDENT][questionFields.POSITION].startsWith(leftPart)) {
      validation[validationFields.DEPENDENT][questionFields.POSITION] = resolvePositionByDeleted(
        validation[validationFields.DEPENDENT][questionFields.POSITION], 
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

    if(!filteredValidations.length) question.Editable = true;

    return question;
  })
}

const prepareValidationForPush = (validations, newValidation) => {
  newValidation[validationFields.DEPENDENT][questionFields.POSITION] = solveDependentQuestionPosition(
    validations, newValidation[validationFields.RELATED]);
  newValidation[validationFields.DEPENDENT].Editable = true;
  newValidation[validationFields.DEPENDENT][questionFields.VISIBLE] = false;
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
    validation[validationFields.DEPENDENT][questionFields.POSITION] = 
    updatePosition(validation[validationFields.DEPENDENT][questionFields.POSITION], upperPosition, downPosition);
    return validation;
  });
}

const findSwapIndex = (questions, position, action) => {
  const rightPart = position.slice(ONE_NEG);
  const leftPart = position.slice(ZERO, ONE_NEG);
  let questionIndex;

  for(let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if(question[questionFields.POSITION].startsWith(leftPart) 
      && question[questionFields.POSITION].length === position.length) {
      const currentRightPart = +question[questionFields.POSITION].slice(ONE_NEG);

      if(currentRightPart + (ONE * action) === +rightPart) {
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

  let firstIndex = firstPosition.indexOf(DOT);
  let secondIndex = secondPosition.indexOf(DOT);
  
  if(!~firstIndex) firstIndex = firstPosition.length;
  if(!~secondIndex) secondIndex = secondPosition.length;
  
  const firstNumber = +firstPosition.slice(ZERO, firstIndex);
  const secondNumber = +secondPosition.slice(ZERO, secondIndex);

  if(firstNumber === secondNumber) {
    return firstPosition.localeCompare(secondPosition);
  } 

  return firstNumber - secondNumber;
}

export {
  trasnformResult,
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