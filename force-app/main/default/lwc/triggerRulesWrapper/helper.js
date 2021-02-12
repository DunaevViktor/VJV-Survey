import { operatorTypes } from "c/formUtil";

const isFilledCompletely = (obj) => {
    let filledCompletely = true;
    for(let field in obj) {
      if(!obj[field] || obj[field] === "") {
        filledCompletely = false;
        break;
      }
    }
    return filledCompletely;
}

const areTriggerRulesFilledCompletely = (triggerRules) => {
    let completelyFilled = true;
    for (let i = 0; i < triggerRules.length; i++) {
      if(triggerRules[i].Operator__c && triggerRules[i].Operator__c === operatorTypes.ANY_CHANGE) {
        continue;
      }
      if(!isFilledCompletely(triggerRules[i])) {
        completelyFilled = false;
        break;
      }
    }
    return completelyFilled;
}

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

const areDuplicatesPresent = (triggerRules) => {  
    const triggerRulesInJSON = triggerRules.map(triggerRule => JSON.stringify(triggerRule));
    const res = new Set(triggerRulesInJSON).size !== triggerRulesInJSON.length;
    return res;
} 

export {
    areTriggerRulesFilledCompletely,
    isEmpty,
    areDuplicatesPresent
};