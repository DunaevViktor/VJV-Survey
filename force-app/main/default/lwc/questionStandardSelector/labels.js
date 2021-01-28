import question from "@salesforce/label/c.question";
import type from "@salesforce/label/c.type";
import options from "@salesforce/label/c.options";
import select from "@salesforce/label/c.select";
import back from "@salesforce/label/c.back";
import back_title from "@salesforce/label/c.back_title";
import none from "@salesforce/label/c.none";

const label = {
  question: question.slice(0,1).toUpperCase() + question.slice(1).toLowerCase(),
  type,
  options,
  select,
  back,
  back_title,
  none
}

export {
  label
}