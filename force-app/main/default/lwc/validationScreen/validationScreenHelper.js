const isValidNewValidation = (validations, newValidation) => {
  const fileteredValidations = validations.filter((validation) => {
      return (validation.Related_Question__c.Position__c === newValidation.Related_Question__c.Position__c  &&
            validation.Dependent_Question__c.Position__c === newValidation.Dependent_Question__c.Position__c) 
            || 
            (validation.Related_Question__c.Position__c === newValidation.Dependent_Question__c.Position__c  &&
            validation.Dependent_Question__c.Position__c === newValidation.Related_Question__c.Position__c) ;
  })
  return fileteredValidations.length === 0;
}

export {
  isValidNewValidation
}