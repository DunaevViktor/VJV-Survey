import question from "@salesforce/label/c.question";
import type from "@salesforce/label/c.type";
import options from "@salesforce/label/c.options";
import select from "@salesforce/label/c.select";
import back from "@salesforce/label/c.back";
import back_title from "@salesforce/label/c.back_title";
import none from "@salesforce/label/c.none";
import standard_questions from "@salesforce/label/c.standard_questions";
import previous_page from '@salesforce/label/c.previous_page';
import next_page from '@salesforce/label/c.next_page';

const label = {
  question: question.slice(0,1).toUpperCase() + question.slice(1).toLowerCase(),
  type,
  options,
  select,
  back,
  back_title,
  none,
  standard_questions,
  previous_page,
  next_page
}

export {
  label
}