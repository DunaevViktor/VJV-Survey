import deleteTitle from "@salesforce/label/c.delete";
import down from "@salesforce/label/c.down";
import up from "@salesforce/label/c.up";
import edit from "@salesforce/label/c.edit";
import options from "@salesforce/label/c.options";
import add_dependent_question from "@salesforce/label/c.add_dependent_question";
import yes from "@salesforce/label/c.yes";
import no from "@salesforce/label/c.no";
import do_you_want_to_proceed from "@salesforce/label/c.do_you_want_to_proceed";
import add_optional_confirm_message from "@salesforce/label/c.add_optional_confirm_message";
import confirm_question_delete from "@salesforce/label/c.confirm_question_delete";
import confirm_action from "@salesforce/label/c.confirm_action";

const label = {
  deleteTitle,
  down,
  up,
  edit,
  options,
  add_dependent_question,
  yes,
  no,
  do_you_want_to_proceed,
  add_optional_full_confirm_message : add_optional_confirm_message + ' ' + do_you_want_to_proceed,
  confirm_question_delete_message: confirm_question_delete + ' ' + do_you_want_to_proceed,
  confirm_action
 }

export {
  label
};