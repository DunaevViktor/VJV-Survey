import { LightningElement, api, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { CurrentPageReference } from "lightning/navigation";
import getQuestions from "@salesforce/apex/AnswerFormController.getQuestions";
import saveGroupAnswer from "@salesforce/apex/GroupAnswerController.saveGroupAnswer";
import saveAnswers from "@salesforce/apex/AnswerController.saveAnswers";

import {
  FIELDS,
  sortQuestionsByPosition,
  checkDependentQuestion
} from "./answerFormHelper";

export default class AnswerForm extends LightningElement {
  currentPageReference;
  urlStateParameters;
  surveyId;

  @track answerInputs = [];

  @api linkedRecordId;

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlStateParameters = currentPageReference.state;
      this.setParametersBasedOnUrl();
    }
  }

  @wire(getRecord, { recordId: "$surveyId", fields: FIELDS })
  survey;

  connectedCallback() {
    this.getSurveyQuestions();
  }

  getSurveyQuestions() {
    getQuestions({ surveyId: this.surveyId })
      .then((result) => {
        result.forEach((question) => {
          this.answerInputs.push({ ...question });
        });
        this.answerInputs.forEach((question) => {
          let fieldType = "is" + question.Type__c;
          question[fieldType] = true;
          let options = [];

          switch (question.Type__c) {
            case "Checkbox":
              question.Answer = [];
              break;
            case "Picklist":
              options = [{ label: "-- None --", value: null }];
              break;
            default:
          }

          if (question.Question_Options__r) {
            question.Question_Options__r.forEach((option) => {
              options.push({ label: option.Value__c, value: option.Value__c });
            });
            question.Question_Options__r = options;
          }
        });

        this.answerInputs = sortQuestionsByPosition(this.answerInputs);
      })
      .catch((error) => {
        this.error = error;
      });
  }

  get title() {
    return this.survey.data.fields.Name.value;
  }

  get description() {
    return this.survey.data.fields.Description__c.value;
  }

  get logo() {
    return this.survey.data.fields.Logo__c.value;
  }

  get backgroundColor() {
    return (
      "background-color: " +
      this.survey.data.fields.Background_Color__c.value +
      ";"
    );
  }

  setParametersBasedOnUrl() {
    this.surveyId = this.urlStateParameters.c__surveyId;
  }

  handleAnswerChange(event) {
    checkDependentQuestion(event, this.answerInputs);
  }

  saveAnswers(groupAnswerId) {
    let answers = [];
    this.answerInputs.forEach((question) => {
      if (question.Answer !== null && question.Answer !== undefined) {
        let singleAnswer = { SObjectType: "Answer__c" };
        singleAnswer.Group_Answer__c = groupAnswerId;
        singleAnswer.Question__c = question.Id;

        if (question.Type__c === "Checkbox") {
          question.Answer.forEach((checkedBox) => {
            let singleCheckboxAnswer = { ...singleAnswer };
            singleCheckboxAnswer.Value__c = checkedBox;
            answers.push(singleCheckboxAnswer);
          });
        } else {
          singleAnswer.Value__c = question.Answer;
          answers.push(singleAnswer);
        }
      }
    });

    saveAnswers({ answers: answers })
      .then((result) => {
        console.debug(result);
      })
      .catch((error) => {
        this.error = error;
        console.debug(error);
      });
  }

  saveGroupAnswer() {
    let groupAnswer = { SObjectType: "Group_Answer__c" };
    const surveyId = this.survey.data.fields.Id.value;
    groupAnswer.Survey__c = surveyId;
    if (this.linkedRecordId !== null) {
      groupAnswer.IsLinked__c = true;
      groupAnswer.Related_To__c = this.linkedRecordId;
    }

    saveGroupAnswer({ groupAnswer: groupAnswer })
      .then((result) => {
        this.saveAnswers(result);
      })
      .catch((error) => {
        this.error = error;
        console.debug(error);
      });
  }
}