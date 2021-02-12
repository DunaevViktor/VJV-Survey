import { surveyFields } from "c/fieldService";

const transformDisplayesTypes = (templates) => {
  return templates.map((template) => {
    return {
      label: template[surveyFields.NAME],
      value: template[surveyFields.ID]
    };
  });
}

export {
  transformDisplayesTypes
}