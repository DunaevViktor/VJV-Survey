import save_main_survey_info_label from "@salesforce/label/c.save_main_survey_info_label";
import save_trigger_rules_label from "@salesforce/label/c.save_trigger_rules_label";
import save_questions_label from "@salesforce/label/c.save_questions_label";
import save_validations_label from "@salesforce/label/c.save_validations_label";
import save_email_rules_label from "@salesforce/label/c.save_email_rules_label";

const stepsOfSave = [
  {
    label: save_main_survey_info_label,
    isDone: false
  },
  {
    label: save_trigger_rules_label,
    isDone: false
  },
  {
    label: save_questions_label,
    isDone: false
  },
  {
    label: save_validations_label,
    isDone: false
  },
  {
    label: save_email_rules_label,
    isDone: false
  }
];

const navigationType = "standard__navItemPage";

export {
  stepsOfSave,
  navigationType
}