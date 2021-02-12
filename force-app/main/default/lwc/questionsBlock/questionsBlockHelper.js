import { questionFields } from "c/fieldService";

const isEmpty = (value) => {
  return value === "";
}

const trasnformQuestions = (questions) => {
  return questions.map((question) => {
    return {
      ...question,
      Key: question[questionFields.POSITION]
    }
  })
}

const filterQuestionsByPage = (questions, currentPage, amountOnPage) => {
  return questions.slice((currentPage-1) * amountOnPage, (currentPage) * amountOnPage);
}

const filterQuestionsBySearhTerm = (questions, keyword) => {
  return questions.filter(
    question => question[questionFields.LABEL].includes(keyword)
  );
}

const setInputValidation = (input, message) => {
  input.setCustomValidity(message);
  input.reportValidity();
}

const filterQuestionsByPosition = (questions, position) => {
  return questions.filter((question) => {
    return !question[questionFields.POSITION].startsWith(position);
  });
}

export {
  trasnformQuestions,
  isEmpty,
  filterQuestionsByPage,
  filterQuestionsBySearhTerm,
  setInputValidation,
  filterQuestionsByPosition
}