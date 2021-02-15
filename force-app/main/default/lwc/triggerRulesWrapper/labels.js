import tip_for_user from "@salesforce/label/c.tip_for_user";
import add_trigger_rule from "@salesforce/label/c.add_trigger_rule";
import next from "@salesforce/label/c.next";
import previous from "@salesforce/label/c.previous";
import fill_trigger_rules from "@salesforce/label/c.fill_trigger_rules";
import restrict_duplicate_rules from "@salesforce/label/c.restrict_duplicate_rules";
import you_can_create from "@salesforce/label/c.you_can_create";
import trigger_rule from "@salesforce/label/c.trigger_rule";
import trigger_rules from "@salesforce/label/c.trigger_rules";
import more from "@salesforce/label/c.more";
import yes from "@salesforce/label/c.yes";
import no from "@salesforce/label/c.no";
import confirm_action from "@salesforce/label/c.confirm_action";
import do_you_want_to_proceed from "@salesforce/label/c.do_you_want_to_proceed";
import select_any_change_confirm_message from "@salesforce/label/c.select_any_change_confirm_message";

const importedLabels = {
    tip_for_user,
    add_trigger_rule,
    next,
    previous,
    fill_trigger_rules,
    restrict_duplicate_rules,
    you_can_create,
    trigger_rule,
    trigger_rules,
    more,
    yes,
    no,
    confirm_action,
    confirm_message : select_any_change_confirm_message + ' ' + do_you_want_to_proceed
}

export {
    importedLabels
}