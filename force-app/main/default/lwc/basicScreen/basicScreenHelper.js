import { surveyFields } from "c/fieldService";

const createSurveyDisplayedMap = (objectList) => {
    return objectList.map((element) => {
        return { label: element[surveyFields.NAME], value: element[surveyFields.ID] };
    });
}

export {
    createSurveyDisplayedMap
}