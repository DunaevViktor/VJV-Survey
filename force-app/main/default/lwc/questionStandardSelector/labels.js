import question from "@salesforce/label/c.question";
import type from "@salesforce/label/c.type";
import options from "@salesforce/label/c.options";
import select from "@salesforce/label/c.select";

const label = {
  question: question.slice(0,1).toUpperCase() + question.slice(1).toLowerCase(),
  type,
  options,
  select
}

export {
  label
}