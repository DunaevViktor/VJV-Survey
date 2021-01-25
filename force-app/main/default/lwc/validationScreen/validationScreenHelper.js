const isValidNewValidation = (validations, newValidation) => {
  const newRelatedPosition = newValidation.Related_Question__c.Position__c;
  const newDependentPosition = newValidation.Dependent_Question__c.Position__c;

  const fileteredValidations = validations.filter((validation) => {
    const currentRelatedPosition = validation.Related_Question__c.Position__c;
    const currentDependetPosition = validation.Dependent_Question__c.Position__c;
      return (currentRelatedPosition === newRelatedPosition  &&
            currentDependetPosition === newDependentPosition) 
            || 
            (currentRelatedPosition === newDependentPosition  &&
            currentDependetPosition === currentRelatedPosition) ;
  });

  return fileteredValidations.length === 0;
};

const solveMaxValidationAmount = (questionsAmount) => {
  const PAIR = 2;
  return (solveFactorial(questionsAmount) / (solveFactorial(questionsAmount - 2) * 2));
}

const solveFactorial = (n) => {
  let result = n;
  while(n > 1) {
    result *= n;
    n--;
  }
  return result;
}

export {
  isValidNewValidation,
  solveMaxValidationAmount
}