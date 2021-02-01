const isEmpty = (value) => {
  return value === "";
}

const filterQuestionsByPage = (questions, currentPage, amountOnPage) => {
  return questions.filter((item, index) => {
    return index >= (currentPage-1) * amountOnPage && index < (currentPage) * amountOnPage;
  });
}

const filterQuestionsBySearhTerm = (questions, keyword) => {
  return questions.filter(
    question => question.Label__c.includes(keyword)
  );
}

const setInputValidation = (input, message) => {
  input.setCustomValidity(message);
  input.reportValidity();
}

const filterQuestionsByPosition = (questions, position) => {
  return questions.filter((question) => {
    return !question.Position__c.startsWith(position);
  });
}

export {
  isEmpty,
  filterQuestionsByPage,
  filterQuestionsBySearhTerm,
  setInputValidation,
  filterQuestionsByPosition
}